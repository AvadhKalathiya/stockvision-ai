import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  Settings as SettingsIcon,
  Check,
  Sun,
  Moon,
  Download,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    features: ["5 forecasts/day", "SARIMA only", "Basic watchlist"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    features: ["Unlimited forecasts", "All 4 models", "Price alerts", "AI screener", "PDF export"],
  },
  {
    id: "student",
    name: "Student",
    price: "₹199",
    features: ["Unlimited forecasts", "All 4 models", "Price alerts", "PDF export"],
  },
];

function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [style, setStyle] = useState("moderate");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(
    () =>
      (typeof window !== "undefined" && (localStorage.getItem("theme") as "dark" | "light")) ||
      "dark",
  );
  const [notifEmail, setNotifEmail] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("notif:email") !== "0" : true,
  );
  const [notifAlerts, setNotifAlerts] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("notif:alerts") !== "0" : true,
  );
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("notif:email", notifEmail ? "1" : "0");
  }, [notifEmail]);
  useEffect(() => {
    localStorage.setItem("notif:alerts", notifAlerts ? "1" : "0");
  }, [notifAlerts]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("name,default_currency,trading_style")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? "");
          setCurrency(data.default_currency ?? "INR");
          setStyle(data.trading_style ?? "moderate");
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        default_currency: currency,
        trading_style: style,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      refreshProfile();
    }
  };

  const switchPlan = async (planId: string) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ plan: planId }).eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Switched to ${planId.toUpperCase()} plan`);
      refreshProfile();
    }
  };

  const changePassword = async () => {
    if (pw1.length < 6) {
      toast.error("Password must be 6+ characters");
      return;
    }
    if (pw1 !== pw2) {
      toast.error("Passwords do not match");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPw1("");
      setPw2("");
    }
  };

  const exportAllData = async () => {
    if (!user) return;
    const [wl, pf, al, fh] = await Promise.all([
      supabase.from("watchlist").select("*").eq("user_id", user.id),
      supabase.from("portfolio").select("*").eq("user_id", user.id),
      supabase.from("price_alerts").select("*").eq("user_id", user.id),
      supabase.from("forecast_history").select("*").eq("user_id", user.id),
    ]);
    const all = [
      ...(wl.data ?? []).map((r: any) => ({ table: "watchlist", ...r })),
      ...(pf.data ?? []).map((r: any) => ({ table: "portfolio", ...r })),
      ...(al.data ?? []).map((r: any) => ({ table: "price_alerts", ...r })),
      ...(fh.data ?? []).map((r: any) => ({ table: "forecast_history", ...r })),
    ];
    if (!all.length) {
      toast.info("No data to export");
      return;
    }
    downloadCSV(`stockvision-export-${Date.now()}.csv`, all);
    toast.success(`Exported ${all.length} rows`);
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    // Delete user data (RLS scopes to current user)
    await Promise.all([
      supabase.from("watchlist").delete().eq("user_id", user.id),
      supabase.from("portfolio").delete().eq("user_id", user.id),
      supabase.from("price_alerts").delete().eq("user_id", user.id),
      supabase.from("forecast_history").delete().eq("user_id", user.id),
    ]);
    await supabase.auth.signOut();
    setDeleting(false);
    toast.success("Account data deleted and signed out");
    navigate({ to: "/login" });
  };

  const currentPlan = profile?.plan ?? "free";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <SettingsIcon className="size-6 text-primary" />
        <div>
          <h1 className="font-heading text-3xl font-bold text-glow-green">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile and subscription plan.
          </p>
        </div>
      </header>

      <section className="glass-card p-6 mb-8">
        <h2 className="font-heading text-lg mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              value={user?.email ?? ""}
              disabled
              className="w-full mt-2 px-3 py-2 rounded-md bg-secondary border border-border text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Display name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Default currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Trading style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </section>

      {/* Appearance + notifications */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-6">
          <h2 className="font-heading text-lg mb-4">Appearance</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 px-3 py-2 rounded-md font-semibold flex items-center justify-center gap-2 ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              <Moon className="size-4" /> Dark
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 px-3 py-2 rounded-md font-semibold flex items-center justify-center gap-2 ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >
              <Sun className="size-4" /> Light
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-heading text-lg mb-4">Notifications</h2>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">Email alerts</span>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="accent-primary size-4"
            />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm">In-app price alert toasts</span>
            <input
              type="checkbox"
              checked={notifAlerts}
              onChange={(e) => setNotifAlerts(e.target.checked)}
              className="accent-primary size-4"
            />
          </label>
        </div>
      </section>

      {/* Security */}
      <section className="glass-card p-6 mb-8">
        <h2 className="font-heading text-lg mb-4 flex items-center gap-2">
          <Lock className="size-4" /> Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="New password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            className="px-3 py-2 rounded-md bg-input border border-border"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="px-3 py-2 rounded-md bg-input border border-border"
          />
        </div>
        <button
          onClick={changePassword}
          className="mt-4 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold"
        >
          Change password
        </button>
      </section>

      {/* Data export */}
      <section className="glass-card p-6 mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-lg">Export your data</h2>
          <p className="text-sm text-muted-foreground">
            Download all your watchlist, portfolio, alerts and forecast history as CSV.
          </p>
        </div>
        <button
          onClick={exportAllData}
          className="px-4 py-2 rounded-md bg-secondary text-foreground font-semibold flex items-center gap-2"
        >
          <Download className="size-4" /> Download CSV
        </button>
      </section>

      <section>
        <h2 className="font-heading text-lg mb-4">Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const active = currentPlan === p.id;
            const limit = PLAN_LIMITS[p.id as keyof typeof PLAN_LIMITS];
            return (
              <div
                key={p.id}
                className={`glass-card p-6 ${active ? "border-primary/60 ring-1 ring-primary/40" : ""}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-heading text-xl font-bold">{p.name}</h3>
                  <span className="text-2xl font-bold text-primary">
                    {p.price}
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </span>
                </div>
                <ul className="space-y-2 text-sm mb-5 mt-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="size-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-muted-foreground mb-4">
                  Models: {limit.models.join(", ")}
                </div>
                <button
                  onClick={() => switchPlan(p.id)}
                  disabled={active}
                  className={`w-full px-4 py-2 rounded-md font-semibold transition ${
                    active
                      ? "bg-secondary text-muted-foreground cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {active ? "Current plan" : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Demo billing — plans switch instantly without payment in this build.
        </p>
      </section>

      {/* Danger zone */}
      <section className="glass-card p-6 mt-8 border-destructive/40">
        <h2 className="font-heading text-lg mb-2 text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4" /> Danger zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting your account permanently removes all of your watchlist, portfolio, alerts and
          forecast history.
        </p>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-2 rounded-md bg-destructive/15 text-destructive font-semibold"
          >
            Delete account…
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-destructive font-semibold">
              Are you sure? This cannot be undone.
            </span>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Yes, delete everything"}
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-4 py-2 rounded-md bg-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
