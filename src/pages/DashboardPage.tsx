import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const statsCards = [
  { title: "إجمالي المبيعات", value: "٤٥,٦٠٠ ج.م", icon: Receipt, change: "+١٢%", up: true },
  { title: "إجمالي المشتريات", value: "٣٢,١٠٠ ج.م", icon: ShoppingCart, change: "+٥%", up: true },
  { title: "صافي الربح", value: "١٣,٥٠٠ ج.م", icon: TrendingUp, change: "+١٨%", up: true },
  { title: "المنتجات منخفضة المخزون", value: "٧", icon: AlertTriangle, change: "", up: false },
];

const monthlySalesData = [
  { month: "يناير", sales: 12000, purchases: 8000 },
  { month: "فبراير", sales: 15000, purchases: 9500 },
  { month: "مارس", sales: 18000, purchases: 12000 },
  { month: "أبريل", sales: 14000, purchases: 10000 },
  { month: "مايو", sales: 22000, purchases: 14000 },
  { month: "يونيو", sales: 19000, purchases: 11000 },
];

const categoryData = [
  { name: "يدوي", value: 35 },
  { name: "تركي", value: 25 },
  { name: "فارسي", value: 20 },
  { name: "ماكينة", value: 20 },
];

const COLORS = [
  "hsl(25, 50%, 28%)",
  "hsl(40, 60%, 50%)",
  "hsl(40, 50%, 70%)",
  "hsl(25, 35%, 35%)",
];

const recentSales = [
  { id: 1, customer: "أحمد محمد", product: "سجادة يدوية ٣×٤", amount: "٤,٥٠٠ ج.م", date: "اليوم" },
  { id: 2, customer: "محمد علي", product: "سجادة تركية ٢×٣", amount: "٢,٨٠٠ ج.م", date: "اليوم" },
  { id: 3, customer: "خالد حسن", product: "موكيت رول ١٠م", amount: "٣,٢٠٠ ج.م", date: "أمس" },
  { id: 4, customer: "سعيد عبدالله", product: "سجادة فارسية ٤×٦", amount: "٨,٠٠٠ ج.م", date: "أمس" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="card-shine border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.change && (
                    <p className={`mt-1 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                      {stat.change} من الشهر الماضي
                    </p>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">المبيعات والمشتريات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,20%,85%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(30,20%,85%)",
                      fontFamily: "Cairo",
                    }}
                  />
                  <Bar dataKey="sales" name="المبيعات" fill="hsl(25, 50%, 28%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="المشتريات" fill="hsl(40, 60%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">التصنيفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">أحدث المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 text-right font-medium">العميل</th>
                  <th className="pb-2 text-right font-medium">المنتج</th>
                  <th className="pb-2 text-right font-medium">المبلغ</th>
                  <th className="pb-2 text-right font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{sale.customer}</td>
                    <td className="py-3 text-muted-foreground">{sale.product}</td>
                    <td className="py-3 font-semibold text-accent">{sale.amount}</td>
                    <td className="py-3 text-muted-foreground">{sale.date}</td>
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
