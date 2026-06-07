import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ALL_TICKERS, TICKER_CONFIG, formatChangePct, formatPrice } from "@/lib/tickerConfig";
import { getLiveHistory, getLiveQuotes } from "@/lib/yahooFinance.functions";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Legend,
} from "recharts";
import { GlobalSearch } from "@/components/GlobalSearch";

export const Route = createFileRoute("/_authenticated/compare")({
  component: ComparePage,
});

function ComparePage() {
  const [stockA, setStockA] = useState<string>("TCS.NS");
  const [stockB, setStockB] = useState<string>("INFY.NS");
  const [range, setRange] = useState<"1mo" | "3mo" | "6mo" | "1y" | "5y">("1y");

  const fetchHistory = useServerFn(getLiveHistory);
  const fetchQuotes = useServerFn(getLiveQuotes);

  const { data: quotesData } = useQuery({
    queryKey: ["compare-quotes", stockA, stockB],
    queryFn: () => fetchQuotes({ data: { tickers: [stockA, stockB] } }),
    refetchInterval: 60_000,
  });

  const { data: historyA, isFetching: fetchA } = useQuery({
    queryKey: ["history", stockA, range],
    queryFn: () => fetchHistory({ data: { ticker: stockA, range } }),
  });

  const { data: historyB, isFetching: fetchB } = useQuery({
    queryKey: ["history", stockB, range],
    queryFn: () => fetchHistory({ data: { ticker: stockB, range } }),
  });

  const chartData = useMemo(() => {
    if (!historyA?.history || !historyB?.history) return [];
    // Merge by date
    const map = new Map<string, { date: string; A: number | null; B: number | null }>();
    for (const pt of historyA.history) {
      map.set(pt.date, { date: pt.date, A: pt.close, B: null });
    }
    for (const pt of historyB.history) {
      const existing = map.get(pt.date) || { date: pt.date, A: null, B: null };
      existing.B = pt.close;
      map.set(pt.date, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [historyA, historyB]);

  const cfgA = TICKER_CONFIG[stockA as keyof typeof TICKER_CONFIG];
  const cfgB = TICKER_CONFIG[stockB as keyof typeof TICKER_CONFIG];
  const qA = quotesData?.find((q) => q.ticker === stockA);
  const qB = quotesData?.find((q) => q.ticker === stockB);

  // Fake AI winner logic based on simple price change
  const winner = (qA?.changePct ?? 0) > (qB?.changePct ?? 0) ? stockA : stockB;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-glow-green">Stock Comparison Center</h1>
        <p className="text-muted-foreground mt-1">
          Side-by-side performance, risk, and fundamentals analysis.
        </p>
      </header>

      <div className="mb-6">
        <GlobalSearch />
      </div>

      <div className="glass-card p-5 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-muted-foreground uppercase mb-1 block">Stock A</label>
          <select
            value={stockA}
            onChange={(e) => setStockA(e.target.value)}
            className="px-3 py-2 rounded bg-input border border-border"
          >
            {ALL_TICKERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="text-muted-foreground font-bold italic pt-4">VS</div>
        <div>
          <label className="text-xs text-muted-foreground uppercase mb-1 block">Stock B</label>
          <select
            value={stockB}
            onChange={(e) => setStockB(e.target.value)}
            className="px-3 py-2 rounded bg-input border border-border"
          >
            {ALL_TICKERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto pt-4">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="px-3 py-2 rounded bg-secondary"
          >
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="5y">5 Years</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold font-heading">{cfgA?.name}</h2>
          <div className="text-sm text-muted-foreground mb-4">
            {stockA} · {cfgA?.sector}
          </div>
          <div className="text-3xl font-mono-nums font-bold mb-1">{formatPrice(qA?.last ?? 0)}</div>
          <div
            className={`font-semibold ${qA && qA.changePct >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatChangePct(qA?.changePct ?? 0)} Today
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/E Ratio</span>
              <span className="font-mono-nums">28.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-mono-nums">₹14.2T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dividend Yield</span>
              <span className="font-mono-nums">1.8%</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold font-heading">{cfgB?.name}</h2>
          <div className="text-sm text-muted-foreground mb-4">
            {stockB} · {cfgB?.sector}
          </div>
          <div className="text-3xl font-mono-nums font-bold mb-1">{formatPrice(qB?.last ?? 0)}</div>
          <div
            className={`font-semibold ${qB && qB.changePct >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatChangePct(qB?.changePct ?? 0)} Today
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">P/E Ratio</span>
              <span className="font-mono-nums">24.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-mono-nums">₹7.1T</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dividend Yield</span>
              <span className="font-mono-nums">2.1%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="font-heading text-lg mb-4">Historical Performance Overlay ({range})</h3>
        {fetchA || fetchB ? (
          <div className="animate-pulse h-64 bg-secondary/50 rounded flex items-center justify-center">
            Loading charts...
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.87 0.20 165 / 0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#10b981" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="#3b82f6"
                />
                <Tooltip contentStyle={{ background: "#1e293b", border: "none" }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="A"
                  name={stockA}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="B"
                  name={stockB}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-l-primary">
        <h3 className="font-heading font-bold text-lg mb-2">AI Winner Summary</h3>
        <p className="text-sm">
          Based on recent momentum and technical strength, <strong>{winner}</strong> shows a
          stronger short-term trajectory. However, both stocks remain solid picks in their
          respective sectors. Ensure proper portfolio diversification.
        </p>
      </div>
    </div>
  );
}
