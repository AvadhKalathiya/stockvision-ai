import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ALL_TICKERS, TICKER_CONFIG, formatChangePct, formatPrice } from "@/lib/tickerConfig";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveQuotes } from "@/lib/yahooFinance.functions";
import { Briefcase, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sectors")({
  component: SectorsPage,
});

const SECTORS = ["Banking", "IT Services", "FMCG", "Pharma", "Auto", "Energy", "Infrastructure"];

function SectorsPage() {
  const [activeSector, setActiveSector] = useState(SECTORS[0]);
  const fetchQuotes = useServerFn(getLiveQuotes);

  const { data: quotesData } = useQuery({
    queryKey: ["sectors-quotes"],
    queryFn: () => fetchQuotes({ data: { tickers: [...ALL_TICKERS] } }),
    refetchInterval: 60_000,
  });

  const sectorStocks = useMemo(() => {
    return ALL_TICKERS.filter((t) => {
      const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
      return cfg?.sector === activeSector;
    })
      .map((t) => {
        const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
        const q = quotesData?.find((x) => x.ticker === t);
        return { ticker: t, name: cfg?.name, price: q?.last ?? 0, pct: q?.changePct ?? 0 };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [quotesData, activeSector]);

  const avgChange = sectorStocks.length
    ? sectorStocks.reduce((a, b) => a + b.pct, 0) / sectorStocks.length
    : 0;
  const topGainer = sectorStocks[0];
  const topLoser = sectorStocks[sectorStocks.length - 1];

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-glow-green">Sector Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Deep dive into Indian market sectors and industry performance.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {SECTORS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSector(s)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeSector === s
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
      </div>

      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-bold mb-4">
          {activeSector} Heatmap &amp; Constituents
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectorStocks.map((s) => {
            let color = "bg-secondary/50";
            if (s.pct >= 1) color = "bg-green-600/80 text-white";
            else if (s.pct > 0) color = "bg-green-500/50 text-white";
            else if (s.pct <= -1) color = "bg-red-600/80 text-white";
            else if (s.pct < 0) color = "bg-red-500/50 text-white";

            return (
              <div
                key={s.ticker}
                className={`p-4 rounded-lg flex flex-col justify-between h-24 ${color}`}
              >
                <div className="font-bold">{s.ticker.replace(".NS", "")}</div>
                <div className="flex justify-between items-end">
                  <div className="text-xs opacity-80">{formatPrice(s.price)}</div>
                  <div className="font-mono-nums font-bold">{formatChangePct(s.pct)}</div>
                </div>
              </div>
            );
          })}
          {sectorStocks.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              No tickers mapped to this sector in configuration yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
