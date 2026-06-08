import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/components/AppShell";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once auth state is fully initialised
    if (initialized && !loading && !user) {
      navigate({
        to: "/login",
        search: { redirect: window.location.pathname },
        replace: true,
      });
    }
  }, [initialized, loading, user, navigate]);

  // Show spinner while Supabase session is being restored from localStorage
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-heading tracking-wider animate-pulse">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // Redirecting — render nothing to avoid flash
  if (!user) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
