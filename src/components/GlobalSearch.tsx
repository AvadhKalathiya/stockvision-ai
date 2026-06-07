import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ALL_TICKERS,
  TICKER_CONFIG,
  INDIA_TICKERS,
  CRYPTO_TICKERS,
  GLOBAL_TICKERS,
} from "@/lib/tickerConfig";
import { Search, X } from "lucide-react";

type Market = "ALL" | "INDIA" | "CRYPTO" | "GLOBAL";

const MARKET_SET: Record<Market, ReadonlySet<string>> = {
  ALL: new Set(ALL_TICKERS),
  INDIA: new Set(INDIA_TICKERS),
  CRYPTO: CRYPTO_TICKERS.length > 0 ? new Set(CRYPTO_TICKERS) : new Set<string>(),
  GLOBAL: GLOBAL_TICKERS.length > 0 ? new Set(GLOBAL_TICKERS) : new Set(ALL_TICKERS),
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [market, setMarket] = useState<Market>("ALL");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const set = MARKET_SET[market];
    const term = q.trim().toLowerCase();
    const list = ALL_TICKERS.filter((t) => set.has(t));
    if (!term) return list.slice(0, 8);
    return list
      .map((t) => {
        const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
        const score =
          (t.toLowerCase().startsWith(term) ? 100 : 0) +
          (t.toLowerCase().includes(term) ? 30 : 0) +
          (cfg.name.toLowerCase().includes(term) ? 20 : 0);
        return { t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((x) => x.t);
  }, [q, market]);

  const pick = (t: string) => {
    setOpen(false);
    setQ("");
    navigate({ to: "/forecast", search: { ticker: t, model: "Ensemble" } });
  };

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-input border border-border focus-within:border-primary transition flex-1 min-w-0">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            placeholder="Search stocks & indices…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap sm:shrink-0">
          {(["ALL", "INDIA", "CRYPTO", "GLOBAL"] as Market[]).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition ${
                market === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full glass-card max-h-96 overflow-y-auto p-1">
          {results.map((t) => {
            const cfg = TICKER_CONFIG[t as keyof typeof TICKER_CONFIG];
            return (
              <button
                key={t}
                onClick={() => pick(t)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left hover:bg-secondary transition"
              >
                <div>
                  <div className="font-mono-nums font-semibold text-sm">{t}</div>
                  <div className="text-xs text-muted-foreground">{cfg.name}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {cfg.exchange}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
