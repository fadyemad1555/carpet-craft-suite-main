import { useState, useEffect } from "react";
import { getLocal, setLocal } from "@/utils/offlineStorage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Eye, Printer, Pencil } from "lucide-react";
import { printInvoice } from "@/utils/printInvoice";

interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
}

interface SalesInvoice {
  id: number;
  date: string;
  items: InvoiceItem[];
  discount: number;
  paymentMethod: string;
  total: number;
  paid: number;
}

const initialInvoices: SalesInvoice[] = [
  { id: 1001, date: "٢٠٢٥-٠٢-١٥", items: [{ productName: "سجادة كلاسيك ٢×٣", quantity: 2, price: 1800 }], discount: 100, paymentMethod: "كاش", total: 3500, paid: 3500 },
  { id: 1002, date: "٢٠٢٥-٠٢-١٤", items: [{ productName: "سجادة تركية ٣×٤", quantity: 1, price: 5200 }, { productName: "موكيت ٥م", quantity: 5, price: 250 }], discount: 0, paymentMethod: "فيزا", total: 6450, paid: 6450 },
  { id: 1003, date: "٢٠٢٥-٠٢-١٣", items: [{ productName: "سجادة يدوية ٤×٦", quantity: 1, price: 12000 }], discount: 500, paymentMethod: "تقسيط", total: 11500, paid: 5000 },
];

const paymentMethods = ["كاش", "فيزا", "فودافون كاش", "إنستاباي"];

export default function SalesPage() {
  const [invoices, setInvoicesState] = useState<SalesInvoice[]>(() => getLocal("cached_sales", initialInvoices));
  const setInvoices = (updater: SalesInvoice[] | ((prev: SalesInvoice[]) => SalesInvoice[])) => {
    setInvoicesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setLocal("cached_sales", next);
      return next;
    });
  };
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<SalesInvoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<SalesInvoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([{ productName: "", quantity: 1, price: 0 }]);

  const filtered = invoices.filter((i) => String(i.id).includes(search) || i.items.some((it) => it.productName.includes(search)));

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const discount = Number(fd.get("discount") || 0);
    const paid = Number(fd.get("paid") || 0);
    const total = items.reduce((sum, it) => sum + it.quantity * it.price, 0) - discount;

    if (editInvoice) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editInvoice.id ? { ...inv, items: [...items], discount, paymentMethod: fd.get("paymentMethod") as string, total, paid } : inv
        )
      );
      setEditInvoice(null);
    } else {
      const invoice: SalesInvoice = {
        id: Date.now(),
        date: new Date().toLocaleDateString("ar-EG"),
        items: [...items],
        discount,
        paymentMethod: fd.get("paymentMethod") as string,
        total,
        paid,
      };
      setInvoices((prev) => [invoice, ...prev]);
    }
    setDialogOpen(false);
    setItems([{ productName: "", quantity: 1, price: 0 }]);
  };

  const handleEdit = (inv: SalesInvoice) => {
    setEditInvoice(inv);
    setItems([...inv.items]);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handlePrint = (inv: SalesInvoice) => {
    printInvoice({
      type: "sales",
      id: inv.id,
      date: inv.date,
      items: inv.items,
      discount: inv.discount,
      total: inv.total,
      paid: inv.paid,
      paymentMethod: inv.paymentMethod,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">فواتير المبيعات</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditInvoice(null); setItems([{ productName: "", quantity: 1, price: 0 }]); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> فاتورة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editInvoice ? "تعديل الفاتورة" : "فاتورة مبيعات جديدة"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-3 mt-2">
              <div className="space-y-2">
                <Label className="font-semibold">المنتجات</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1"><Input placeholder="اسم المنتج" value={item.productName} onChange={(e) => { const n = [...items]; n[idx].productName = e.target.value; setItems(n); }} required /></div>
                    <div className="w-16"><Input type="number" placeholder="كمية" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} required /></div>
                    <div className="w-24"><Input type="number" placeholder="السعر" value={item.price} onChange={(e) => { const n = [...items]; n[idx].price = Number(e.target.value); setItems(n); }} required /></div>
                    {items.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive shrink-0" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { productName: "", quantity: 1, price: 0 }])}>+ إضافة منتج</Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>الخصم</Label><Input name="discount" type="number" defaultValue={editInvoice?.discount ?? 0} /></div>
                <div><Label>طريقة الدفع</Label>
                  <select name="paymentMethod" defaultValue={editInvoice?.paymentMethod} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>المبلغ المدفوع</Label>
                <Input name="paid" type="number" defaultValue={editInvoice?.paid ?? 0} required />
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <span className="text-sm text-muted-foreground">الإجمالي: </span>
                <span className="text-lg font-bold text-accent">{items.reduce((s, i) => s + i.quantity * i.price, 0)} ج.م</span>
              </div>
              <Button type="submit" className="w-full">{editInvoice ? "تحديث الفاتورة" : "حفظ الفاتورة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="بحث برقم الفاتورة أو المنتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      <Dialog open={!!viewInvoice} onOpenChange={(o) => { if (!o) setViewInvoice(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>فاتورة #{viewInvoice?.id}</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-3 mt-2 text-sm">
              <p className="text-muted-foreground">التاريخ: {viewInvoice.date}</p>
              <div className="overflow-x-auto">
                <table className="w-full"><thead><tr className="border-b"><th className="pb-1 text-right">المنتج</th><th className="pb-1 text-right">الكمية</th><th className="pb-1 text-right">السعر</th><th className="pb-1 text-right">المجموع</th></tr></thead>
                  <tbody>{viewInvoice.items.map((it, i) => (<tr key={i} className="border-b border-border/30"><td className="py-2">{it.productName}</td><td className="py-2">{it.quantity}</td><td className="py-2">{it.price}</td><td className="py-2">{it.quantity * it.price}</td></tr>))}</tbody>
                </table>
              </div>
              {viewInvoice.discount > 0 && <p>الخصم: {viewInvoice.discount} ج.م</p>}
              <p className="font-bold text-accent">الإجمالي: {viewInvoice.total} ج.م</p>
              <p>المدفوع: {viewInvoice.paid} ج.م</p>
              {viewInvoice.total - viewInvoice.paid > 0 && <p className="text-destructive">المتبقي: {viewInvoice.total - viewInvoice.paid} ج.م</p>}
              <p>طريقة الدفع: {viewInvoice.paymentMethod}</p>
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
                <th className="p-3 text-right font-medium text-muted-foreground hidden sm:table-cell">التاريخ</th>
                <th className="p-3 text-right font-medium text-muted-foreground hidden md:table-cell">المنتجات</th>
                <th className="p-3 text-right font-medium text-muted-foreground">الإجمالي</th>
                <th className="p-3 text-right font-medium text-muted-foreground hidden sm:table-cell">الحالة</th>
                <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
              </tr></thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">#{inv.id}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{inv.items.map((i) => i.productName).join(", ")}</td>
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
