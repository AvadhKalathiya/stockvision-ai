import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
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
} from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/heatmap", label: "Market Heatmap", icon: TrendingUp },
  { to: "/screener", label: "AI Screener", icon: Eye },
  { to: "/compare", label: "Compare Stocks", icon: History },
  { to: "/sectors", label: "Sector Analytics", icon: Briefcase },
  { to: "/insights", label: "AI Insights", icon: MessageSquare },
  { to: "/portfolio", label: "My Portfolio", icon: Briefcase },
  { to: "/simulator", label: "Paper Trading", icon: LayoutDashboard },
  { to: "/forecast", label: "AI Forecast", icon: TrendingUp },
  { to: "/ipo", label: "IPO Intelligence", icon: Rocket },
  { to: "/events", label: "Events & Actions", icon: Newspaper },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-border bg-sidebar flex flex-col">
        <div className="p-6">
          <Link
            to="/dashboard"
            className="font-heading text-xl font-bold tracking-wider text-glow-green"
          >
            STOCKVISION<span className="text-accent"> AI</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
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
            className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
