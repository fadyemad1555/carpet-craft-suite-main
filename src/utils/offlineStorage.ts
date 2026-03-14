// Offline-first storage utility
// Saves data locally and syncs with Supabase when online

import { supabase } from "@/integrations/supabase/client";

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

export function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// Queue for pending operations when offline
interface PendingOp {
  id: string;
  table: string;
  type: "insert" | "update" | "delete";
  data?: Record<string, unknown>;
  recordId?: string;
  timestamp: number;
}

const PENDING_KEY = "pending_sync_ops";

export function getPendingOps(): PendingOp[] {
  return getLocal<PendingOp[]>(PENDING_KEY, []);
}

export function addPendingOp(op: Omit<PendingOp, "id" | "timestamp">) {
  const ops = getPendingOps();
  ops.push({ ...op, id: crypto.randomUUID(), timestamp: Date.now() });
  setLocal(PENDING_KEY, ops);
}

export function removePendingOp(id: string) {
  const ops = getPendingOps().filter((o) => o.id !== id);
  setLocal(PENDING_KEY, ops);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

// Sync pending operations with Supabase
export async function syncPendingOps(): Promise<{ synced: number; failed: number }> {
  if (!isOnline()) return { synced: 0, failed: 0 };

  const ops = getPendingOps();
  let synced = 0;
  let failed = 0;

  for (const op of ops) {
    try {
      let error: unknown = null;

      if (op.type === "insert" && op.data) {
        const res = await supabase.from(op.table as "products").insert(op.data as any);
        error = res.error;
      } else if (op.type === "update" && op.data && op.recordId) {
        const res = await supabase.from(op.table as "products").update(op.data as any).eq("id", op.recordId);
        error = res.error;
      } else if (op.type === "delete" && op.recordId) {
        const res = await supabase.from(op.table as "products").delete().eq("id", op.recordId);
        error = res.error;
      }

      if (!error) {
        removePendingOp(op.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

// Fetch from Supabase and cache locally
export async function fetchAndCache<T>(
  table: string,
  cacheKey: string,
  orderBy?: string
): Promise<{ data: T[]; fromCache: boolean }> {
  if (isOnline()) {
    try {
      let query = supabase.from(table as "products").select("*");
      if (orderBy) {
        query = query.order(orderBy, { ascending: false });
      }
      const { data, error } = await query;
      if (!error && data) {
        setLocal(cacheKey, data);
        return { data: data as T[], fromCache: false };
      }
    } catch {}
  }

  // Fallback to cache
  const cached = getLocal<T[]>(cacheKey, []);
  return { data: cached, fromCache: true };
}
