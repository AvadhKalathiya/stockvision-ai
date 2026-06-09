import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSimulatorStore } from "@/stores/simulatorStore";
import { ALL_TICKERS, TICKER_CONFIG, formatPrice, formatChangePct } from "@/lib/tickerConfig";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import { Wallet, TrendingUp, History, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/simulator")({
  component: SimulatorPage,
});

function SimulatorPage() {
  const balance = useSimulatorStore((s) => s.balance);
  const trades = useSimulatorStore((s) => s.trades);
  const holdings = useSimulatorStore((s) => s.holdings);
  const buy = useSimulatorStore((s) => s.buy);
  const sell = useSimulatorStore((s) => s.sell);
  const reset = useSimulatorStore((s) => s.reset);
  const [tradeTicker, setTradeTicker] = useState(ALL_TICKERS[0]);
  const [tradeQty, setTradeQty] = useState(1);
  const [error, setError] = useState("");

  const { quotes } = useLiveQuotes();

  const activeQuote = quotes.find((q) => q.ticker === tradeTicker);
  const activePrice = activeQuote?.last ?? 0;

  const holdingsValue = Object.entries(holdings).reduce((acc, [ticker, { qty }]) => {
    const p = quotes.find((q) => q.ticker === ticker)?.last ?? 0;
    return acc + qty * p;
  }, 0);
  const totalValue = balance + holdingsValue;
  const totalReturn = ((totalValue - 1000000) / 1000000) * 100;

  const handleBuy = () => {
    setError("");
    if (activePrice === 0) {
      setError("Live price not available.");
      return;
    }
    if (!buy(tradeTicker, tradeQty, activePrice)) setError("Insufficient virtual funds.");
  };

  const handleSell = () => {
    setError("");
    if (activePrice === 0) {
      setError("Live price not available.");
      return;
    }
    if (!sell(tradeTicker, tradeQty, activePrice)) setError("Insufficient quantity in holdings.");
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-glow-green">
            Paper Trading Simulator
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Practice Indian market strategies with ₹10,00,000 virtual capital.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset all virtual data?")) reset();
          }}
          className="text-xs px-3 py-1 bg-destructive/20 text-destructive rounded font-bold"
        >
          Reset Account
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-t-4 border-t-primary">
          <div className="flex gap-3 items-center mb-2 text-muted-foreground">
            <Wallet className="size-5" /> Virtual Balance
          </div>
          <div className="text-3xl font-mono-nums font-bold">{formatPrice(balance)}</div>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-accent">
          <div className="flex gap-3 items-center mb-2 text-muted-foreground">
            <TrendingUp className="size-5" /> Total Equity
          </div>
          <div className="text-3xl font-mono-nums font-bold">{formatPrice(totalValue)}</div>
        </div>
        <div className="glass-card p-6 border-t-4 border-t-yellow-500">
          <div className="flex gap-3 items-center mb-2 text-muted-foreground">
            <History className="size-5" /> All-Time P&L
          </div>
          <div
            className={`text-3xl font-mono-nums font-bold ${totalReturn >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {totalReturn >= 0 ? "+" : ""}
            {formatPrice(totalValue - 1000000)} ({totalReturn.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Execute Trade</h2>
            {error && (
              <div className="bg-destructive/20 text-destructive text-sm p-3 rounded mb-4 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase text-muted-foreground font-bold mb-1 block">
                  Ticker
                </label>
                <select
                  value={tradeTicker}
                  onChange={(e) => setTradeTicker(e.target.value)}
                  className="w-full bg-input border border-border p-2 rounded"
                >
                  {ALL_TICKERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs uppercase text-muted-foreground font-bold">
                    Quantity
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Holding: {holdings[tradeTicker]?.qty || 0}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={tradeQty}
                  onChange={(e) => setTradeQty(Number(e.target.value))}
                  className="w-full bg-input border border-border p-2 rounded font-mono-nums"
                />
              </div>
              <div className="bg-secondary/50 p-3 rounded border border-border">
                <div className="text-xs text-muted-foreground uppercase">Live Market Price</div>
                <div className="text-xl font-bold font-mono-nums">{formatPrice(activePrice)}</div>
                <div
                  className={`text-xs font-semibold ${activeQuote && activeQuote.changePct >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {formatChangePct(activeQuote?.changePct ?? 0)} Today
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded font-bold hover:bg-primary/90 transition"
                >
                  BUY
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 bg-destructive text-destructive-foreground py-2 rounded font-bold hover:bg-destructive/90 transition"
                >
                  SELL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Virtual Holdings</h2>
            <div className="page-table-wrap">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-secondary/50 text-muted-foreground text-left text-xs uppercase">
                  <tr>
                    <th className="p-3">Ticker</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Avg Price</th>
                    <th className="p-3 text-right">Live Price</th>
                    <th className="p-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(holdings).map(([t, { qty, avgPrice }]) => {
                    const live = quotes.find((q) => q.ticker === t)?.last ?? avgPrice;
                    const pl = (live - avgPrice) * qty;
                    const plPct = ((live - avgPrice) / avgPrice) * 100;
                    return (
                      <tr key={t} className="border-t border-border">
                        <td className="p-3 font-bold">{t}</td>
                        <td className="p-3 text-right font-mono-nums">{qty}</td>
                        <td className="p-3 text-right font-mono-nums">{formatPrice(avgPrice)}</td>
                        <td className="p-3 text-right font-mono-nums">{formatPrice(live)}</td>
                        <td
                          className={`p-3 text-right font-mono-nums font-semibold ${pl >= 0 ? "text-primary" : "text-destructive"}`}
                        >
                          {pl >= 0 ? "+" : ""}
                          {formatPrice(pl)} ({plPct.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                  {Object.keys(holdings).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        No open positions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-bold mb-4">Trade History</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trades.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 border border-border rounded bg-secondary/20"
                >
                  <div className="flex gap-4 items-center">
                    <span
                      className={`font-bold text-xs px-2 py-1 rounded ${t.type === "BUY" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}
                    >
                      {t.type}
                    </span>
                    <div>
                      <div className="font-bold">{t.ticker}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(t.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-nums font-bold">
                      {t.qty} @ {formatPrice(t.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Value: {formatPrice(t.qty * t.price)}
                    </div>
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No trades executed yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
