import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { TICKER_CONFIG, formatChangePct, NIFTY50_TICKERS } from "@/lib/tickerConfig";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading } from "@/components/QueryState";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";
import { PlanGate } from "@/components/PlanGate";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

type InsightType = "Bullish" | "Bearish" | "Warning" | "Opportunity";

interface Insight {
  id: number;
  type: InsightType;
  title: string;
  confidence: number;
  riskScore: number;
  data: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

function InsightsPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const { quotes, isLoading, isError, error, refetch } = useLiveQuotes();

  if (!limits.canInsights) {
    return (
      <PageShell title="AI Insights" subtitle="Algorithmic market intelligence and trading signals.">
        <PlanGate requiredPlan="student" title="AI Insights Engine" description="Live bullish/bearish signals, sector trends, and actionable opportunities. Available on Student plan and above." />
      </PageShell>
    );
  }

  const insights = useMemo((): Insight[] => {
    const stocks = quotes.filter((q) => NIFTY50_TICKERS.includes(q.ticker));
    const sorted = [...stocks].sort((a, b) => b.changePct - a.changePct);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const avg = stocks.length
      ? stocks.reduce((a, b) => a + b.changePct, 0) / stocks.length
      : 0;
    const bullishCount = stocks.filter((q) => q.changePct > 0).length;
    const sentiment = stocks.length ? Math.round((bullishCount / stocks.length) * 100) : 50;

    const itStocks = stocks.filter(
      (q) => TICKER_CONFIG[q.ticker as keyof typeof TICKER_CONFIG]?.sector === "IT Services",
    );
    const itAvg = itStocks.length
      ? itStocks.reduce((a, b) => a + b.changePct, 0) / itStocks.length
      : 0;

    const auto = stocks.find((q) => q.ticker === "TATAMOTORS.NS");
    const nifty = quotes.find((q) => q.ticker === "NIFTY50");

    const list: Insight[] = [];

    if (top && top.changePct > 0) {
      const cfg = TICKER_CONFIG[top.ticker as keyof typeof TICKER_CONFIG];
      list.push({
        id: 1,
        type: "Bullish",
        title: `${cfg?.sector ?? "Market"} Momentum`,
        confidence: Math.min(95, 70 + Math.round(top.changePct * 5)),
        riskScore: 35,
        data: `${top.ticker} leads gainers at ${formatChangePct(top.changePct)} on live Yahoo data.`,
        action: `Monitor ${top.ticker} for continuation; set alerts on pullbacks.`,
        icon: TrendingUp,
        color: "text-primary",
        bg: "bg-primary/20",
      });
    }

    if (bottom && bottom.changePct < 0) {
      list.push({
        id: 2,
        type: "Bearish",
        title: "Weakness Detected",
        confidence: Math.min(90, 65 + Math.round(Math.abs(bottom.changePct) * 4)),
        riskScore: 72,
        data: `${bottom.ticker} is the session laggard at ${formatChangePct(bottom.changePct)}.`,
        action: "Review stop-loss levels on correlated positions.",
        icon: TrendingDown,
        color: "text-destructive",
        bg: "bg-destructive/20",
      });
    }

    if (nifty) {
      const peProxy = nifty.last > 22000 ? 78 : 55;
      list.push({
        id: 3,
        type: "Warning",
        title: nifty.changePct < -0.5 ? "Index Pullback" : "Index Valuation Watch",
        confidence: peProxy,
        riskScore: nifty.changePct < 0 ? 65 : 45,
        data: `NIFTY 50 at ${formatChangePct(nifty.changePct)} — market breadth ${sentiment}% bullish.`,
        action: sentiment < 45 ? "Consider defensive sectors (FMCG, Pharma)." : "Maintain balanced exposure.",
        icon: ShieldAlert,
        color: "text-warning",
        bg: "bg-warning/20",
      });
    }

    if (itAvg > 0.5 || (auto && auto.changePct < -1)) {
      list.push({
        id: 4,
        type: "Opportunity",
        title: itAvg > 0.5 ? "IT Sector Opportunity" : "Dividend Defensive Play",
        confidence: 82,
        riskScore: 30,
        data:
          itAvg > 0.5
            ? `IT Services averaging ${formatChangePct(itAvg)} — sector rotation signal.`
            : "ITC & ONGC offer stable yield amid volatility.",
        action: itAvg > 0.5 ? "Accumulate IT large caps on dips." : "Add dividend yield for portfolio stability.",
        icon: Activity,
        color: "text-accent",
        bg: "bg-accent/20",
      });
    }

    if (list.length === 0) {
      list.push({
        id: 0,
        type: "Warning",
        title: "Awaiting Live Data",
        confidence: 0,
        riskScore: 50,
        data: "Connect to market data to generate live algorithmic signals.",
        action: "Refresh the page or check your network connection.",
        icon: ShieldAlert,
        color: "text-muted-foreground",
        bg: "bg-secondary",
      });
    }

    return list;
  }, [quotes]);

  return (
    <PageShell
      title="AI Insights Engine"
      subtitle="Live algorithmic signals derived from real-time market data."
      actions={
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-primary/20">
          <Sparkles className="size-4" /> Live Processing
        </div>
      }
    >
      {isError ? (
        <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <QueryLoading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {insights.map((insight) => (
            <div key={insight.id} className="glass-card p-4 sm:p-6 relative overflow-hidden group">
              <div
                className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full transition-transform group-hover:scale-150 ${insight.bg}`}
              />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${insight.bg} ${insight.color}`}>
                      <insight.icon className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                        {insight.type} Signal
                      </div>
                      <div className="font-heading text-base sm:text-lg font-bold truncate">
                        {insight.title}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-nums font-bold text-lg sm:text-xl">
                      {insight.confidence}%
                    </div>
                    <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Risk {insight.riskScore}/100
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                      Supporting Data
                    </div>
                    <p className="text-sm font-medium">{insight.data}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1 flex items-center gap-1">
                      Suggested Action <ArrowRight className="size-3" />
                    </div>
                    <div className="font-bold text-sm">{insight.action}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {limits.canPremiumInsights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-5 border-l-4 border-l-primary">
            <div className="text-xs uppercase font-bold text-primary mb-1">Hidden Gem Detection</div>
            <div className="font-heading font-bold text-lg mb-2">Undervalued Momentum Pick</div>
            <p className="text-sm text-muted-foreground">
              {insights.find((i) => i.type === "Opportunity")?.data ??
                "Scanning NIFTY 50 for low-visibility stocks with strong volume & price action."}
            </p>
          </div>
          <div className="glass-card p-5 border-l-4 border-l-accent">
            <div className="text-xs uppercase font-bold text-accent mb-1">High Conviction Picks</div>
            <div className="font-heading font-bold text-lg mb-2">Top Confidence Signal</div>
            <p className="text-sm text-muted-foreground">
              {insights.reduce((best, i) => (i.confidence > (best?.confidence ?? 0) ? i : best), insights[0])?.action ??
                "Awaiting sufficient live data for conviction scoring."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <PlanGate compact requiredPlan="pro" title="Premium AI Insights (Hidden Gems & High Conviction Picks)" />
        </div>
      )}

      <div className="glass-card p-6 sm:p-8 text-center">
        <Sparkles className="size-10 sm:size-12 mx-auto text-accent mb-4 opacity-80" />
        <h2 className="font-heading text-xl sm:text-2xl font-bold mb-2">
          Personalized portfolio insights
        </h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
          Connect holdings for concentration risk scans and AI rebalancing suggestions.
        </p>
        <Link
          to="/portfolio"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition inline-flex text-sm"
        >
          Analyze My Portfolio
        </Link>
      </div>
    </PageShell>
  );
}
