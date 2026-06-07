import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { PageShell } from "@/components/PageShell";
import { QueryError } from "@/components/QueryState";
import { getLimits } from "@/lib/planLimits";

export const Route = createFileRoute("/_authenticated/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const { holdings, loading, error, reload } = usePortfolioData();
  const { quoteMap, isError: quotesError, refetch: refetchQuotes } = useLiveQuotes();
  const [form, setForm] = useState({
    ticker: "RELIANCE.NS",
    qty: "10",
    buy_price: "",
    buy_date: new Date().toISOString().split("T")[0],
  });
  const [showAdvisor, setShowAdvisor] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cfg = getTickerConfig(form.ticker);
    const { error: err } = await supabase.from("portfolio").insert({
      user_id: user.id,
      ticker: form.ticker,
      qty: Number(form.qty),
      buy_price: Number(form.buy_price),
      buy_date: form.buy_date,
      company_name: cfg?.name ?? null,
    });
    if (err) toast.error(err.message);
    else {
      toast.success("Added to portfolio");
      setForm({ ...form, qty: "10", buy_price: "" });
      reload();
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from("portfolio").delete().eq("id", id);
    if (err) toast.error(err.message);
    else {
      toast.success("Removed");
      reload();
    }
  };

  const enriched = useMemo(
    () =>
      holdings.map((h) => {
        const cfg = getTickerConfig(h.ticker);
        const q = quoteMap.get(h.ticker);
        const current = q?.last ?? 0;
        const value = current * Number(h.qty);
        const cost = Number(h.buy_price) * Number(h.qty);
        const pnl = value - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        return { ...h, current, value, cost, pnl, pnlPct, currency: cfg?.currency ?? "INR", live: q?.source === "yahoo" };
      }),
    [holdings, quoteMap],
  );

  const totals = enriched.reduce(
    (a, h) => ({ value: a.value + h.value, cost: a.cost + h.cost, pnl: a.pnl + h.pnl }),
    { value: 0, cost: 0, pnl: 0 },
  );
  const totalPct = totals.cost > 0 ? (totals.pnl / totals.cost) * 100 : 0;

  const sectorMap = enriched.reduce(
    (acc, h) => {
      const s = TICKER_CONFIG[h.ticker as keyof typeof TICKER_CONFIG]?.sector || "Other";
      acc[s] = (acc[s] || 0) + (h.value > 0 ? h.value : h.cost);
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(sectorMap)
    .map(([name, val]) => ({ name, value: val }))
    .sort((a, b) => b.value - a.value);
  const COLORS = [
    "oklch(0.87 0.2 165)",
    "oklch(0.75 0.18 220)",
    "oklch(0.75 0.18 70)",
    "oklch(0.65 0.25 25)",
    "oklch(0.65 0.2 290)",
    "oklch(0.7 0.05 235)",
  ];

  const highestSector = pieData[0];
  const portfolioBase = totals.value > 0 ? totals.value : totals.cost;
  const maxExposurePct =
    highestSector && portfolioBase > 0 ? (highestSector.value / portfolioBase) * 100 : 0;

  const divScore = Math.max(0, Math.min(100, 100 - Math.max(0, maxExposurePct - 20) * 1.5));
  const riskScore = maxExposurePct > 50 ? 80 : maxExposurePct > 30 ? 60 : maxExposurePct > 0 ? 40 : 20;
  const healthScore = holdings.length === 0 ? 0 : divScore * 0.6 + (100 - riskScore) * 0.4;

  return (
    <PageShell
      title="Portfolio"
      subtitle="Track holdings with live Yahoo Finance P&L."
      actions={
        <button
          onClick={() => {
            if (!limits.canPortfolioAdvisor) {
              toast.error("AI Portfolio Advisor requires Student plan or higher");
              return;
            }
            setShowAdvisor(!showAdvisor);
          }}
          disabled={holdings.length === 0}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent/90 transition disabled:opacity-50"
        >
          <Sparkles className="size-4" /> AI Advisor{!limits.canPortfolioAdvisor ? " 🔒" : ""}
        </button>
      }
    >
      {error ? <QueryError message={error} onRetry={reload} label="Failed to load portfolio" /> : null}
      {quotesError ? (
        <QueryError message="Live prices unavailable" onRetry={() => refetchQuotes()} label="Quote feed error" />
      ) : null}

      {showAdvisor && holdings.length > 0 && limits.canPortfolioAdvisor && (
        <div className="glass-card p-4 sm:p-6 mb-6 border-l-4 border-l-accent">
          <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-accent" /> AI Portfolio Advisor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="md:col-span-1 space-y-3">
              <ScoreCard
                label="Health Score"
                value={healthScore.toFixed(0)}
                highlight={healthScore > 75 ? "text-primary" : healthScore > 50 ? "text-warning" : "text-destructive"}
                large
              />
              <ScoreCard label="Risk Score" value={`${riskScore}/100`} />
              <ScoreCard label="Diversification" value={`${divScore.toFixed(0)}/100`} />
            </div>
            <div className="md:col-span-1 h-52 sm:h-64 flex flex-col items-center min-w-0">
              <div className="text-sm font-bold mb-2">Sector Exposure</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="75%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number) => formatPrice(val)}
                    contentStyle={{ background: "oklch(0.18 0.04 250)", border: "1px solid oklch(0.87 0.2 165 / 0.15)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2 space-y-3">
              <InsightRow
                icon={PieChartIcon}
                title="Sector Exposure"
                text={`${maxExposurePct.toFixed(1)}% allocated to ${highestSector?.name ?? "—"} stocks.`}
              />
              {maxExposurePct > 40 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-destructive">Concentration Risk</div>
                    <div className="text-sm text-destructive/90">
                      {highestSector?.name} exposure exceeds 40%. Consider rebalancing into FMCG or Pharma.
                    </div>
                  </div>
                </div>
              )}
              <InsightRow
                icon={Sparkles}
                title="AI Suggestion"
                text={
                  holdings.length < 3
                    ? "Add 2–3 more sectors to improve diversification score."
                    : "Add stable dividend yield (ITC.NS) or infrastructure picks to optimize risk-reward."
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Metric label="Invested" value={formatPrice(totals.cost)} />
        <Metric label="Current Value" value={formatPrice(totals.value)} />
        <Metric
          label="Unrealized P&L"
          value={`${formatPrice(totals.pnl)} (${formatChangePct(totalPct)})`}
          accent={totals.pnl >= 0 ? "text-primary" : "text-destructive"}
        />
      </div>

      <form
        onSubmit={handleAdd}
        className="glass-card p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <select
          value={form.ticker}
          onChange={(e) => setForm({ ...form, ticker: e.target.value })}
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary text-sm"
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
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Buy price"
          value={form.buy_price}
          onChange={(e) => setForm({ ...form, buy_price: e.target.value })}
          required
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary text-sm"
        />
        <input
          type="date"
          value={form.buy_date}
          onChange={(e) => setForm({ ...form, buy_date: e.target.value })}
          required
          className="px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:border-primary text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="size-4" /> Add
        </button>
      </form>

      <div className="glass-card page-table-wrap">
        <table className="w-full min-w-[640px]">
          <thead className="bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Buy</th>
              <th className="px-4 py-3 text-right">Live</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">P&L</th>
              <th className="px-4 py-3" />
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
                  No holdings yet. Add your first position above.
                </td>
              </tr>
            ) : (
              enriched.map((h) => (
                <tr key={h.id} className="border-t border-border hover:bg-secondary/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold font-mono-nums text-sm">{h.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {h.company_name ?? TICKER_CONFIG[h.ticker as keyof typeof TICKER_CONFIG]?.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm">{Number(h.qty)}</td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm">
                    {formatPrice(Number(h.buy_price), h.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm">
                    {h.live ? formatPrice(h.current, h.currency) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm">
                    {formatPrice(h.value, h.currency)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono-nums text-sm font-semibold ${h.pnl >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {formatPrice(h.pnl, h.currency)}
                    <br />
                    <span className="text-xs">{formatChangePct(h.pnlPct)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-muted-foreground hover:text-destructive transition p-1"
                      aria-label="Remove holding"
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
    </PageShell>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-heading text-xl sm:text-2xl font-bold mt-2 font-mono-nums ${accent ?? ""}`}>
        {value}
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  highlight,
  large,
}: {
  label: string;
  value: string;
  highlight?: string;
  large?: boolean;
}) {
  return (
    <div className="p-4 bg-secondary/50 rounded-lg border border-border text-center">
      <div className="text-xs uppercase text-muted-foreground mb-1">{label}</div>
      <div className={`font-bold font-mono-nums ${large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} ${highlight ?? ""}`}>
        {value}
      </div>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-start gap-3">
      <Icon className="size-5 text-primary shrink-0 mt-0.5" />
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
