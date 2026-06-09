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
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIMITS, PLAN_ORDER, normalizePlan, type Plan } from "@/lib/planLimits";
import { downloadCSV } from "@/lib/csv";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

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

  const currentPlan = normalizePlan(profile?.plan);

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
      .update({ name, default_currency: currency, trading_style: style })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      refreshProfile();
    }
  };

  const switchPlan = async (planId: Plan) => {
    if (!user) return;
    if (planId === "enterprise") {
      toast.info("Contact sales@stockvision.ai for Enterprise pricing");
      return;
    }
    const { error } = await supabase.from("profiles").update({ plan: planId }).eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Switched to ${PLAN_LIMITS[planId].name}`);
      refreshProfile();
    }
  };

  const changePassword = async () => {
    if (pw1.length < 6) return toast.error("Password must be 6+ characters");
    if (pw1 !== pw2) return toast.error("Passwords do not match");
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
    const limits = PLAN_LIMITS[currentPlan];
    if (false) {
      toast.error("PDF/CSV export requires Student plan or higher");
      return;
    }
    const [wl, pf, al, fh] = await Promise.all([
      supabase.from("watchlist").select("*").eq("user_id", user.id),
      supabase.from("portfolio").select("*").eq("user_id", user.id),
      supabase.from("price_alerts").select("*").eq("user_id", user.id),
      supabase.from("forecast_history").select("*").eq("user_id", user.id),
    ]);
    const all = [
      ...(wl.data ?? []).map((r: Record<string, unknown>) => ({ table: "watchlist", ...r })),
      ...(pf.data ?? []).map((r: Record<string, unknown>) => ({ table: "portfolio", ...r })),
      ...(al.data ?? []).map((r: Record<string, unknown>) => ({ table: "price_alerts", ...r })),
      ...(fh.data ?? []).map((r: Record<string, unknown>) => ({ table: "forecast_history", ...r })),
    ];
    if (!all.length) return toast.info("No data to export");
    downloadCSV(`stockvision-export-${Date.now()}.csv`, all);
    toast.success(`Exported ${all.length} rows`);
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    await Promise.all([
      supabase.from("watchlist").delete().eq("user_id", user.id),
      supabase.from("portfolio").delete().eq("user_id", user.id),
      supabase.from("price_alerts").delete().eq("user_id", user.id),
      supabase.from("forecast_history").delete().eq("user_id", user.id),
    ]);
    await supabase.auth.signOut();
    setDeleting(false);
    toast.success("Account data deleted and signed out");
    navigate({ to: "/login", search: { redirect: "/dashboard" } });
  };

  return (
    <PageShell title="Settings" subtitle="Manage profile, appearance, and subscription.">
      <section className="glass-card p-4 sm:p-6 mb-6">
        <h2 className="font-heading text-lg mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input value={user?.email ?? ""} disabled className="w-full mt-2 px-3 py-2 rounded-md bg-secondary border border-border text-muted-foreground text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Display name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Default currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Trading style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-md bg-input border border-border text-sm">
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="mt-5 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4 sm:p-6">
          <h2 className="font-heading text-lg mb-4">Appearance</h2>
          <div className="flex gap-2">
            <button onClick={() => setTheme("dark")} className={`flex-1 px-3 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Moon className="size-4" /> Dark
            </button>
            <button onClick={() => setTheme("light")} className={`flex-1 px-3 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Sun className="size-4" /> Light
            </button>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <h2 className="font-heading text-lg mb-4">Notifications</h2>
          <label className="flex items-center justify-between py-2 cursor-pointer text-sm">
            <span>Email alerts</span>
            <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="accent-primary size-4" />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer text-sm">
            <span>In-app price alert toasts</span>
            <input type="checkbox" checked={notifAlerts} onChange={(e) => setNotifAlerts(e.target.checked)} className="accent-primary size-4" />
          </label>
        </div>
      </section>

      <section className="glass-card p-4 sm:p-6 mb-6">
        <h2 className="font-heading text-lg mb-4 flex items-center gap-2"><Lock className="size-4" /> Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="password" placeholder="New password" value={pw1} onChange={(e) => setPw1(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input type="password" placeholder="Confirm new password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
        </div>
        <button onClick={changePassword} className="mt-4 px-5 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm">Change password</button>
      </section>

      <section className="glass-card p-4 sm:p-6 mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-lg">Export your data</h2>
          <p className="text-sm text-muted-foreground">CSV export of all holdings.</p>
        </div>
        <button onClick={exportAllData} className="px-4 py-2 rounded-md bg-secondary text-foreground font-semibold flex items-center gap-2 text-sm">
          <Download className="size-4" /> Download CSV
        </button>
      </section>

      <section className="glass-card p-4 sm:p-6 mt-8 border-destructive/40">
        <h2 className="font-heading text-lg mb-2 text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4" /> Danger zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Permanently removes all watchlist, portfolio, alerts and forecast history.</p>
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)} className="px-4 py-2 rounded-md bg-destructive/15 text-destructive font-semibold text-sm">Delete account…</button>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-destructive font-semibold">Are you sure?</span>
            <button onClick={deleteAccount} disabled={deleting} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-50">
              {deleting ? "Deleting…" : "Yes, delete everything"}
            </button>
            <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-md bg-secondary text-sm">Cancel</button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
