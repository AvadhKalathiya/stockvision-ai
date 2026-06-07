import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  formatChangePct,
  formatPrice,
  getHeatmapColorClass,
} from "@/lib/tickerConfig";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { PageShell } from "@/components/PageShell";
import { QueryError, QueryLoading } from "@/components/QueryState";
import { Briefcase, TrendingUp, TrendingDown, Sparkles, BarChart3, Building2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getLimits } from "@/lib/planLimits";
import { PlanGate } from "@/components/PlanGate";
import { computeMarketBreadth } from "@/lib/marketOverview";

export const Route = createFileRoute("/_authenticated/sectors")({
  component: SectorsPage,
});

const SECTORS = ["Banking", "IT Services", "FMCG", "Pharma", "Auto", "Energy", "Infrastructure"];

function SectorsPage() {
  const profile = useAuthStore((s) => s.profile);
  const limits = getLimits(profile?.plan);
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const { quotes, isLoading, isError, error, refetch } = useLiveQuotes();

  const sectorStocks = useMemo(() => {
    return ALL_TICKERS.filter((t) => {
      const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
      return cfg?.sector === activeSector;
    })
      .map((t) => {
        const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
        const q = quotes.find((x) => x.ticker === t);
        return { ticker: t, name: cfg?.name, price: q?.last ?? 0, pct: q?.changePct ?? 0 };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [quotes, activeSector]);

  const avgChange = sectorStocks.length
    ? sectorStocks.reduce((a, b) => a + b.pct, 0) / sectorStocks.length
    : 0;
  const topGainer = sectorStocks[0];
  const topLoser = sectorStocks[sectorStocks.length - 1];

  return (
    <PageShell
      title="Sector Analytics"
      subtitle="Deep dive into Indian market sectors and industry performance."
    >
      {isError ? (
        <QueryError message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <QueryLoading />
      ) : (
      <>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSector(s)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeSector === s
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="glass-card p-6 md:col-span-1 border-t-4 border-t-blue-500">
          <div className="flex gap-2 items-center text-muted-foreground mb-2">
            <Briefcase className="size-4" /> Sector Performance
          </div>
          <div
            className={`text-3xl font-bold font-mono-nums ${avgChange >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatChangePct(avgChange)}
          </div>
        </div>
        <div className="glass-card p-6 md:col-span-1 border-t-4 border-t-primary">
          <div className="flex gap-2 items-center text-muted-foreground mb-2">
            <TrendingUp className="size-4" /> Top Gainer
          </div>
          <div className="text-xl font-bold">{topGainer?.ticker || "N/A"}</div>
          <div className="text-primary font-mono-nums font-bold">
            {formatChangePct(topGainer?.pct || 0)}
          </div>
        </div>
        <div className="glass-card p-6 md:col-span-1 border-t-4 border-t-destructive">
          <div className="flex gap-2 items-center text-muted-foreground mb-2">
            <TrendingDown className="size-4" /> Top Loser
          </div>
          <div className="text-xl font-bold">{topLoser?.ticker || "N/A"}</div>
          <div className="text-destructive font-mono-nums font-bold">
            {formatChangePct(topLoser?.pct || 0)}
          </div>
        </div>
        {limits.canAIMarketSummary ? (
          <div className="glass-card p-6 md:col-span-1 border-t-4 border-t-accent bg-accent/5">
            <div className="flex gap-2 items-center text-accent font-bold mb-2">
              <Sparkles className="size-4" /> AI Outlook
            </div>
            <div className="text-sm font-semibold">
              {avgChange > 0
                ? "Bullish trend supported by strong institutional buying and volume expansion."
                : "Bearish consolidation phase. Wait for key support levels to bounce."}
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 md:col-span-1 flex items-center">
            <PlanGate compact requiredPlan="student" title="AI Sector Outlook" />
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-bold mb-4">
          {activeSector} Heatmap &amp; Constituents
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectorStocks.map((s) => (
              <div
                key={s.ticker}
                className={`p-4 rounded-lg flex flex-col justify-between h-24 ${getHeatmapColorClass(s.pct)}`}
              >
                <div className="font-bold">{s.ticker.replace(".NS", "")}</div>
                <div className="flex justify-between items-end">
                  <div className="text-xs opacity-80">{formatPrice(s.price)}</div>
                  <div className="font-mono-nums font-bold">{formatChangePct(s.pct)}</div>
                </div>
              </div>
          ))}
          {sectorStocks.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No tickers mapped to this sector in configuration yet.
            </div>
          )}
        </div>
      </div>

      {limits.canAdvancedSector ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 font-bold mb-4">
              <BarChart3 className="size-5 text-primary" /> Market Breadth
            </div>
            {(() => {
              const breadth = computeMarketBreadth(sectorStocks.map((s) => ({ ticker: s.ticker, changePct: s.pct, last: s.price, volume: 0, source: "yahoo" as const })));
              return (
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div><div className="text-2xl font-bold text-primary">{breadth.advances}</div><div className="text-xs text-muted-foreground">Advances</div></div>
                  <div><div className="text-2xl font-bold text-destructive">{breadth.declines}</div><div className="text-xs text-muted-foreground">Declines</div></div>
                  <div><div className="text-2xl font-bold">{breadth.ratio.toFixed(2)}</div><div className="text-xs text-muted-foreground">A/D Ratio</div></div>
                </div>
              );
            })()}
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 font-bold mb-4">
              <Building2 className="size-5 text-accent" /> Institutional Activity
            </div>
            <p className="text-sm text-muted-foreground">
              {avgChange > 0
                ? "FII/DII net buying observed in sector leaders — momentum likely to persist short-term."
                : "Institutional profit-booking detected — watch for support zone entries."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <PlanGate compact requiredPlan="pro_plus" title="Advanced Sector Analytics & Institutional Dashboard" />
        </div>
      )}
      </>
      )}
    </PageShell>
  );
}
