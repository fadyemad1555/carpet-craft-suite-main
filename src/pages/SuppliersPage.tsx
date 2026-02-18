import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, FileText, Phone, MapPin } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  openingBalance: number;
  totalPurchases: number;
  totalPayments: number;
}

const initialSuppliers: Supplier[] = [
  { id: 1, name: "شركة النور للسجاد", phone: "01012345678", address: "القاهرة - شارع الأزهر", openingBalance: 5000, totalPurchases: 45000, totalPayments: 40000 },
  { id: 2, name: "مصنع الحرير الذهبي", phone: "01123456789", address: "المحلة الكبرى", openingBalance: 0, totalPurchases: 32000, totalPayments: 32000 },
  { id: 3, name: "واردات اسطنبول", phone: "01234567890", address: "الإسكندرية - محطة الرمل", openingBalance: 12000, totalPurchases: 78000, totalPayments: 70000 },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) => s.name.includes(search) || s.phone.includes(search));

  const getBalance = (s: Supplier) => s.openingBalance + s.totalPurchases - s.totalPayments;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      address: fd.get("address") as string,
      openingBalance: Number(fd.get("openingBalance")),
      totalPurchases: editSupplier?.totalPurchases || 0,
      totalPayments: editSupplier?.totalPayments || 0,
    };
    if (editSupplier) {
      setSuppliers((prev) => prev.map((s) => (s.id === editSupplier.id ? { ...data, id: editSupplier.id } : s)));
    } else {
      setSuppliers((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setDialogOpen(false);
    setEditSupplier(null);
  };

  const handleDelete = (id: number) => setSuppliers((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">إدارة الموردين</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditSupplier(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> إضافة مورد</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editSupplier ? "تعديل المورد" : "إضافة مورد جديد"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="grid gap-3 mt-2">
              <div><Label>الاسم</Label><Input name="name" defaultValue={editSupplier?.name} required /></div>
              <div><Label>الهاتف</Label><Input name="phone" defaultValue={editSupplier?.phone} required /></div>
              <div><Label>العنوان</Label><Input name="address" defaultValue={editSupplier?.address} required /></div>
              <div><Label>الرصيد الافتتاحي</Label><Input name="openingBalance" type="number" defaultValue={editSupplier?.openingBalance || 0} /></div>
              <Button type="submit">{editSupplier ? "حفظ" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      {/* Supplier detail dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={(o) => { if (!o) setSelectedSupplier(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>كشف حساب: {selectedSupplier?.name}</DialogTitle></DialogHeader>
          {selectedSupplier && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> {selectedSupplier.phone}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {selectedSupplier.address}</div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">إجمالي المشتريات</p><p className="text-lg font-bold text-foreground">{selectedSupplier.totalPurchases} ج.م</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">إجمالي المدفوعات</p><p className="text-lg font-bold text-success">{selectedSupplier.totalPayments} ج.م</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">الرصيد الافتتاحي</p><p className="text-lg font-bold">{selectedSupplier.openingBalance} ج.م</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">الرصيد المتبقي</p><p className="text-lg font-bold text-destructive">{getBalance(selectedSupplier)} ج.م</p></CardContent></Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-medium text-muted-foreground">المورد</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">الهاتف</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">المشتريات</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">المدفوعات</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">الرصيد</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3"><span className="font-medium">{s.name}</span><span className="block text-xs text-muted-foreground">{s.address}</span></td>
                    <td className="p-3 text-muted-foreground">{s.phone}</td>
                    <td className="p-3">{s.totalPurchases} ج.م</td>
                    <td className="p-3 text-success">{s.totalPayments} ج.م</td>
                    <td className="p-3"><Badge variant={getBalance(s) > 0 ? "destructive" : "secondary"}>{getBalance(s)} ج.م</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSupplier(s)}><FileText className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditSupplier(s); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
