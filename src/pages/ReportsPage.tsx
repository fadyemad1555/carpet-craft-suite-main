import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const dailySales = [
  { day: "السبت", amount: 4500 },
  { day: "الأحد", amount: 6200 },
  { day: "الاثنين", amount: 3800 },
  { day: "الثلاثاء", amount: 7100 },
  { day: "الأربعاء", amount: 5400 },
  { day: "الخميس", amount: 8200 },
  { day: "الجمعة", amount: 2100 },
];

export default function ReportsPage() {
  const totalSales = 45600;
  const totalPurchases = 32100;
  const totalExpenses = 26700;
  const netProfit = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">التقارير المالية</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">إجمالي المبيعات</p><p className="text-2xl font-bold text-foreground mt-1">{totalSales.toLocaleString()} ج.م</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">إجمالي المشتريات</p><p className="text-2xl font-bold text-foreground mt-1">{totalPurchases.toLocaleString()} ج.م</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">إجمالي المصروفات</p><p className="text-2xl font-bold text-destructive mt-1">{totalExpenses.toLocaleString()} ج.م</p></CardContent></Card>
        <Card className="border-accent/30"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">صافي الربح</p><p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>{netProfit.toLocaleString()} ج.م</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">المبيعات اليومية</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,85%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "8px" }} />
                <Bar dataKey="amount" name="المبيعات" fill="hsl(40, 60%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
