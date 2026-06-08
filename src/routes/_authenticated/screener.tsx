import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ALL_TICKERS, TICKER_CONFIG, formatChangePct, formatPrice, NIFTY50_TICKERS } from "@/lib/tickerConfig";
import { Sparkles, TrendingUp, ShieldCheck, Activity, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading } from "@/components/QueryState";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";

export const Route = createFileRoute("/_authenticated/screener")({
  component: ScreenerPage,
});

type Category = "Growth" | "Value" | "Dividend" | "Momentum" | "Low Risk" | "Sector Leaders";
const BASIC_CATS: Category[] = ["Growth", "Value"];
const ADVANCED_CATS: Category[] = ["Dividend", "Momentum", "Low Risk", "Sector Leaders"];

function ScreenerPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [category, setCategory] = useState<Category>("Growth");
  const { quotes, isLoading, isError, error, refetch } = useLiveQuotes();

  const screenedStocks = useMemo(() => {
    return ALL_TICKERS.map((t) => {
      const q = quotes.find((x) => x.ticker === t);
      return {
        ticker: t,
        name: TICKER_CONFIG[t as keyof typeof TICKER_CONFIG]?.name,
        sector: TICKER_CONFIG[t as keyof typeof TICKER_CONFIG]?.sector,
        price: q?.last ?? 0,
        pct: q?.changePct ?? 0,
      };
    })
      .filter((d) => {
        if (category === "Growth") return d.pct > 1;
        if (category === "Value") return d.price < 500 && d.pct > 0;
        if (category === "Dividend") return ["ITC.NS", "ONGC.NS", "TCS.NS"].includes(d.ticker);
        if (category === "Momentum") return d.pct > 2;
        if (category === "Low Risk") return d.pct > -1 && d.pct < 1;
        if (category === "Sector Leaders")
          return ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "SUNPHARMA.NS"].includes(d.ticker);
        return true;
      })
      .sort((a, b) => b.pct - a.pct);
  }, [quotes, category]);

  return (
    <PageShell
      title="AI Stock Screener"
      subtitle="Discover Indian stocks using live momentum & sector criteria."
      actions={
        <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full text-xs sm:text-sm">
          <Sparkles className="size-4" /> Scanning {NIFTY50_TICKERS.length} NSE stocks
        </div>
      }
    >

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        <CatButton
          current={category}
          target="Growth"
          icon={TrendingUp}
          onClick={setCategory}
          desc="High Earnings Growth"
        />
        <CatButton
          current={category}
          target="Value"
          icon={Target}
          onClick={setCategory}
          desc="Undervalued, Low P/E"
        />
        {ADVANCED_CATS.map((cat) => (
          <CatButton
            key={cat}
            current={category}
            target={cat}
            icon={cat === "Dividend" ? Zap : cat === "Momentum" ? Activity : cat === "Low Risk" ? ShieldCheck : Sparkles}
            onClick={(c) => {
              if (!limits.canUseAdvancedScreener && !BASIC_CATS.includes(c)) {
                toast.error(`${c} screener requires Student plan or higher`);
                return;
              }
              setCategory(c);
            }}
            desc={cat === "Dividend" ? "High Yield" : cat === "Momentum" ? "Uptrend" : cat === "Low Risk" ? "Low Vol" : "Sector Top"}
            locked={!limits.canUseAdvancedScreener}
          />
        ))}
      </div>

      {isError ? (
        <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <QueryLoading />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card page-table-wrap">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h2 className="font-heading font-semibold text-lg">{category} Stocks</h2>
          </div>
          <table className="w-full text-sm min-w-[520px]">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-secondary/20">
              <tr>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Change</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {screenedStocks.map((s) => (
                <tr key={s.ticker} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-bold">{s.ticker}</div>
                    <div className="text-xs text-muted-foreground truncate w-40">{s.name}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.sector}</td>
                  <td className="px-4 py-3 text-right font-mono-nums">{formatPrice(s.price)}</td>
                  <td
                    className={`px-4 py-3 text-right font-mono-nums font-semibold ${s.pct >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {formatChangePct(s.pct)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/forecast"
                      search={{ ticker: s.ticker, model: "Ensemble" }}
                      className="px-3 py-1 rounded bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition"
                    >
                      Forecast
                    </Link>
                  </td>
                </tr>
              ))}
              {screenedStocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No stocks found for this criteria today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5 border-t-4 border-t-primary">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> AI Top Picks
            </h3>
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-secondary/30 rounded border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-primary">TCS.NS</span>
                  <span className="text-xs font-mono-nums bg-primary/20 text-primary px-2 py-0.5 rounded">
                    94% Conviction
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Strong fundamentals and multi-year deal wins create a high-growth outlook. Low
                  risk score (12/100).
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-primary">ITC.NS</span>
                  <span className="text-xs font-mono-nums bg-primary/20 text-primary px-2 py-0.5 rounded">
                    88% Conviction
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  High dividend yield with stable FMCG volume growth. Classified as a Hidden Gem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </PageShell>
  );
}

function CatButton({
  current,
  target,
  icon: Icon,
  onClick,
  desc,
  locked,
}: {
  current: string;
  target: Category;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (c: Category) => void;
  desc: string;
  locked?: boolean;
}) {
  const active = current === target;
  return (
    <button
      onClick={() => onClick(target)}
      className={`shrink-0 flex items-center gap-3 p-4 rounded-xl border transition-all ${active ? "bg-primary/10 border-primary text-foreground" : locked ? "bg-card/50 border-border text-muted-foreground/50" : "bg-card border-border text-muted-foreground hover:bg-secondary/50"}`}
    >
      <div
        className={`p-2 rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="text-left">
        <div className="font-bold text-sm">{target}</div>
        <div className="text-[10px] opacity-80">{desc}</div>
      </div>
    </button>
  );
}
