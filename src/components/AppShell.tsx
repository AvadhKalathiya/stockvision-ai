import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Eye,
  LogOut,
  Bell,
  History,
  MessageSquare,
  Newspaper,
  Settings,
  Rocket,
  ChevronLeft,
  Menu,
  X,
  Activity,
  BarChart2,
  Flame,
  GitCompare,
  Cpu,
  Gamepad2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/heatmap", label: "Heatmap", icon: Flame },
  { to: "/screener", label: "AI Screener", icon: Eye },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/sectors", label: "Sectors", icon: BarChart2 },
  { to: "/insights", label: "AI Insights", icon: Zap },
  { to: "/forecast", label: "AI Forecast", icon: TrendingUp },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/watchlist", label: "Watchlist", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/simulator", label: "Simulator", icon: Gamepad2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/ipo", label: "IPO", icon: Rocket },
  { to: "/events", label: "Events", icon: Cpu },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

// Bottom nav items for mobile (most important 5)
const BOTTOM_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/heatmap", label: "Heatmap", icon: Flame },
  { to: "/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/chat", label: "Chat", icon: MessageSquare },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 border-r border-border bg-sidebar flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="font-heading text-lg font-bold tracking-wider text-glow-green"
          >
            STOCKVISION<span className="text-accent"> AI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition min-h-[44px] ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs">
            <div className="text-foreground font-semibold truncate">
              {profile?.name || user?.email}
            </div>
            <div className="text-muted-foreground uppercase tracking-wider mt-0.5">
              {profile?.plan ?? "free"} plan
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 mt-1 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition min-h-[44px]"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-sidebar border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/dashboard" className="font-heading text-base font-bold tracking-wider text-glow-green">
            STOCKVISION<span className="text-accent"> AI</span>
          </Link>
          <div className="w-[44px]" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar border-t border-border flex">
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-[56px] text-[10px] font-semibold uppercase tracking-wider transition ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`size-5 ${active ? "text-primary" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
