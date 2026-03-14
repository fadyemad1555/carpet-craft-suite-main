import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProducts, type Product, type ProductInput } from "@/hooks/useProducts";

const categories = ["يدوي", "ماكينة", "تركي", "فارسي", "صيني"];
const types = ["قطعة", "رول"];

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || p.brand.includes(search);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: ProductInput = {
      name: fd.get("name") as string,
      brand: fd.get("brand") as string,
      category: fd.get("category") as string || "تركي",
      size: fd.get("size") as string,
      type: fd.get("type") as string || "قطعة",
      color: fd.get("color") as string,
      material: fd.get("material") as string,
      purchase_price: Number(fd.get("purchase_price")),
      sale_price: Number(fd.get("sale_price")),
      quantity: Number(fd.get("quantity")),
    };
    let ok: boolean;
    if (editProduct) {
      ok = await updateProduct(editProduct.id, data);
    } else {
      ok = await addProduct(data);
    }
    setSaving(false);
    if (ok) {
      setDialogOpen(false);
      setEditProduct(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">إدارة المنتجات</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> إضافة منتج</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid gap-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>اسم المنتج</Label><Input name="name" defaultValue={editProduct?.name} required /></div>
                <div><Label>الماركة / المنشأ</Label><Input name="brand" defaultValue={editProduct?.brand} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>التصنيف</Label>
                  <select name="category" defaultValue={editProduct?.category || "تركي"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><Label>المقاس</Label><Input name="size" defaultValue={editProduct?.size} placeholder="مثال: ٢×٣" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>النوع</Label>
                  <select name="type" defaultValue={editProduct?.type || "قطعة"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>اللون</Label><Input name="color" defaultValue={editProduct?.color} required /></div>
                <div><Label>الخامة</Label><Input name="material" defaultValue={editProduct?.material} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>سعر الشراء</Label><Input name="purchase_price" type="number" defaultValue={editProduct?.purchase_price} required /></div>
                <div><Label>سعر البيع</Label><Input name="sale_price" type="number" defaultValue={editProduct?.sale_price} required /></div>
                <div><Label>الكمية</Label><Input name="quantity" type="number" defaultValue={editProduct?.quantity} required /></div>
              </div>
              <Button type="submit" className="mt-2" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {editProduct ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو الماركة..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">كل التصنيفات</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-medium text-muted-foreground">المنتج</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">التصنيف</th>
                    <th className="p-3 text-right font-medium text-muted-foreground hidden sm:table-cell">المقاس</th>
                    <th className="p-3 text-right font-medium text-muted-foreground hidden md:table-cell">سعر الشراء</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">سعر البيع</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">الكمية</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">لا توجد منتجات</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="block text-xs text-muted-foreground">{p.brand} - {p.color} - {p.material}</span>
                        </div>
                      </td>
                      <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                      <td className="p-3 hidden sm:table-cell">{p.size}</td>
                      <td className="p-3 hidden md:table-cell">{p.purchase_price} ج.م</td>
                      <td className="p-3 font-semibold text-accent">{p.sale_price} ج.م</td>
                      <td className="p-3">
                        <Badge variant={p.quantity <= 5 ? "destructive" : "secondary"}>
                          {p.quantity} {p.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(p); setDialogOpen(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
