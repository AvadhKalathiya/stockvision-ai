import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatPrice,
  formatChangePct,
  getTickerConfig,
} from "@/lib/tickerConfig";

import { Trash2, Plus, Sparkles, PieChart as PieChartIcon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/portfolio")({
  component: PortfolioPage,
});

interface Holding {
  id: string;
  ticker: string;
  qty: number;
  buy_price: number;
  buy_date: string;
  company_name: string | null;
}

function PortfolioPage() {
  const user = useAuthStore((s) => s.user);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ticker: "RELIANCE.NS",
    qty: "10",
    buy_price: "",
    buy_date: new Date().toISOString().split("T")[0],
  });
  const [showAdvisor, setShowAdvisor] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("portfolio")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHoldings((data ?? []) as unknown as Holding[]);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cfg = getTickerConfig(form.ticker);
    const { error } = await supabase.from("portfolio").insert({
      user_id: user.id,
      ticker: form.ticker,
      qty: Number(form.qty),
      buy_price: Number(form.buy_price),
      buy_date: form.buy_date,
      company_name: cfg?.name ?? null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Added to portfolio");
      setForm({ ...form, qty: "10", buy_price: "" });
      load();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("portfolio").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      load();
    }
  };

  const enriched = holdings.map((h) => {
    const cfg = getTickerConfig(h.ticker);
    const current = 0; // Live data unavailable in this context without fetching
    const value = current * Number(h.qty);
    const cost = Number(h.buy_price) * Number(h.qty);
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    return { ...h, current, value, cost, pnl, pnlPct, currency: cfg?.currency ?? "INR" };
  });

  const totals = enriched.reduce(
    (a, h) => ({ value: a.value + h.value, cost: a.cost + h.cost, pnl: a.pnl + h.pnl }),
    { value: 0, cost: 0, pnl: 0 },
  );
  const totalPct = totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0;

  // AI Advisor Logic
  const sectorMap = enriched.reduce(
    (acc, h) => {
      const s = TICKER_CONFIG[h.ticker as keyof typeof TICKER_CONFIG]?.sector || "Other";
      acc[s] = (acc[s] || 0) + (h.value > 0 ? h.value : h.cost); // Fallback to cost if live value is 0
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(sectorMap)
    .map(([name, val]) => ({ name, value: val }))
    .sort((a, b) => b.value - a.value);
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

  const highestSector = pieData[0];
  const maxExposurePct =
    highestSector && totals.cost > 0
      ? (highestSector.value / (totals.value || totals.cost)) * 100
      : 0;

  const divScore = Math.max(0, 100 - (maxExposurePct - 20) * 1.5);
  const riskScore = maxExposurePct > 50 ? 80 : maxExposurePct > 30 ? 60 : 40;
  const healthScore = divScore * 0.6 + (100 - riskScore) * 0.4;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-glow-green">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your holdings and live P&amp;L.</p>
        </div>
        <button
          onClick={() => setShowAdvisor(!showAdvisor)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded font-bold hover:bg-accent/90 transition"
        >
          <Sparkles className="size-4" /> Analyze My Portfolio
        </button>
      </header>

      {showAdvisor && enriched.length > 0 && (
        <div className="glass-card p-6 mb-6 border-l-4 border-l-accent animate-in fade-in slide-in-from-top-4">
          <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-accent" /> AI Portfolio Advisor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="p-4 bg-secondary/50 rounded border border-border text-center">
                <div className="text-xs uppercase text-muted-foreground mb-1">Health Score</div>
                <div
                  className={`text-4xl font-bold ${healthScore > 75 ? "text-primary" : healthScore > 50 ? "text-yellow-500" : "text-destructive"}`}
                >
                  {healthScore.toFixed(0)}
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded border border-border text-center">
                <div className="text-xs uppercase text-muted-foreground mb-1">Risk Score</div>
                <div className="text-2xl font-bold font-mono-nums">{riskScore.toFixed(0)}/100</div>
              </div>
              <div className="p-4 bg-secondary/50 rounded border border-border text-center">
                <div className="text-xs uppercase text-muted-foreground mb-1">Diversification</div>
                <div className="text-2xl font-bold font-mono-nums">{divScore.toFixed(0)}/100</div>
              </div>
            </div>

            <div className="md:col-span-1 h-64 flex flex-col items-center">
              <div className="text-sm font-bold mb-2">Sector Allocation</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number) => formatPrice(val)}
                    contentStyle={{ background: "#1e293b", border: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-sm mb-2">AI Insights &amp; Warnings</h3>
              <div className="p-3 bg-secondary/30 rounded border border-border flex items-start gap-3">
                <PieChartIcon className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Sector Exposure</div>
                  <div className="text-sm text-muted-foreground">
                    {maxExposurePct.toFixed(1)}% of your portfolio is invested in{" "}
                    {highestSector?.name} stocks.
                  </div>
                </div>
              </div>

              {maxExposurePct > 40 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded flex items-start gap-3">
                  <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-destructive">
                      Concentration Risk Detected
                    </div>
                    <div className="text-sm text-destructive/90">
                      Your {highestSector?.name} exposure is dangerously high. Consider rebalancing
                      into FMCG or Pharma to lower your Risk Score.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-secondary/30 rounded border border-border flex items-start gap-3">
                <Sparkles className="size-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Rebalancing Suggestion</div>
                  <div className="text-sm text-muted-foreground">
                    Add stable dividend yield stocks (like ITC.NS) or undervalued infrastructure
                    picks to optimize your risk-vs-reward ratio.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Invested</div>
          <div className="font-heading text-2xl font-bold mt-2 font-mono-nums">
            {formatPrice(totals.cost)}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Current Value
          </div>
          <div className="font-heading text-2xl font-bold mt-2 font-mono-nums">
            {formatPrice(totals.value)}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Unrealized P&amp;L
          </div>
          <div
            className={`font-heading text-2xl font-bold mt-2 font-mono-nums ${totals.pnl >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatPrice(totals.pnl)} ({formatChangePct(totalPct)})
          </div>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="glass-card p-5 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <select
          value={form.ticker}
          onChange={(e) => setForm({ ...form, ticker: e.target.value })}
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
        >
          {ALL_TICKERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.0001"
          placeholder="Qty"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          required
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Buy price"
          value={form.buy_price}
          onChange={(e) => setForm({ ...form, buy_price: e.target.value })}
          required
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
        />
        <input
          type="date"
          value={form.buy_date}
          onChange={(e) => setForm({ ...form, buy_date: e.target.value })}
          required
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          <Plus className="size-4" /> Add
        </button>
      </form>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Buy Price</th>
              <th className="px-4 py-3 text-right">Current</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">P&amp;L</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : enriched.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No holdings yet. Add your first above.
                </td>
              </tr>
            ) : (
              enriched.map((h) => (
                <tr key={h.id} className="border-t border-border hover:bg-secondary/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold font-mono-nums">{h.ticker}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.company_name ??
                        TICKER_CONFIG[h.ticker as keyof typeof TICKER_CONFIG]?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums">{Number(h.qty)}</td>
                  <td className="px-4 py-3 text-right font-mono-nums">
                    {formatPrice(Number(h.buy_price), h.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums">
                    {formatPrice(h.current, h.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums">
                    {formatPrice(h.value, h.currency)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono-nums font-semibold ${h.pnl >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {formatPrice(h.pnl, h.currency)}
                    <br />
                    <span className="text-xs">{formatChangePct(h.pnlPct)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
