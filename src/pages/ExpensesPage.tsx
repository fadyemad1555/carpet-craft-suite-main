import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  notes: string;
}

const initialExpenses: Expense[] = [
  { id: 1, name: "إيجار المعرض", amount: 8000, date: "٢٠٢٥-٠٢-٠١", notes: "إيجار شهر فبراير" },
  { id: 2, name: "كهرباء", amount: 1200, date: "٢٠٢٥-٠٢-٠٥", notes: "" },
  { id: 3, name: "رواتب الموظفين", amount: 15000, date: "٢٠٢٥-٠٢-٠١", notes: "٣ موظفين" },
  { id: 4, name: "نقل بضائع", amount: 2500, date: "٢٠٢٥-٠٢-١٠", notes: "شحن من اسطنبول" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const filtered = expenses.filter((e) => e.name.includes(search));
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      amount: Number(fd.get("amount")),
      date: fd.get("date") as string || new Date().toLocaleDateString("ar-EG"),
      notes: fd.get("notes") as string || "",
    };
    if (editExpense) {
      setExpenses((prev) => prev.map((ex) => (ex.id === editExpense.id ? { ...data, id: editExpense.id } : ex)));
    } else {
      setExpenses((prev) => [...prev, { ...data, id: Date.now() }]);
    }
    setDialogOpen(false);
    setEditExpense(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">المصروفات</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditExpense(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> إضافة مصروف</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editExpense ? "تعديل المصروف" : "إضافة مصروف جديد"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="grid gap-3 mt-2">
              <div><Label>اسم المصروف</Label><Input name="name" defaultValue={editExpense?.name} required /></div>
              <div><Label>المبلغ</Label><Input name="amount" type="number" defaultValue={editExpense?.amount} required /></div>
              <div><Label>التاريخ</Label><Input name="date" defaultValue={editExpense?.date} placeholder="مثال: ٢٠٢٥-٠٢-١٥" /></div>
              <div><Label>ملاحظات</Label><Input name="notes" defaultValue={editExpense?.notes} /></div>
              <Button type="submit">{editExpense ? "حفظ" : "إضافة"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-accent/20 bg-secondary/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
          <p className="text-3xl font-bold text-accent mt-1">{total.toLocaleString()} ج.م</p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-right font-medium text-muted-foreground">المصروف</th>
                <th className="p-3 text-right font-medium text-muted-foreground">المبلغ</th>
                <th className="p-3 text-right font-medium text-muted-foreground">التاريخ</th>
                <th className="p-3 text-right font-medium text-muted-foreground">ملاحظات</th>
                <th className="p-3 text-right font-medium text-muted-foreground">إجراءات</th>
              </tr></thead>
              <tbody>
                {filtered.map((ex) => (
                  <tr key={ex.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{ex.name}</td>
                    <td className="p-3 font-semibold text-destructive">{ex.amount.toLocaleString()} ج.م</td>
                    <td className="p-3 text-muted-foreground">{ex.date}</td>
                    <td className="p-3 text-muted-foreground">{ex.notes || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditExpense(ex); setDialogOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setExpenses((prev) => prev.filter((e) => e.id !== ex.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
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
