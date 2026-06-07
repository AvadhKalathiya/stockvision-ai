import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { normalizePlan, upgradeLabel } from "@/lib/planLimits";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Grid3x3,
  ScanSearch,
  GitCompareArrows,
  PieChart,
  Sparkles,
  Briefcase,
  LineChart,
  TrendingUp,
  Rocket,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Eye,
  Bell,
  Newspaper,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Markets",
    items: [
      { to: "/heatmap", label: "Market Heatmap", icon: Grid3x3 },
      { to: "/screener", label: "AI Screener", icon: ScanSearch },
      { to: "/compare", label: "Compare Stocks", icon: GitCompareArrows },
      { to: "/sectors", label: "Sector Analytics", icon: PieChart },
      { to: "/insights", label: "AI Insights", icon: Sparkles },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { to: "/portfolio", label: "My Portfolio", icon: Briefcase },
      { to: "/watchlist", label: "Watchlist", icon: Eye },
      { to: "/simulator", label: "Paper Trading", icon: LineChart },
      { to: "/alerts", label: "Price Alerts", icon: Bell },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/forecast", label: "AI Forecast", icon: TrendingUp },
      { to: "/ipo", label: "IPO Intelligence", icon: Rocket },
      { to: "/events", label: "Events & Actions", icon: CalendarDays },
      { to: "/news", label: "Market News", icon: Newspaper },
      { to: "/history", label: "Forecast History", icon: History },
    ],
  },
  {
    label: "Assistant",
    items: [
      { to: "/chat", label: "AI Chat", icon: MessageSquare },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-2">
          <div className="nav-section-label">{group.label}</div>
          <div className="space-y-0.5">
            {group.items.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-[inset_3px_0_0_0_var(--primary)]"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent"
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function SidebarContent({
  pathname,
  profile,
  user,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  profile: { name: string | null; plan: string } | null;
  user: { email?: string } | null;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="p-5 border-b border-sidebar-border">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="font-heading text-lg font-bold tracking-wider text-glow-green block"
        >
          STOCKVISION<span className="text-accent"> AI</span>
        </Link>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          Fintech Terminal
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs rounded-lg bg-sidebar-accent/50">
          <div className="text-foreground font-semibold truncate">
            {profile?.name || user?.email}
          </div>
          <div className="text-muted-foreground uppercase tracking-wider mt-0.5 text-[10px]">
            {upgradeLabel(normalizePlan(profile?.plan))} plan
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {isMobile ? (
        <>
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-sidebar/95 backdrop-blur-md">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-sidebar border-sidebar-border">
                <SidebarContent
                  pathname={pathname}
                  profile={profile}
                  user={user}
                  onSignOut={handleSignOut}
                  onNavigate={closeMobile}
                />
              </SheetContent>
            </Sheet>
            <Link to="/dashboard" className="font-heading text-sm font-bold tracking-wider text-glow-green">
              STOCKVISION<span className="text-accent"> AI</span>
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition"
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </Link>
          </header>
        </>
      ) : (
        <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col sticky top-0 h-screen">
          <SidebarContent
            pathname={pathname}
            profile={profile}
            user={user}
            onSignOut={handleSignOut}
          />
        </aside>
      )}

      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
