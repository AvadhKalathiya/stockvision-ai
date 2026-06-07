import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { resolveSymbolCandidates, resolveYfSymbol, normalizeTickerKey } from "./tickerResolve";

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
  volume: number;
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
  error?: string;
};

const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchChart(yfSymbol: string, range: string, interval: string) {
  const url = `${YF_BASE}/${encodeURIComponent(yfSymbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Yahoo Finance: invalid JSON response");
  }
  const r = (json as { chart?: { result?: unknown[] } })?.chart?.result?.[0];
  if (!r) throw new Error("Yahoo Finance: empty result");
  return r;
}

function parseHistory(result: Record<string, unknown>): LivePricePoint[] {
  const ts = (result.timestamp as number[]) ?? [];
  const q = ((result.indicators as { quote?: Record<string, unknown>[] })?.quote?.[0] ?? {}) as Record<
    string,
    (number | null)[]
  >;
  const o = q.open ?? [];
  const h = q.high ?? [];
  const l = q.low ?? [];
  const c = q.close ?? [];
  const v = q.volume ?? [];
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

function quoteFromMeta(ticker: string, yf: string, currency: string, meta: Record<string, unknown>): LiveQuote {
  const last = Number(meta.regularMarketPrice ?? 0);
  const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
  const volume = Number(meta.regularMarketVolume ?? 0);
  return {
    ticker,
    yfSymbol: yf,
    last,
    previousClose: prev,
    changePct: prev ? ((last - prev) / prev) * 100 : 0,
    volume,
    currency: String(meta.currency ?? currency),
    source: last > 0 ? "yahoo" : "fallback",
    asOf: new Date().toISOString(),
  };
}

async function fetchQuoteForSymbol(ticker: string): Promise<LiveQuote | null> {
  const { key, yf, currency } = resolveYfSymbol(ticker);
  try {
    const r = (await fetchChart(yf, "5d", "1d")) as Record<string, unknown>;
    const meta = (r.meta ?? {}) as Record<string, unknown>;
    const q = quoteFromMeta(key, yf, currency, meta);
    return q.last > 0 ? q : null;
  } catch {
    return null;
  }
}

export const getLiveQuote = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ticker: z.string().min(1).max(32) }).parse)
  .handler(async ({ data }): Promise<LiveQuote> => {
    const candidates = resolveSymbolCandidates(data.ticker);
    for (const c of candidates) {
      const q = await fetchQuoteForSymbol(c);
      if (q) return q;
    }
    const { key, yf, currency } = resolveYfSymbol(data.ticker);
    return {
      ticker: key,
      yfSymbol: yf,
      last: 0,
      previousClose: 0,
      changePct: 0,
      volume: 0,
      currency,
      source: "fallback",
      asOf: new Date().toISOString(),
    };
  });

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator(z.object({ tickers: z.array(z.string().min(1).max(32)).min(1).max(120) }).parse)
  .handler(async ({ data }): Promise<LiveQuote[]> => {
    const CHUNK = 25;
    const out: LiveQuote[] = [];
    for (let i = 0; i < data.tickers.length; i += CHUNK) {
      const chunk = data.tickers.slice(i, i + CHUNK);
      const batch = await Promise.all(
        chunk.map(async (ticker) => {
          const q = await fetchQuoteForSymbol(ticker);
          if (q) return q;
          const { key, yf, currency } = resolveYfSymbol(ticker);
          return {
            ticker: key,
            yfSymbol: yf,
            last: 0,
            previousClose: 0,
            changePct: 0,
            volume: 0,
            currency,
            source: "fallback" as const,
            asOf: new Date().toISOString(),
          };
        }),
      );
      out.push(...batch);
    }
    return out;
  });

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
  "1mo": { range: "1mo", interval: "1d" },
  "3mo": { range: "3mo", interval: "1d" },
  "6mo": { range: "6mo", interval: "1d" },
  "1y": { range: "1y", interval: "1d" },
  "2y": { range: "2y", interval: "1d" },
  "3y": { range: "3y", interval: "1d" },
  "5y": { range: "5y", interval: "1wk" },
  "10y": { range: "10y", interval: "1wk" },
  max: { range: "max", interval: "1mo" },
};

export const getLiveHistory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ticker: z.string().min(1).max(32),
      range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "3y", "5y", "10y", "max"]).default("1y"),
    }).parse,
  )
  .handler(async ({ data }): Promise<LiveHistory> => {
    const candidates = resolveSymbolCandidates(data.ticker);
    const { range, interval } = RANGE_MAP[data.range];
    for (const c of candidates) {
      const { key, yf, currency } = resolveYfSymbol(c);
      try {
        const r = (await fetchChart(yf, range, interval)) as Record<string, unknown>;
        const history = parseHistory(r);
        if (history.length >= 6) {
          return {
            ticker: key,
            yfSymbol: yf,
            currency: String((r.meta as Record<string, unknown>)?.currency ?? currency),
            source: "yahoo",
            asOf: new Date().toISOString(),
            history,
          };
        }
      } catch {
        /* try next candidate */
      }
    }
    const { key, yf, currency } = resolveYfSymbol(data.ticker);
    return {
      ticker: key,
      yfSymbol: yf,
      currency,
      source: "fallback",
      asOf: new Date().toISOString(),
      history: [],
      error: `No historical data for ${data.ticker}. Try TCS.NS format or check if delisted.`,
    };
  });

function validateDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T23:59:59Z");
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (end <= start) throw new Error("End date must be after start date");
  const days = (end.getTime() - start.getTime()) / 86_400_000;
  if (days < 30) throw new Error("Select at least 30 days of history");
  if (days > 3650) throw new Error("Maximum range is 10 years");
  if (end > today) throw new Error("End date cannot be in the future");
}

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
    validateDateRange(data.startDate, data.endDate);
    const candidates = resolveSymbolCandidates(data.ticker);
    const p1 = Math.floor(new Date(data.startDate + "T00:00:00Z").getTime() / 1000);
    const p2 = Math.floor(new Date(data.endDate + "T23:59:59Z").getTime() / 1000);

    for (const c of candidates) {
      const { key, yf, currency } = resolveYfSymbol(c);
      const url = `${YF_BASE}/${encodeURIComponent(yf)}?period1=${p1}&period2=${p2}&interval=${data.interval}&includePrePost=false&events=div%2Csplit`;
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;
        const json = (await res.json()) as { chart?: { result?: Record<string, unknown>[] } };
        const r = json?.chart?.result?.[0];
        if (!r) continue;
        const history = parseHistory(r);
        if (history.length >= 6) {
          return {
            ticker: key,
            yfSymbol: yf,
            currency: String((r.meta as Record<string, unknown>)?.currency ?? currency),
            source: "yahoo",
            asOf: new Date().toISOString(),
            history,
          };
        }
      } catch {
        /* next */
      }
    }
    const { key, yf, currency } = resolveYfSymbol(data.ticker);
    return {
      ticker: key,
      yfSymbol: yf,
      currency,
      source: "fallback",
      asOf: new Date().toISOString(),
      history: [],
      error: `No data for ${data.ticker} between ${data.startDate} and ${data.endDate}`,
    };
  });

export const validateTicker = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ticker: z.string().min(1).max(32) }).parse)
  .handler(async ({ data }) => {
    const candidates = resolveSymbolCandidates(data.ticker);
    for (const c of candidates) {
      const { key, yf } = resolveYfSymbol(c);
      try {
        const r = (await fetchChart(yf, "5d", "1d")) as Record<string, unknown>;
        const meta = (r.meta ?? {}) as Record<string, unknown>;
        const last = Number(meta.regularMarketPrice ?? 0);
        if (last > 0) {
          return {
            valid: true as const,
            symbol: key,
            yfSymbol: yf,
            name: String(meta.longName ?? meta.shortName ?? key),
            currency: String(meta.currency ?? "INR"),
            exchange: String(meta.exchangeName ?? meta.fullExchangeName ?? "—"),
            last,
          };
        }
      } catch {
        /* try next */
      }
    }
    return {
      valid: false as const,
      symbol: normalizeTickerKey(data.ticker),
      message: `Symbol "${data.ticker}" not found. Try TCS or TCS.NS for NSE stocks.`,
    };
  });
