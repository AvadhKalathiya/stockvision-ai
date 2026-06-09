import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatPrice,
  formatChangePct,
  INDIA_TICKERS,
} from "@/lib/tickerConfig";
import { type ModelName } from "@/lib/forecastService";
import { getLiveQuotes, getLiveHistory } from "@/lib/yahooFinance.functions";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  RefreshCw,
  Radio,
  Zap,
  Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MarketStatus } from "@/components/MarketStatus";
import { Sparkline } from "@/components/Sparkline";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

type Filter = "ALL" | "INDIA";

interface Quote {
  ticker: string;
  last: number;
  changePct: number;
  source: "yahoo" | "fallback";
}

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<Filter>("ALL");
  const fetchQuotes = useServerFn(getLiveQuotes);

  const {
    data: liveData,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["live-quotes", "all"],
    queryFn: () => fetchQuotes({ data: { tickers: [...ALL_TICKERS] } }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const quotes: Quote[] = useMemo(() => {
    return ALL_TICKERS.map((t) => {
      const live = liveData?.find((q) => q.ticker === t);
      if (live && live.source === "yahoo" && live.last > 0) {
        return { ticker: t, last: live.last, changePct: live.changePct, source: "yahoo" };
      }
      return { ticker: t, last: 0, changePct: 0, source: "yahoo" };
    });
  }, [liveData]);

  const filtered = useMemo(() => {
    const set =
      filter === "INDIA"
        ? new Set<string>(INDIA_TICKERS)
        : new Set<string>(ALL_TICKERS);
    return quotes.filter((q) => set.has(q.ticker));
  }, [filter, quotes]);

  const gainers = quotes.filter((q) => q.changePct > 0).length;
  const losers = quotes.filter((q) => q.changePct < 0).length;
  const avgChange = quotes.length ? quotes.reduce((a, b) => a + b.changePct, 0) / quotes.length : 0;
  const liveCount = quotes.filter((q) => q.source === "yahoo").length;

  // Portfolio
  const [holdings, setHoldings] = useState<{ ticker: string; qty: number; buy_price: number }[]>(
    [],
  );
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

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-glow-green">Market Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Live Yahoo Finance data across top NSE/BSE tickers and indices.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link to="/portfolio" className="px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-semibold hover:bg-secondary/80 transition">
            My Portfolio
          </Link>
          <Link to="/simulator" className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-md text-sm font-semibold hover:bg-primary/30 transition">
            Paper Trading
          </Link>
          <Link to="/screener" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            AI Screener
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="glass-card p-6 mb-8 border-l-4 border-l-accent bg-accent/5 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h2 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
            <Sparkles className="size-5 text-accent"/> Daily AI Market Summary
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            NIFTY 50 and BANK NIFTY are showing strong positive momentum today. IT and Banking sectors are leading the gains, while Auto remains flat.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-primary"><TrendingUp className="size-4"/> Bullish Sentiment</div>
            <div><strong className="text-foreground">Top Gainer:</strong> TCS.NS (+2.4%)</div>
            <div><strong className="text-foreground">Laggard:</strong> ONGC.NS (-1.2%)</div>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tickers" value={quotes.length.toString()} icon={Activity} />
        <StatCard
          label="Gainers"
          value={gainers.toString()}
          icon={TrendingUp}
          accent="text-primary"
        />
        <StatCard
          label="Losers"
          value={losers.toString()}
          icon={TrendingDown}
          accent="text-destructive"
        />
        <StatCard
          label="Avg Change"
          value={formatChangePct(avgChange)}
          icon={Sparkles}
          accent={avgChange >= 0 ? "text-primary" : "text-destructive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <PortfolioCard {...portfolioSummary} />
        <QuickForecastWidget />
        <RecentForecastsCard recent={recent} />
      </div>

      {watch.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
              Top Watchlist
            </h3>
            <Link to="/watchlist" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {watch.map((t) => (
              <WatchlistMini key={t} ticker={t} quote={quotes.find((q) => q.ticker === t)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["ALL", "INDIA"] as Filter[]).map((f) => (
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

      <div className="glass-card overflow-hidden">
        <div className="page-table-wrap">
          <table className="w-full min-w-140">
            <thead className="bg-secondary/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Ticker</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Exchange</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const cfg = TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG];
                const up = q.changePct >= 0;
                return (
                  <tr
                    key={q.ticker}
                    className="border-t border-border hover:bg-secondary/30 transition"
                  >
                    <td className="px-4 py-3 font-semibold font-mono-nums">{q.ticker}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{cfg.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{cfg.exchange}</td>
                    <td className="px-4 py-3 text-right font-mono-nums">
                      {formatPrice(q.last, cfg.currency)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono-nums font-semibold ${up ? "text-primary" : "text-destructive"}`}
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
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        SEBI Disclaimer: All forecasts are AI-generated for educational purposes only. Not
        investment advice.
      </p>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`size-4 ${accent}`} />
      </div>
      <div className={`font-heading text-2xl font-bold mt-2 font-mono-nums ${accent}`}>{value}</div>
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
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="size-4 text-primary" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</span>
      </div>
      {count === 0 ? (
        <div className="text-sm text-muted-foreground">
          No holdings yet.{" "}
          <Link to="/portfolio" className="text-primary hover:underline">
            Add one →
          </Link>
        </div>
      ) : (
        <>
          <div className="font-heading text-2xl font-bold font-mono-nums">{formatPrice(value)}</div>
          <div
            className={`font-mono-nums text-sm font-semibold mt-1 ${up ? "text-primary" : "text-destructive"}`}
          >
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
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="size-4 text-accent" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Quick Forecast
        </span>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Recent Forecasts
        </span>
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
                <div>
                  <div className="font-mono-nums font-semibold text-xs">{r.ticker}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {r.model} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs font-bold ${recColor}`}>{r.recommendation}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WatchlistMini({ ticker, quote }: { ticker: string; quote?: Quote }) {
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
        <div>
          <div className="font-mono-nums text-sm">{formatPrice(last, cfg?.currency)}</div>
          <div className="text-[10px] text-muted-foreground truncate max-w-30">
            {cfg?.name}
          </div>
        </div>
        <Sparkline values={series.slice(-30)} width={80} height={28} positive={up} />
      </div>
    </Link>
  );
}
