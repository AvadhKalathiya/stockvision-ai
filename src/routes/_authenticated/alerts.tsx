import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatPrice,
  formatChangePct,
  getTickerConfig,
} from "@/lib/tickerConfig";
import { getLiveQuotes } from "@/lib/yahooFinance.functions";
import { Bell, Trash2, Plus, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { getLimits } from "@/lib/planLimits";

export const Route = createFileRoute("/_authenticated/alerts")({ component: AlertsPage });

interface Alert {
  id: string;
  ticker: string;
  target_price: number;
  condition: "above" | "below";
  is_active: boolean;
  alert_via: string;
  created_at: string;
}

function AlertsPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ticker, setTicker] = useState<string>("RELIANCE.NS");
  const [target, setTarget] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const triggeredRef = useRef<Set<string>>(new Set());

  const limits = getLimits(profile?.plan ?? "free");
  const canCreate = limits.canSetAlerts;

  const fetchQuotes = useServerFn(getLiveQuotes);
  const uniqTickers = useMemo(() => Array.from(new Set(alerts.map((a) => a.ticker))), [alerts]);

  const quotesQuery = useQuery({
    queryKey: ["alert-quotes", uniqTickers],
    queryFn: () => fetchQuotes({ data: { tickers: uniqTickers } }),
    enabled: uniqTickers.length > 0,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const priceMap = useMemo(() => {
    const m = new Map<string, number>();
    quotesQuery.data?.forEach((q) => m.set(q.ticker, q.last));
    return m;
  }, [quotesQuery.data]);

  // Trigger detection with browser notification + sound
  useEffect(() => {
    if (!quotesQuery.data) return;
    alerts.forEach((a) => {
      if (!a.is_active) return;
      const price = priceMap.get(a.ticker);
      if (!price) return;
      const hit =
        a.condition === "above" ? price >= Number(a.target_price) : price <= Number(a.target_price);
      if (hit && !triggeredRef.current.has(a.id)) {
        triggeredRef.current.add(a.id);
        const cfg = getTickerConfig(a.ticker);
        const msg = `${a.ticker} crossed ${a.condition} ${formatPrice(Number(a.target_price), cfg?.currency)} — now ${formatPrice(price, cfg?.currency)}`;
        toast.success(msg, { duration: 8000 });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("StockVision price alert", { body: msg });
        }
        if (soundOn) {
          try {
            const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new Ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = a.condition === "above" ? 880 : 440;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          } catch {
            /* ignore */
          }
        }
      }
    });
  }, [quotesQuery.data, alerts, priceMap, soundOn]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setAlerts((data ?? []) as Alert[]);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const requestBrowserNotifications = async () => {
    if (typeof Notification === "undefined") return toast.error("Notifications not supported");
    const perm = await Notification.requestPermission();
    if (perm === "granted") toast.success("Browser notifications enabled");
    else toast.error("Permission denied");
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canCreate) {
      toast.error("Upgrade to Pro to set price alerts");
      return;
    }
    const price = Number(target);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid target");
      return;
    }
    const { error } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      ticker,
      target_price: price,
      condition,
      alert_via: "in-app",
      is_active: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Alert created");
      setTarget("");
      load();
    }
  };

  const toggle = async (a: Alert) => {
    const { error } = await supabase
      .from("price_alerts")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("price_alerts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3 flex-wrap">
        <Bell className="size-6 text-primary" />
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold text-glow-green">Price Alerts</h1>
          <p className="text-muted-foreground text-sm">
            Live price polling every 30s · {quotesQuery.isFetching ? "updating…" : "idle"}
          </p>
        </div>
        <button
          onClick={() => setSoundOn((s) => !s)}
          className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5"
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          Sound {soundOn ? "on" : "off"}
        </button>
        <button
          onClick={requestBrowserNotifications}
          className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold"
        >
          Enable browser notifications
        </button>
      </header>

      {!canCreate && (
        <div className="glass-card p-4 mb-4 border-accent/30">
          <p className="text-sm text-accent">
            Price alerts are a Pro feature. Upgrade your plan in Settings.
          </p>
        </div>
      )}

      <form onSubmit={add} className="glass-card p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="px-3 py-2 rounded-md bg-input border border-border md:col-span-2"
        >
          {ALL_TICKERS.map((t) => (
            <option key={t} value={t}>
              {t} — {TICKER_CONFIG[t as keyof typeof TICKER_CONFIG].name}
            </option>
          ))}
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as "above" | "below")}
          className="px-3 py-2 rounded-md bg-input border border-border"
        >
          <option value="above">Crosses above</option>
          <option value="below">Falls below</option>
        </select>
        <input
          type="number"
          step="any"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target price"
          className="px-3 py-2 rounded-md bg-input border border-border"
        />
        <button
          type="submit"
          disabled={!canCreate}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="size-4" /> Add
        </button>
      </form>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3 text-right">Target</th>
              <th className="px-4 py-3 text-right">Current</th>
              <th className="px-4 py-3 text-right">Gap</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No alerts yet.
                </td>
              </tr>
            ) : (
              alerts.map((a) => {
                const cfg = getTickerConfig(a.ticker);
                const current = priceMap.get(a.ticker);
                const gap = current
                  ? ((current - Number(a.target_price)) / Number(a.target_price)) * 100
                  : null;
                const triggered =
                  current != null &&
                  (a.condition === "above"
                    ? current >= Number(a.target_price)
                    : current <= Number(a.target_price));
                return (
                  <tr
                    key={a.id}
                    className={`border-t border-border hover:bg-secondary/30 ${triggered && a.is_active ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold font-mono-nums">{a.ticker}</td>
                    <td className="px-4 py-3 capitalize">{a.condition}</td>
                    <td className="px-4 py-3 text-right font-mono-nums">
                      {formatPrice(Number(a.target_price), cfg?.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-nums">
                      {current != null ? formatPrice(current, cfg?.currency) : "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono-nums font-semibold ${gap == null ? "" : gap >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {gap == null ? "—" : formatChangePct(gap)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(a)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${a.is_active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
                      >
                        {a.is_active ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(a.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
