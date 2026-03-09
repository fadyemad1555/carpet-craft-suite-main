import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Eye, Printer, Pencil } from "lucide-react";
import { printInvoice } from "@/utils/printInvoice";

interface PurchaseItem {
  productName: string;
  quantity: number;
  cost: number;
}

interface PurchaseInvoice {
  id: number;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  total: number;
  paid: number;
  paymentMethod: string;
}

const initialInvoices: PurchaseInvoice[] = [
  { id: 2001, date: "٢٠٢٥-٠٢-١٠", supplier: "شركة النور للسجاد", items: [{ productName: "سجادة كلاسيك ٢×٣", quantity: 10, cost: 1200 }], total: 12000, paid: 10000, paymentMethod: "تحويل بنكي" },
  { id: 2002, date: "٢٠٢٥-٠٢-٠٨", supplier: "واردات اسطنبول", items: [{ productName: "سجادة تركية ٣×٤", quantity: 5, cost: 3500 }], total: 17500, paid: 17500, paymentMethod: "كاش" },
];

const paymentMethods = ["كاش", "فيزا", "فودافون كاش", "إنستاباي", "تحويل بنكي"];

export default function PurchasesPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<PurchaseInvoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<PurchaseInvoice | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([{ productName: "", quantity: 1, cost: 0 }]);

  const filtered = invoices.filter((i) => String(i.id).includes(search) || i.supplier.includes(search));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const total = items.reduce((s, i) => s + i.quantity * i.cost, 0);

    if (editInvoice) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editInvoice.id
            ? { ...inv, supplier: fd.get("supplier") as string, items: [...items], total, paid: Number(fd.get("paid")), paymentMethod: fd.get("paymentMethod") as string }
            : inv
        )
      );
      setEditInvoice(null);
    } else {
      const invoice: PurchaseInvoice = {
        id: Date.now(),
        date: new Date().toLocaleDateString("ar-EG"),
        supplier: fd.get("supplier") as string,
        items: [...items],
        total,
        paid: Number(fd.get("paid")),
        paymentMethod: fd.get("paymentMethod") as string,
      };
      setInvoices((prev) => [invoice, ...prev]);
    }
    setDialogOpen(false);
    setItems([{ productName: "", quantity: 1, cost: 0 }]);
  };

  const handleEdit = (inv: PurchaseInvoice) => {
    setEditInvoice(inv);
    setItems([...inv.items]);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handlePrint = (inv: PurchaseInvoice) => {
    printInvoice({
      type: "purchase",
      id: inv.id,
      date: inv.date,
      supplier: inv.supplier,
      items: inv.items.map((it) => ({ productName: it.productName, quantity: it.quantity, cost: it.cost })),
      total: inv.total,
      paid: inv.paid,
      paymentMethod: inv.paymentMethod,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">فواتير الشراء</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditInvoice(null); setItems([{ productName: "", quantity: 1, cost: 0 }]); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> فاتورة شراء جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editInvoice ? "تعديل الفاتورة" : "فاتورة شراء جديدة"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-3 mt-2">
              <div><Label>المورد</Label><Input name="supplier" required placeholder="اسم المورد" defaultValue={editInvoice?.supplier ?? ""} /></div>
              <div className="space-y-2">
                <Label className="font-semibold">المنتجات</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1"><Input placeholder="اسم المنتج" value={item.productName} onChange={(e) => { const n = [...items]; n[idx].productName = e.target.value; setItems(n); }} required /></div>
                    <div className="w-16"><Input type="number" placeholder="كمية" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} required /></div>
                    <div className="w-24"><Input type="number" placeholder="التكلفة" value={item.cost} onChange={(e) => { const n = [...items]; n[idx].cost = Number(e.target.value); setItems(n); }} required /></div>
                    {items.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive shrink-0" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { productName: "", quantity: 1, cost: 0 }])}>+ إضافة منتج</Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>المبلغ المدفوع</Label><Input name="paid" type="number" defaultValue={editInvoice?.paid ?? 0} required /></div>
                <div><Label>طريقة الدفع</Label>
                  <select name="paymentMethod" defaultValue={editInvoice?.paymentMethod} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <span className="text-sm text-muted-foreground">الإجمالي: </span>
                <span className="text-lg font-bold text-accent">{items.reduce((s, i) => s + i.quantity * i.cost, 0)} ج.م</span>
              </div>
              <Button type="submit" className="w-full">{editInvoice ? "تحديث الفاتورة" : "حفظ الفاتورة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      <Dialog open={!!viewInvoice} onOpenChange={(o) => { if (!o) setViewInvoice(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>فاتورة شراء #{viewInvoice?.id}</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-3 mt-2 text-sm">
              <p>المورد: <span className="font-semibold">{viewInvoice.supplier}</span></p>
              <p className="text-muted-foreground">التاريخ: {viewInvoice.date}</p>
              <div className="overflow-x-auto">
                <table className="w-full"><thead><tr className="border-b"><th className="pb-1 text-right">المنتج</th><th className="pb-1 text-right">الكمية</th><th className="pb-1 text-right">التكلفة</th><th className="pb-1 text-right">المجموع</th></tr></thead>
                  <tbody>{viewInvoice.items.map((it, i) => (<tr key={i} className="border-b border-border/30"><td className="py-2">{it.productName}</td><td className="py-2">{it.quantity}</td><td className="py-2">{it.cost}</td><td className="py-2">{it.quantity * it.cost}</td></tr>))}</tbody>
                </table>
              </div>
              <p className="font-bold text-accent">الإجمالي: {viewInvoice.total} ج.م</p>
              <p>المدفوع: {viewInvoice.paid} ج.م</p>
              {viewInvoice.total - viewInvoice.paid > 0 && <p className="text-destructive">المتبقي: {viewInvoice.total - viewInvoice.paid} ج.م</p>}
              <Button onClick={() => handlePrint(viewInvoice)} variant="outline" className="w-full gap-2 mt-2">
                <Printer className="h-4 w-4" /> طباعة الفاتورة
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium text-muted-foreground">رقم الفاتورة</th>
                <th className="p-3 text-right font-medium text-muted-foreground">المورد</th>
                <th className="p-3 text-right font-medium text-muted-foreground hidden sm:table-cell">التاريخ</th>
                <th className="p-3 text-right font-medium text-muted-foreground">الإجمالي</th>
                <th className="p-3 text-right font-medium text-muted-foreground hidden sm:table-cell">الحالة</th>
                <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
              </tr></thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">#{inv.id}</td>
                    <td className="p-3">{inv.supplier}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                    <td className="p-3 font-semibold text-accent">{inv.total} ج.م</td>
                    <td className="p-3 hidden sm:table-cell"><Badge variant={inv.paid >= inv.total ? "secondary" : "destructive"}>{inv.paid >= inv.total ? "مدفوعة" : "غير مكتملة"}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewInvoice(inv)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(inv)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(inv)}><Printer className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
