import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { TICKER_CONFIG } from "./tickerConfig";

export type LivePricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LiveQuote = {
  ticker: string;
  yfSymbol: string;
  last: number;
  previousClose: number;
  changePct: number;
  currency: string;
  source: "yahoo" | "fallback";
  asOf: string;
};

export type LiveHistory = {
  ticker: string;
  yfSymbol: string;
  currency: string;
  source: "yahoo" | "fallback";
  asOf: string;
  history: LivePricePoint[];
};

const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

function resolveYfSymbol(ticker: string): { yf: string; currency: string } | null {
  const cfg = (TICKER_CONFIG as Record<string, { yf: string; currency: string }>)[ticker];
  if (cfg) return { yf: cfg.yf, currency: cfg.currency };
  // allow passing raw yahoo symbol too
  return { yf: ticker, currency: "USD" };
}

async function fetchChart(yfSymbol: string, range: string, interval: string) {
  const url = `${YF_BASE}/${encodeURIComponent(yfSymbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;
  const res = await fetch(url, {
    headers: {
      // Yahoo blocks empty UA — pretend to be a browser
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`);
  const json = (await res.json()) as any;
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error("Yahoo Finance: empty result");
  return r;
}

function parseHistory(result: any): LivePricePoint[] {
  const ts: number[] = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};
  const o: (number | null)[] = q.open ?? [];
  const h: (number | null)[] = q.high ?? [];
  const l: (number | null)[] = q.low ?? [];
  const c: (number | null)[] = q.close ?? [];
  const v: (number | null)[] = q.volume ?? [];
  const out: LivePricePoint[] = [];
  for (let i = 0; i < ts.length; i++) {
    const close = c[i];
    if (close == null) continue;
    out.push({
      date: new Date(ts[i] * 1000).toISOString().split("T")[0],
      open: o[i] ?? close,
      high: h[i] ?? close,
      low: l[i] ?? close,
      close,
      volume: v[i] ?? 0,
    });
  }
  return out;
}

export const getLiveQuote = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ticker: z.string().min(1).max(32) }).parse)
  .handler(async ({ data }): Promise<LiveQuote> => {
    const resolved = resolveYfSymbol(data.ticker);
    if (!resolved) throw new Error("Unknown ticker");
    try {
      const r = await fetchChart(resolved.yf, "5d", "1d");
      const meta = r.meta ?? {};
      const last = Number(meta.regularMarketPrice ?? 0);
      const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        last,
        previousClose: prev,
        changePct: prev ? ((last - prev) / prev) * 100 : 0,
        currency: meta.currency ?? resolved.currency,
        source: "yahoo",
        asOf: new Date().toISOString(),
      };
    } catch (err) {
      console.error("getLiveQuote failed:", err);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        last: 0,
        previousClose: 0,
        changePct: 0,
        currency: resolved.currency,
        source: "fallback",
        asOf: new Date().toISOString(),
      };
    }
  });

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator(z.object({ tickers: z.array(z.string().min(1).max(32)).min(1).max(50) }).parse)
  .handler(async ({ data }): Promise<LiveQuote[]> => {
    const results = await Promise.all(
      data.tickers.map(async (ticker) => {
        const resolved = resolveYfSymbol(ticker);
        if (!resolved) return null;
        try {
          const r = await fetchChart(resolved.yf, "5d", "1d");
          const meta = r.meta ?? {};
          const last = Number(meta.regularMarketPrice ?? 0);
          const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
          return {
            ticker,
            yfSymbol: resolved.yf,
            last,
            previousClose: prev,
            changePct: prev ? ((last - prev) / prev) * 100 : 0,
            currency: meta.currency ?? resolved.currency,
            source: "yahoo" as const,
            asOf: new Date().toISOString(),
          };
        } catch (err) {
          console.error(`quote ${ticker} failed:`, err);
          return {
            ticker,
            yfSymbol: resolved.yf,
            last: 0,
            previousClose: 0,
            changePct: 0,
            currency: resolved.currency,
            source: "fallback" as const,
            asOf: new Date().toISOString(),
          };
        }
      }),
    );
    return results.filter((x): x is LiveQuote => x !== null);
  });

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
  "1mo": { range: "1mo", interval: "1d" },
  "3mo": { range: "3mo", interval: "1d" },
  "6mo": { range: "6mo", interval: "1d" },
  "1y": { range: "1y", interval: "1d" },
  "2y": { range: "2y", interval: "1d" },
  "5y": { range: "5y", interval: "1wk" },
  "10y": { range: "10y", interval: "1wk" },
  max: { range: "max", interval: "1mo" },
};

export const getLiveHistory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ticker: z.string().min(1).max(32),
      range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max"]).default("1y"),
    }).parse,
  )
  .handler(async ({ data }): Promise<LiveHistory> => {
    const resolved = resolveYfSymbol(data.ticker);
    if (!resolved) throw new Error("Unknown ticker");
    const { range, interval } = RANGE_MAP[data.range];
    try {
      const r = await fetchChart(resolved.yf, range, interval);
      const history = parseHistory(r);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        currency: r.meta?.currency ?? resolved.currency,
        source: history.length ? "yahoo" : "fallback",
        asOf: new Date().toISOString(),
        history,
      };
    } catch (err) {
      console.error("getLiveHistory failed:", err);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        currency: resolved.currency,
        source: "fallback",
        asOf: new Date().toISOString(),
        history: [],
      };
    }
  });

/** Custom date-range OHLCV fetch (up to 10 years). */
export const getHistoryByDateRange = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ticker: z.string().min(1).max(32),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
    }).parse,
  )
  .handler(async ({ data }): Promise<LiveHistory> => {
    const resolved = resolveYfSymbol(data.ticker);
    if (!resolved) throw new Error("Unknown ticker");
    const p1 = Math.floor(new Date(data.startDate + "T00:00:00Z").getTime() / 1000);
    const p2 = Math.floor(new Date(data.endDate + "T23:59:59Z").getTime() / 1000);
    const url = `${YF_BASE}/${encodeURIComponent(resolved.yf)}?period1=${p1}&period2=${p2}&interval=${data.interval}&includePrePost=false&events=div%2Csplit`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`);
      const json = (await res.json()) as any;
      const r = json?.chart?.result?.[0];
      if (!r) throw new Error("empty");
      const history = parseHistory(r);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        currency: r.meta?.currency ?? resolved.currency,
        source: history.length ? "yahoo" : "fallback",
        asOf: new Date().toISOString(),
        history,
      };
    } catch (err) {
      console.error("getHistoryByDateRange failed:", err);
      return {
        ticker: data.ticker,
        yfSymbol: resolved.yf,
        currency: resolved.currency,
        source: "fallback",
        asOf: new Date().toISOString(),
        history: [],
      };
    }
  });

/** Validate that a ticker symbol resolves on Yahoo Finance. */
export const validateTicker = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ticker: z.string().min(1).max(32) }).parse)
  .handler(async ({ data }) => {
    const sym = data.ticker.trim().toUpperCase();
    try {
      const r = await fetchChart(sym, "5d", "1d");
      const meta = r.meta ?? {};
      return {
        valid: true as const,
        symbol: sym,
        name: meta.longName ?? meta.shortName ?? sym,
        currency: meta.currency ?? "USD",
        exchange: meta.exchangeName ?? "—",
        last: Number(meta.regularMarketPrice ?? 0),
      };
    } catch {
      return { valid: false as const, symbol: sym };
    }
  });
