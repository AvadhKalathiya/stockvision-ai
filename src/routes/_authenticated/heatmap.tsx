import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ALL_TICKERS, TICKER_CONFIG, formatChangePct, formatPrice } from "@/lib/tickerConfig";
import { getLiveQuotes } from "@/lib/yahooFinance.functions";
import { GlobalSearch } from "@/components/GlobalSearch";

export const Route = createFileRoute("/_authenticated/heatmap")({
  component: HeatmapPage,
});

type Filter = "NIFTY 50" | "BANK NIFTY" | "SENSEX" | "ALL";

function HeatmapPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const fetchQuotes = useServerFn(getLiveQuotes);

  const { data: liveData, isFetching } = useQuery({
    queryKey: ["heatmap-quotes"],
    queryFn: () => fetchQuotes({ data: { tickers: [...ALL_TICKERS] } }),
    refetchInterval: 60_000,
  });

  const heatmapData = useMemo(() => {
    return ALL_TICKERS.map((t) => {
      const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
      const live = liveData?.find((q) => q.ticker === t);
      const pct = live?.changePct ?? 0;
      const price = live?.last ?? 0;

      let colorClass = "bg-secondary";
      if (pct >= 2) colorClass = "bg-green-700 text-white";
      else if (pct > 0) colorClass = "bg-green-500/80 text-white";
      else if (pct <= -2) colorClass = "bg-red-700 text-white";
      else if (pct < 0) colorClass = "bg-red-500/80 text-white";
      else colorClass = "bg-neutral-600 text-white"; // Grey

      return {
        ticker: t,
        name: cfg?.name ?? t,
        sector: cfg?.sector ?? "Unknown",
        price,
        pct,
        colorClass,
      };
    })
      .filter((d) => {
        // Very basic filtering logic based on our ticker config.
        if (
          filter === "NIFTY 50" &&
          ![
            "RELIANCE.NS",
            "TCS.NS",
            "HDFCBANK.NS",
            "INFY.NS",
            "ITC.NS",
            "LT.NS",
            "HINDUNILVR.NS",
            "ONGC.NS",
            "TATAMOTORS.NS",
          ].includes(d.ticker)
        )
          return false;
        if (
          filter === "BANK NIFTY" &&
          !["HDFCBANK.NS", "SBIN.NS", "ICICIBANK.NS", "AXISBANK.NS", "KOTAKBANK.NS"].includes(
            d.ticker,
          )
        )
          return false;
        if (
          search &&
          !d.name.toLowerCase().includes(search.toLowerCase()) &&
          !d.ticker.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.pct - a.pct);
  }, [liveData, filter, search]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-glow-green">Market Heatmap</h1>
        <p className="text-muted-foreground mt-1">
          Real-time Indian market performance visualization.
        </p>
      </header>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="glass-card p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "NIFTY 50", "BANK NIFTY", "SENSEX"] as Filter[]).map((f) => (
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
        <div>
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-input border border-border text-sm w-48"
          />
        </div>
      </div>

      {isFetching && !liveData ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">
          Loading Live Market Data...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {heatmapData.map((d) => (
            <div
              key={d.ticker}
              className={`p-3 rounded-md shadow-sm transition-transform hover:scale-105 cursor-pointer ${d.colorClass} flex flex-col justify-between`}
              style={{ minHeight: "100px" }}
            >
              <div>
                <div className="font-bold text-sm tracking-tight truncate">
                  {d.ticker.replace(".NS", "")}
                </div>
                <div className="text-[10px] opacity-80 truncate">{d.name}</div>
              </div>
              <div className="mt-2 text-right">
                <div className="font-mono-nums font-semibold text-sm">{formatChangePct(d.pct)}</div>
                <div className="font-mono-nums text-[10px] opacity-90">{formatPrice(d.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
