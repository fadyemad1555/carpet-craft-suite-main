import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getLocal, setLocal, isOnline, addPendingOp } from "@/utils/offlineStorage";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  type: string;
  color: string;
  material: string;
  purchase_price: number;
  sale_price: number;
  quantity: number;
}

export type ProductInput = Omit<Product, "id">;

const CACHE_KEY = "cached_products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(getLocal(CACHE_KEY, []));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    size: p.size,
    type: p.type,
    color: p.color,
    material: p.material,
    purchase_price: Number(p.purchase_price),
    sale_price: Number(p.sale_price),
    quantity: Number(p.quantity),
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    if (isOnline()) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = data.map(mapProduct);
        setProducts(mapped);
        setLocal(CACHE_KEY, mapped);
      } else {
        // Fallback to cache
        setProducts(getLocal(CACHE_KEY, []));
        if (error) toast({ title: "تنبيه", description: "تم تحميل البيانات من الذاكرة المحلية", variant: "destructive" });
      }
    } else {
      setProducts(getLocal(CACHE_KEY, []));
    }

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (input: ProductInput) => {
    const newId = crypto.randomUUID();
    const newProduct: Product = { ...input, id: newId };

    // Update local state and cache immediately
    const updated = [newProduct, ...products];
    setProducts(updated);
    setLocal(CACHE_KEY, updated);

    if (isOnline()) {
      const { error } = await supabase.from("products").insert({ ...input, id: newId });
      if (error) {
        addPendingOp({ table: "products", type: "insert", data: { ...input, id: newId } });
        toast({ title: "محفوظ محلياً", description: "سيتم المزامنة عند الاتصال بالإنترنت" });
      } else {
        toast({ title: "تم", description: "تمت إضافة المنتج بنجاح" });
      }
    } else {
      addPendingOp({ table: "products", type: "insert", data: { ...input, id: newId } });
      toast({ title: "محفوظ محلياً", description: "سيتم المزامنة عند الاتصال بالإنترنت" });
    }
    return true;
  };

  const updateProduct = async (id: string, input: ProductInput) => {
    const updated = products.map((p) => (p.id === id ? { ...input, id } : p));
    setProducts(updated);
    setLocal(CACHE_KEY, updated);

    if (isOnline()) {
      const { error } = await supabase.from("products").update(input).eq("id", id);
      if (error) {
        addPendingOp({ table: "products", type: "update", data: input, recordId: id });
        toast({ title: "محفوظ محلياً", description: "سيتم المزامنة عند الاتصال بالإنترنت" });
      } else {
        toast({ title: "تم", description: "تم تعديل المنتج بنجاح" });
      }
    } else {
      addPendingOp({ table: "products", type: "update", data: input, recordId: id });
      toast({ title: "محفوظ محلياً", description: "سيتم المزامنة عند الاتصال بالإنترنت" });
    }
    return true;
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setLocal(CACHE_KEY, updated);

    if (isOnline()) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        addPendingOp({ table: "products", type: "delete", recordId: id });
      }
    } else {
      addPendingOp({ table: "products", type: "delete", recordId: id });
    }
    toast({ title: "تم", description: "تم حذف المنتج بنجاح" });
    return true;
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
