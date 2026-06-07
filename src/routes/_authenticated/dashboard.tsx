import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatPrice,
  formatChangePct,
  formatVolume,
  NIFTY50_TICKERS,
  NIFTY_NEXT50_TICKERS,
} from "@/lib/tickerConfig";
import { computeMarketBreadth, topMovers } from "@/lib/marketOverview";
import { type ModelName } from "@/lib/forecastService";
import { getLiveHistory } from "@/lib/yahooFinance.functions";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  RefreshCw,
  Radio,
  Zap,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MarketStatus } from "@/components/MarketStatus";
import { Sparkline } from "@/components/Sparkline";
import { useLiveQuotes, type LiveQuote } from "@/hooks/useLiveQuotes";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading } from "@/components/QueryState";
import { getLimits } from "@/lib/planLimits";
import { PlanGate } from "@/components/PlanGate";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Filter = "NIFTY50" | "NEXT50" | "ALL";

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [filter, setFilter] = useState<Filter>("NIFTY50");
  const { quotes, isFetching, isLoading, isError, error, refetch, dataUpdatedAt } = useLiveQuotes();

  const stockQuotes = useMemo(() => {
    if (filter === "NIFTY50") return quotes.filter((q) => NIFTY50_TICKERS.includes(q.ticker));
    if (filter === "NEXT50") return quotes.filter((q) => NIFTY_NEXT50_TICKERS.includes(q.ticker));
    return quotes.filter((q) => !["NIFTY50", "NIFTYNEXT50", "BANKNIFTY", "SENSEX"].includes(q.ticker));
  }, [filter, quotes]);

  const movers = useMemo(() => topMovers(stockQuotes, 5), [stockQuotes]);
  const gainers = movers.gainers;
  const losers = movers.losers;
  const breadth = useMemo(() => computeMarketBreadth(stockQuotes), [stockQuotes]);
  const avgChange = useMemo(
    () => (stockQuotes.length ? stockQuotes.reduce((a, b) => a + b.changePct, 0) / stockQuotes.length : 0),
    [stockQuotes],
  );
  const liveCount = quotes.filter((q) => q.source === "yahoo").length;
  const sentiment = useMemo(() => {
    const bullish = gainers.length;
    const total = stockQuotes.length || 1;
    return Math.round((bullish / total) * 100);
  }, [gainers.length, stockQuotes.length]);

  const nifty = quotes.find((q) => q.ticker === "NIFTY50");
  const niftyNext = quotes.find((q) => q.ticker === "NIFTYNEXT50");
  const sensex = quotes.find((q) => q.ticker === "SENSEX");
  const bankNifty = quotes.find((q) => q.ticker === "BANKNIFTY");

  const sectorLeaders = useMemo(() => {
    const sectors: Record<string, { total: number; count: number }> = {};
    for (const q of stockQuotes) {
      const sector = TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG]?.sector ?? "Other";
      if (!sectors[sector]) sectors[sector] = { total: 0, count: 0 };
      sectors[sector].total += q.changePct;
      sectors[sector].count += 1;
    }
    return Object.entries(sectors)
      .map(([sector, { total, count }]) => ({ sector, avg: total / count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 4);
  }, [stockQuotes]);

  const topGainer = gainers[0];
  const topLoser = losers[0];

  const [holdings, setHoldings] = useState<{ ticker: string; qty: number; buy_price: number }[]>([]);
  const [watch, setWatch] = useState<string[]>([]);
  const [recent, setRecent] = useState<
    { id: string; ticker: string; model: string; recommendation: string; created_at: string }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("portfolio")
      .select("ticker,qty,buy_price")
      .eq("user_id", user.id)
      .then(({ data }) =>
        setHoldings((data ?? []) as { ticker: string; qty: number; buy_price: number }[]),
      );
    supabase
      .from("watchlist")
      .select("ticker")
      .eq("user_id", user.id)
      .limit(3)
      .order("added_at", { ascending: false })
      .then(({ data }) => setWatch(((data ?? []) as { ticker: string }[]).map((r) => r.ticker)));
    supabase
      .from("forecast_history")
      .select("id,ticker,model,recommendation,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) =>
        setRecent(
          (data ?? []) as {
            id: string;
            ticker: string;
            model: string;
            recommendation: string;
            created_at: string;
          }[],
        ),
      );
  }, [user]);

  const portfolioSummary = useMemo(() => {
    let invested = 0,
      value = 0;
    for (const h of holdings) {
      const q = quotes.find((x) => x.ticker === h.ticker);
      const live = q?.last ?? 0;
      invested += Number(h.buy_price) * Number(h.qty);
      value += live * Number(h.qty);
    }
    const pnl = value - invested;
    const pct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { invested, value, pnl, pct, count: holdings.length };
  }, [holdings, quotes]);

  const aiBriefing = useMemo(() => {
    const niftyPct = nifty?.changePct ?? 0;
    const mood = sentiment >= 60 ? "bullish" : sentiment <= 40 ? "bearish" : "mixed";
    const leader = sectorLeaders[0];
    return {
      mood,
      text: `NIFTY 50 is ${niftyPct >= 0 ? "up" : "down"} ${formatChangePct(niftyPct)}. Market sentiment is ${mood} with ${gainers.length} gainers vs ${losers.length} losers. ${leader ? `${leader.sector} leads sectors at ${formatChangePct(leader.avg)} avg.` : ""}`,
      topGainer: topGainer ? `${topGainer.ticker} (${formatChangePct(topGainer.changePct)})` : "—",
      topLoser: topLoser ? `${topLoser.ticker} (${formatChangePct(topLoser.changePct)})` : "—",
    };
  }, [nifty, sentiment, gainers.length, losers.length, sectorLeaders, topGainer, topLoser]);

  return (
    <PageShell
      title="Market Dashboard"
      subtitle="Live Indian equities terminal — NSE/BSE indices & top stocks."
      actions={
        <>
          <Link
            to="/portfolio"
            className="px-3 py-2 bg-secondary text-foreground rounded-md text-xs sm:text-sm font-semibold hover:bg-secondary/80 transition"
          >
            Portfolio
          </Link>
          <Link
            to="/screener"
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition"
          >
            Screener
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <GlobalSearch />
      </div>

      {isError ? (
        <QueryError
          message={(error as Error)?.message}
          onRetry={() => refetch()}
          label="Market data unavailable"
        />
      ) : isLoading ? (
        <QueryLoading label="Fetching live quotes…" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <IndexCard label="NIFTY 50" quote={nifty} />
            <IndexCard label="NIFTY NEXT 50" quote={niftyNext} />
            <IndexCard label="SENSEX" quote={sensex} />
            <IndexCard label="BANK NIFTY" quote={bankNifty} />
          </div>

          <div className="glass-card p-4 sm:p-5 mb-6">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">Market Breadth</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <BreadthCell label="Advances" value={breadth.advances} accent="text-primary" />
              <BreadthCell label="Declines" value={breadth.declines} accent="text-destructive" />
              <BreadthCell label="Unchanged" value={breadth.unchanged} />
              <BreadthCell label="A/D Ratio" value={breadth.ratio.toFixed(2)} />
            </div>
            <div className="sentiment-bar mt-3 flex h-2 rounded-full overflow-hidden">
              <div className="bg-primary" style={{ width: `${breadth.total ? (breadth.advances / breadth.total) * 100 : 50}%` }} />
              <div className="bg-destructive flex-1" />
            </div>
          </div>

          {limits.canAIMarketSummary ? (
            <div className="glass-card p-4 sm:p-6 mb-6 border-l-4 border-l-accent bg-accent/5">
              <h2 className="font-heading font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                <Sparkles className="size-5 text-accent shrink-0" /> AI Daily Briefing
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{aiBriefing.text}</p>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <span className="flex items-center gap-1 text-primary">
                  <TrendingUp className="size-4" /> {sentiment}% Bullish
                </span>
                <span>
                  <strong className="text-foreground">Top Gainer:</strong> {aiBriefing.topGainer}
                </span>
                <span>
                  <strong className="text-foreground">Top Loser:</strong> {aiBriefing.topLoser}
                </span>
              </div>
              <div className="sentiment-bar mt-3">
                <div className="sentiment-fill bg-primary" style={{ width: `${sentiment}%` }} />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <PlanGate
                compact
                requiredPlan="student"
                title="AI Market Summary"
                description="Daily AI briefing with sector leaders, sentiment & movers — Student plan and above."
              />
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap mb-6">
            <MarketStatus />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Radio
                className={`size-3.5 ${liveCount > 0 ? "text-primary animate-pulse" : "text-muted-foreground"}`}
              />
              {liveCount}/{quotes.length} live
              {dataUpdatedAt ? (
                <span className="opacity-70">· {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
              ) : null}
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/70 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard label="Tickers" value={quotes.length.toString()} icon={Activity} />
            <StatCard label="Gainers" value={gainers.length.toString()} icon={TrendingUp} accent="text-primary" />
            <StatCard label="Losers" value={losers.length.toString()} icon={TrendingDown} accent="text-destructive" />
            <StatCard
              label="Avg Change"
              value={formatChangePct(avgChange)}
              icon={BarChart3}
              accent={avgChange >= 0 ? "text-primary" : "text-destructive"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <PortfolioCard {...portfolioSummary} />
            <QuickForecastWidget />
            <RecentForecastsCard recent={recent} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MoversCard title="Top Gainers" items={gainers} positive />
            <MoversCard title="Top Losers" items={losers} positive={false} />
            <VolumeCard title="Volume Leaders" items={movers.volume} />
            <MoversCard title="Trending" items={movers.trending} positive />
          </div>

          {sectorLeaders.length > 0 && (
            <div className="glass-card p-4 sm:p-5 mb-6">
              <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Sector Leaders
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sectorLeaders.map((s) => (
                  <div key={s.sector} className="metric-card p-3 text-center">
                    <div className="text-xs text-muted-foreground truncate">{s.sector}</div>
                    <div
                      className={`font-mono-nums font-bold text-sm mt-1 ${s.avg >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {formatChangePct(s.avg)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {watch.length > 0 && (
            <div className="glass-card p-4 sm:p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
                  Watchlist
                </h3>
                <Link to="/watchlist" className="text-xs text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {watch.map((t) => (
                  <WatchlistMini key={t} ticker={t} quote={quotes.find((q) => q.ticker === t)} />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4 flex-wrap">
            {(["NIFTY50", "NEXT50", "ALL"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="glass-card page-table-wrap">
            <table className="w-full min-w-[600px]">
              <thead className="bg-secondary/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Ticker</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Exchange</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Change</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stockQuotes.map((q) => {
                  const cfg = TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG];
                  const up = q.changePct >= 0;
                  return (
                    <tr
                      key={q.ticker}
                      className="border-t border-border hover:bg-secondary/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold font-mono-nums text-sm">{q.ticker}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[140px]">
                        {cfg?.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {cfg?.exchange}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-nums text-sm">
                        {formatPrice(q.last, cfg?.currency)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono-nums text-sm font-semibold ${up ? "text-primary" : "text-destructive"}`}
                      >
                        {formatChangePct(q.changePct)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/forecast"
                          search={{ ticker: q.ticker, model: "Ensemble" }}
                          className="px-3 py-1 rounded-md bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition"
                        >
                          Forecast
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground mt-6 text-center">
        SEBI Disclaimer: All forecasts are AI-generated for educational purposes only. Not investment advice.
      </p>
    </PageShell>
  );
}

function BreadthCell({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="metric-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono-nums font-bold text-lg mt-1 ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

function VolumeCard({ title, items }: { title: string; items: LiveQuote[] }) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data</p>
      ) : (
        <ul className="space-y-2">
          {items.map((q) => (
            <li key={q.ticker} className="flex justify-between text-sm gap-2">
              <span className="font-mono-nums font-semibold truncate">{q.ticker.replace(".NS", "")}</span>
              <span className="font-mono-nums text-muted-foreground shrink-0">{formatVolume(q.volume)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IndexCard({ label, quote }: { label: string; quote?: LiveQuote }) {
  const up = (quote?.changePct ?? 0) >= 0;
  return (
    <div className="metric-card p-4 sm:p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-heading text-xl sm:text-2xl font-bold mt-2 font-mono-nums">
        {quote?.last ? formatPrice(quote.last) : "—"}
      </div>
      <div className={`text-sm font-mono-nums font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`}>
        {quote ? formatChangePct(quote.changePct) : "—"}
      </div>
    </div>
  );
}

function MoversCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: LiveQuote[];
  positive: boolean;
}) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        {positive ? <TrendingUp className="size-4 text-primary" /> : <TrendingDown className="size-4 text-destructive" />}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No movers today.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((q) => {
            const cfg = TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG];
            return (
              <li key={q.ticker} className="flex justify-between items-center text-sm gap-2">
                <div className="min-w-0">
                  <span className="font-mono-nums font-semibold">{q.ticker}</span>
                  <span className="text-xs text-muted-foreground ml-2 truncate hidden sm:inline">
                    {cfg?.name}
                  </span>
                </div>
                <span className={`font-mono-nums font-bold shrink-0 ${positive ? "text-primary" : "text-destructive"}`}>
                  {formatChangePct(q.changePct)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <div className={`font-heading text-xl sm:text-2xl font-bold mt-2 font-mono-nums ${accent}`}>
        {value}
      </div>
    </div>
  );
}

function PortfolioCard({
  invested,
  value,
  pnl,
  pct,
  count,
}: {
  invested: number;
  value: number;
  pnl: number;
  pct: number;
  count: number;
}) {
  const up = pnl >= 0;
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="size-4 text-primary" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio Snapshot</span>
      </div>
      {count === 0 ? (
        <div className="text-sm text-muted-foreground">
          No holdings.{" "}
          <Link to="/portfolio" className="text-primary hover:underline">
            Add one →
          </Link>
        </div>
      ) : (
        <>
          <div className="font-heading text-xl sm:text-2xl font-bold font-mono-nums">{formatPrice(value)}</div>
          <div className={`font-mono-nums text-sm font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`}>
            {formatPrice(pnl)} ({formatChangePct(pct)})
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {count} holdings · invested {formatPrice(invested)}
          </div>
        </>
      )}
    </div>
  );
}

function QuickForecastWidget() {
  const navigate = useNavigate();
  const [t, setT] = useState("RELIANCE.NS");
  const [m, setM] = useState<ModelName>("Ensemble");
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="size-4 text-accent" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Quick Forecast</span>
      </div>
      <select
        value={t}
        onChange={(e) => setT(e.target.value)}
        className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-sm mb-2"
      >
        {ALL_TICKERS.map((tk) => (
          <option key={tk} value={tk}>
            {tk}
          </option>
        ))}
      </select>
      <select
        value={m}
        onChange={(e) => setM(e.target.value as ModelName)}
        className="w-full px-2 py-1.5 rounded-md bg-input border border-border text-sm mb-3"
      >
        {(["SARIMA", "Prophet", "LSTM", "Ensemble"] as ModelName[]).map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
      <button
        onClick={() => navigate({ to: "/forecast", search: { ticker: t, model: m } })}
        className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
      >
        Run forecast →
      </button>
    </div>
  );
}

function RecentForecastsCard({
  recent,
}: {
  recent: {
    id: string;
    ticker: string;
    model: string;
    recommendation: string;
    created_at: string;
  }[];
}) {
  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Recent Forecasts</span>
        <Link to="/history" className="text-xs text-primary hover:underline">
          All →
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className="text-sm text-muted-foreground">No saved forecasts yet.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {recent.map((r) => {
            const recColor =
              r.recommendation === "BUY"
                ? "text-primary"
                : r.recommendation === "SELL"
                  ? "text-destructive"
                  : "text-muted-foreground";
            return (
              <li
                key={r.id}
                className="flex justify-between items-center gap-2 border-b border-border pb-2 last:border-0"
              >
                <div className="min-w-0">
                  <div className="font-mono-nums font-semibold text-xs">{r.ticker}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {r.model} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs font-bold shrink-0 ${recColor}`}>{r.recommendation}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WatchlistMini({ ticker, quote }: { ticker: string; quote?: LiveQuote }) {
  const fetchHistory = useServerFn(getLiveHistory);
  const { data } = useQuery({
    queryKey: ["mini-history", ticker],
    queryFn: () => fetchHistory({ data: { ticker, range: "1mo" } }),
    staleTime: 5 * 60_000,
  });
  const cfg = TICKER_CONFIG[ticker as keyof typeof TICKER_CONFIG];
  const series = (data?.history?.length ? data.history : []).map((p) => p.close);
  const last = quote?.last ?? series[series.length - 1] ?? 0;
  const pct = quote?.changePct ?? 0;
  const up = pct >= 0;
  return (
    <Link
      to="/forecast"
      search={{ ticker, model: "Ensemble" }}
      className="block bg-secondary/30 hover:bg-secondary/50 rounded-md p-3 transition"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono-nums font-semibold text-sm">{ticker}</span>
        <span className={`text-xs font-semibold ${up ? "text-primary" : "text-destructive"}`}>
          {formatChangePct(pct)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono-nums text-sm">{formatPrice(last, cfg?.currency)}</div>
          <div className="text-[10px] text-muted-foreground truncate">{cfg?.name}</div>
        </div>
        <Sparkline values={series.slice(-30)} width={72} height={28} positive={up} />
      </div>
    </Link>
  );
}
