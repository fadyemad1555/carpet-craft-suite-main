import { useEffect, useState, useCallback } from "react";
import { syncPendingOps, getPendingOps, isOnline } from "@/utils/offlineStorage";
import { useToast } from "@/hooks/use-toast";

export function useOfflineSync() {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(getPendingOps().length);
  const { toast } = useToast();

  const sync = useCallback(async () => {
    if (!isOnline()) return;
    const pending = getPendingOps();
    if (pending.length === 0) return;

    const { synced, failed } = await syncPendingOps();
    setPendingCount(getPendingOps().length);

    if (synced > 0) {
      toast({ title: "تمت المزامنة", description: `تم مزامنة ${synced} عملية بنجاح` });
    }
    if (failed > 0) {
      toast({ title: "تنبيه", description: `فشل مزامنة ${failed} عملية`, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast({ title: "متصل بالإنترنت", description: "جاري مزامنة البيانات..." });
      sync();
    };
    const handleOffline = () => {
      setOnline(false);
      toast({ title: "غير متصل", description: "النظام يعمل في وضع أوفلاين", variant: "destructive" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Try sync on mount
    sync();

    // Periodic sync every 30 seconds
    const interval = setInterval(() => {
      setPendingCount(getPendingOps().length);
      sync();
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [sync, toast]);

  return { online, pendingCount, sync };
}
