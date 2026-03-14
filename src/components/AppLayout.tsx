import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Store,
  TrendingUp,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "لوحة التحكم", icon: LayoutDashboard, path: "/" },
  { label: "المنتجات", icon: Package, path: "/products" },
  { label: "الموردين", icon: Users, path: "/suppliers" },
  { label: "فواتير الشراء", icon: ShoppingCart, path: "/purchases" },
  { label: "فواتير المبيعات", icon: Receipt, path: "/sales" },
  { label: "المصروفات", icon: Wallet, path: "/expenses" },
  { label: "التقارير", icon: TrendingUp, path: "/reports" },
  { label: "الإعدادات", icon: Settings, path: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { online, pendingCount, sync } = useOfflineSync();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col sidebar-gradient text-sidebar-foreground transition-all duration-300 lg:relative lg:right-auto",
          collapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <img src="/pwa-192x192.png" alt="معرض البركة" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-sidebar-primary truncate">معرض البركة</h1>
              <p className="text-[11px] text-sidebar-foreground/60">نظام إدارة المعرض</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="mr-auto lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">
            {navItems.find((i) => i.path === location.pathname)?.label || "معرض البركة"}
          </h2>
          <div className="mr-auto flex items-center gap-2">
            {pendingCount > 0 && (
              <button onClick={sync} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{pendingCount} معلق</span>
              </button>
            )}
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              online ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            )}>
              {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{online ? "متصل" : "أوفلاين"}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
