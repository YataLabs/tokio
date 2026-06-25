import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  LogOut,
  Menu,
  Moon,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ownerNavItems = [
  { to: "/dashboard", label: "Reports", icon: BarChart3, badge: null },
  { to: "/dashboard/stock", label: "Stock", icon: Package, badge: null },
  { to: "/dashboard/cashier", label: "Cashier", icon: ShoppingCart, badge: "Live" },
  { to: "/dashboard/transactions", label: "Transactions", icon: Receipt, badge: null },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
];

const adminNavItems = [
  { to: "/dashboard/admin", label: "Admin", icon: ShieldCheck, badge: null },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
];

function ThemeToggle({ collapsed = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (collapsed) {
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-tokio-border text-tokio-muted hover:bg-tokio-bg hover:text-tokio-text transition-all duration-200"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors duration-300 focus:outline-none ${
        isDark ? "border-tokio-border bg-tokio-bg" : "border-tokio-border bg-tokio-bg"
      }`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform duration-300 bg-tokio-panel ${
          isDark ? "translate-x-7 text-yellow-400" : "translate-x-1 text-amber-500"
        }`}
      >
        {isDark ? <Moon size={11} strokeWidth={2.5} /> : <Sun size={11} strokeWidth={2.5} />}
      </span>
    </button>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = user?.role === "admin" ? adminNavItems : ownerNavItems;

  function handleLogout() {
    logout();
    setTimeout(() => navigate("/", { replace: true }), 0);
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const isActiveRoute = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-tokio-bg text-tokio-text flex">

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col shrink-0 border-r border-tokio-border h-screen sticky top-0 bg-tokio-panel transition-all duration-300 ease-in-out ${
          collapsed ? "w-17" : "w-64"
        }`}
      >
        {/* Logo + collapse toggle */}
        <div className={`border-b border-tokio-border flex items-center h-16 px-3 ${collapsed ? "justify-center" : "justify-between px-4"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <Store size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-tokio-text leading-tight">Tokio</div>
                <div className="text-[10px] text-tokio-muted uppercase tracking-wider font-semibold">POS Dashboard</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Store size={18} strokeWidth={2.5} />
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg border border-tokio-border text-tokio-muted hover:bg-tokio-bg hover:text-tokio-text transition-all duration-200 shrink-0 ${collapsed ? "absolute -right-3.5 bg-tokio-panel shadow-sm z-10" : ""}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 flex flex-col gap-0.5 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-3"}`}>
          {!collapsed && (
            <div className="px-3 mb-2 mt-1">
              <span className="text-[10px] font-semibold text-tokio-muted uppercase tracking-wider">Menu</span>
            </div>
          )}
          {navItems.map((item) => {
            const active = isActiveRoute(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                    : "text-tokio-muted hover:bg-tokio-bg hover:text-tokio-text"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                    collapsed ? "w-8 h-8" : "w-8 h-8"
                  } ${
                    active
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-tokio-bg text-tokio-muted group-hover:text-tokio-text"
                  }`}
                >
                  <item.icon size={16} strokeWidth={2} />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/40">
                        <CircleDot size={8} className="fill-emerald-500" />
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight size={14} className="text-blue-400" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-tokio-border ${collapsed ? "p-2" : "p-3"}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-tokio-bg border border-tokio-border">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-tokio-text truncate">{user?.name || "User"}</div>
                <div className="text-xs text-tokio-muted capitalize">{user?.role || "Owner"}</div>
              </div>
            </div>
          )}

          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1" title={user?.name}>
                {initials}
              </div>
              <ThemeToggle collapsed />
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700 px-3 py-2.5 text-sm font-medium transition-all duration-200"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-tokio-panel/90 backdrop-blur-md border-b border-tokio-border shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Store size={16} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-tokio-text">Tokio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-tokio-border p-2 hover:bg-tokio-bg transition-colors active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <aside
          className={`absolute right-0 top-0 bottom-0 w-72 bg-tokio-panel shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-5 py-4 border-b border-tokio-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Store size={16} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm text-tokio-text">Menu</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-tokio-border p-2 hover:bg-tokio-bg transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-tokio-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-tokio-text">{user?.name || "User"}</div>
                <div className="text-xs text-tokio-muted capitalize">{user?.role || "Owner"}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
            <div className="px-3 mb-1 mt-1">
              <span className="text-[10px] font-semibold text-tokio-muted uppercase tracking-wider">Menu</span>
            </div>
            {navItems.map((item) => {
              const active = isActiveRoute(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/20 dark:text-blue-400" : "text-tokio-muted hover:bg-tokio-bg hover:text-tokio-text"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${active ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40" : "bg-tokio-bg text-tokio-muted"}`}>
                    <item.icon size={16} strokeWidth={2} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CircleDot size={8} className="fill-emerald-500" />
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 border-t border-tokio-border space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-tokio-muted">Theme</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-50 border border-red-100 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-all duration-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>
      </div>

      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
