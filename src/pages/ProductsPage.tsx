import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  size: string;
  type: string;
  color: string;
  material: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
}

const initialProducts: Product[] = [
  { id: 1, name: "سجادة كلاسيك", brand: "تركي", category: "تركي", size: "٢×٣", type: "قطعة", color: "أحمر", material: "صوف", purchasePrice: 1200, salePrice: 1800, quantity: 15 },
  { id: 2, name: "سجادة حرير", brand: "فارسي", category: "فارسي", size: "٣×٤", type: "قطعة", color: "أزرق", material: "حرير", purchasePrice: 3500, salePrice: 5200, quantity: 3 },
  { id: 3, name: "موكيت فاخر", brand: "مصري", category: "ماكينة", size: "عرض ٤م", type: "رول", color: "بيج", material: "بوليستر", purchasePrice: 150, salePrice: 250, quantity: 45 },
  { id: 4, name: "سجادة يدوية", brand: "إيراني", category: "يدوي", size: "٤×٦", type: "قطعة", color: "عنابي", material: "صوف", purchasePrice: 8000, salePrice: 12000, quantity: 2 },
  { id: 5, name: "سجادة مودرن", brand: "تركي", category: "تركي", size: "٢×٣", type: "قطعة", color: "رمادي", material: "أكريليك", purchasePrice: 800, salePrice: 1400, quantity: 22 },
];

const categories = ["يدوي", "ماكينة", "تركي", "فارسي", "صيني"];
const types = ["قطعة", "رول"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || p.brand.includes(search);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Omit<Product, "id"> = {
      name: fd.get("name") as string,
      brand: fd.get("brand") as string,
      category: fd.get("category") as string || "تركي",
      size: fd.get("size") as string,
      type: fd.get("type") as string || "قطعة",
      color: fd.get("color") as string,
      material: fd.get("material") as string,
      purchasePrice: Number(fd.get("purchasePrice")),
      salePrice: Number(fd.get("salePrice")),
      quantity: Number(fd.get("quantity")),
    };
    if (editProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? { ...data, id: editProduct.id } : p)));
    } else {
      setProducts((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setDialogOpen(false);
    setEditProduct(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">إدارة المنتجات</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid gap-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>اسم المنتج</Label>
                  <Input name="name" defaultValue={editProduct?.name} required />
                </div>
                <div>
                  <Label>الماركة / المنشأ</Label>
                  <Input name="brand" defaultValue={editProduct?.brand} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>التصنيف</Label>
                  <select name="category" defaultValue={editProduct?.category || "تركي"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>المقاس</Label>
                  <Input name="size" defaultValue={editProduct?.size} placeholder="مثال: ٢×٣" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>النوع</Label>
                  <select name="type" defaultValue={editProduct?.type || "قطعة"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>اللون</Label>
                  <Input name="color" defaultValue={editProduct?.color} required />
                </div>
                <div>
                  <Label>الخامة</Label>
                  <Input name="material" defaultValue={editProduct?.material} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>سعر الشراء</Label>
                  <Input name="purchasePrice" type="number" defaultValue={editProduct?.purchasePrice} required />
                </div>
                <div>
                  <Label>سعر البيع</Label>
                  <Input name="salePrice" type="number" defaultValue={editProduct?.salePrice} required />
                </div>
                <div>
                  <Label>الكمية</Label>
                  <Input name="quantity" type="number" defaultValue={editProduct?.quantity} required />
                </div>
              </div>
              <Button type="submit" className="mt-2">{editProduct ? "حفظ التعديلات" : "إضافة"}</Button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-medium text-muted-foreground">المنتج</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">التصنيف</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">المقاس</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">سعر الشراء</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">سعر البيع</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">الكمية</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">{p.brand} - {p.color} - {p.material}</span>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                    <td className="p-3">{p.size}</td>
                    <td className="p-3">{p.purchasePrice} ج.م</td>
                    <td className="p-3 font-semibold text-accent">{p.salePrice} ج.م</td>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
