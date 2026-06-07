import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } });
    }
  }, [initialized, user, navigate]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-heading text-primary text-glow-green animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
