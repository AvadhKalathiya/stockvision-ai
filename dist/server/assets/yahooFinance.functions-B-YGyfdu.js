import { c as createServerRpc } from "./createServerRpc-Cl0K4URf.js";
import { k as createServerFn } from "./server-Cgfy5VtR.js";
import { T as TICKER_CONFIG } from "./tickerConfig-7S1tvlm8.js";
import { o as objectType, s as stringType, a as arrayType, e as enumType } from "./types-BfPr8xct.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const INDEX_ALIASES = {
  NIFTY: "NIFTY50",
  NIFTY50: "NIFTY50",
  "NIFTY 50": "NIFTY50",
  "^NSEI": "NIFTY50",
  BANKNIFTY: "BANKNIFTY",
  "BANK NIFTY": "BANKNIFTY",
  "^NSEBANK": "BANKNIFTY",
  SENSEX: "SENSEX",
  "^BSESN": "SENSEX"
};
function resolveSymbolCandidates(input) {
  const raw = input.trim().toUpperCase();
  if (!raw) return [];
  if (INDEX_ALIASES[raw]) return [INDEX_ALIASES[raw]];
  if (TICKER_CONFIG[raw]) return [raw];
  const out = [];
  if (raw.includes(".")) {
    out.push(raw);
    const base = raw.split(".")[0];
    if (!raw.endsWith(".NS")) out.push(`${base}.NS`);
    if (!raw.endsWith(".BO")) out.push(`${base}.BO`);
  } else {
    out.push(`${raw}.NS`, `${raw}.BO`, raw);
  }
  return [...new Set(out)];
}
function resolveYfSymbol(input) {
  const candidates = resolveSymbolCandidates(input);
  for (const c of candidates) {
    const cfg = TICKER_CONFIG[c];
    if (cfg) return { key: c, yf: cfg.yf, currency: cfg.currency };
  }
  const primary = candidates[0] ?? input.trim().toUpperCase();
  const isIndian = primary.endsWith(".NS") || primary.endsWith(".BO");
  return { key: primary, yf: primary, currency: isIndian ? "INR" : "USD" };
}
function normalizeTickerKey(input) {
  return resolveYfSymbol(input).key;
}
const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 12e3;
async function fetchWithTimeout(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...init?.headers ?? {}
      }
    });
  } finally {
    clearTimeout(timer);
  }
}
async function fetchChart(yfSymbol, range, interval) {
  const url = `${YF_BASE}/${encodeURIComponent(yfSymbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Yahoo Finance error ${res.status}`);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("Yahoo Finance: invalid JSON response");
  }
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error("Yahoo Finance: empty result");
  return r;
}
function parseHistory(result) {
  const ts = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};
  const o = q.open ?? [];
  const h = q.high ?? [];
  const l = q.low ?? [];
  const c = q.close ?? [];
  const v = q.volume ?? [];
  const out = [];
  for (let i = 0; i < ts.length; i++) {
    const close = c[i];
    if (close == null) continue;
    out.push({
      date: new Date(ts[i] * 1e3).toISOString().split("T")[0],
      open: o[i] ?? close,
      high: h[i] ?? close,
      low: l[i] ?? close,
      close,
      volume: v[i] ?? 0
    });
  }
  return out;
}
function quoteFromMeta(ticker, yf, currency, meta) {
  const last = Number(meta.regularMarketPrice ?? 0);
  const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
  const volume = Number(meta.regularMarketVolume ?? 0);
  return {
    ticker,
    yfSymbol: yf,
    last,
    previousClose: prev,
    changePct: prev ? (last - prev) / prev * 100 : 0,
    volume,
    currency: String(meta.currency ?? currency),
    source: last > 0 ? "yahoo" : "fallback",
    asOf: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function fetchQuoteForSymbol(ticker) {
  const {
    key,
    yf,
    currency
  } = resolveYfSymbol(ticker);
  try {
    const r = await fetchChart(yf, "5d", "1d");
    const meta = r.meta ?? {};
    const q = quoteFromMeta(key, yf, currency, meta);
    return q.last > 0 ? q : null;
  } catch {
    return null;
  }
}
const getLiveQuote_createServerFn_handler = createServerRpc({
  id: "35048b632e1d03853cfb6722dc1128d7eea7901e38cc6338bb4c5d22b041493e",
  name: "getLiveQuote",
  filename: "src/lib/yahooFinance.functions.ts"
}, (opts) => getLiveQuote.__executeServer(opts));
const getLiveQuote = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32)
}).parse).handler(getLiveQuote_createServerFn_handler, async ({
  data
}) => {
  const candidates = resolveSymbolCandidates(data.ticker);
  for (const c of candidates) {
    const q = await fetchQuoteForSymbol(c);
    if (q) return q;
  }
  const {
    key,
    yf,
    currency
  } = resolveYfSymbol(data.ticker);
  return {
    ticker: key,
    yfSymbol: yf,
    last: 0,
    previousClose: 0,
    changePct: 0,
    volume: 0,
    currency,
    source: "fallback",
    asOf: (/* @__PURE__ */ new Date()).toISOString()
  };
});
const getLiveQuotes_createServerFn_handler = createServerRpc({
  id: "b98a26ca9209f796b22a2bb05e606ffeede39b81236ec24ad960240a08091196",
  name: "getLiveQuotes",
  filename: "src/lib/yahooFinance.functions.ts"
}, (opts) => getLiveQuotes.__executeServer(opts));
const getLiveQuotes = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  tickers: arrayType(stringType().min(1).max(32)).min(1).max(120)
}).parse).handler(getLiveQuotes_createServerFn_handler, async ({
  data
}) => {
  const CHUNK = 25;
  const out = [];
  for (let i = 0; i < data.tickers.length; i += CHUNK) {
    const chunk = data.tickers.slice(i, i + CHUNK);
    const batch = await Promise.all(chunk.map(async (ticker) => {
      const q = await fetchQuoteForSymbol(ticker);
      if (q) return q;
      const {
        key,
        yf,
        currency
      } = resolveYfSymbol(ticker);
      return {
        ticker: key,
        yfSymbol: yf,
        last: 0,
        previousClose: 0,
        changePct: 0,
        volume: 0,
        currency,
        source: "fallback",
        asOf: (/* @__PURE__ */ new Date()).toISOString()
      };
    }));
    out.push(...batch);
  }
  return out;
});
const RANGE_MAP = {
  "1mo": {
    range: "1mo",
    interval: "1d"
  },
  "3mo": {
    range: "3mo",
    interval: "1d"
  },
  "6mo": {
    range: "6mo",
    interval: "1d"
  },
  "1y": {
    range: "1y",
    interval: "1d"
  },
  "2y": {
    range: "2y",
    interval: "1d"
  },
  "3y": {
    range: "3y",
    interval: "1d"
  },
  "5y": {
    range: "5y",
    interval: "1wk"
  },
  "10y": {
    range: "10y",
    interval: "1wk"
  },
  max: {
    range: "max",
    interval: "1mo"
  }
};
const getLiveHistory_createServerFn_handler = createServerRpc({
  id: "9c0f0fa9c259ac7ec8b8ce29284e5fe197297dde0fcf7d92ff2ad41efefbec66",
  name: "getLiveHistory",
  filename: "src/lib/yahooFinance.functions.ts"
}, (opts) => getLiveHistory.__executeServer(opts));
const getLiveHistory = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32),
  range: enumType(["1mo", "3mo", "6mo", "1y", "2y", "3y", "5y", "10y", "max"]).default("1y")
}).parse).handler(getLiveHistory_createServerFn_handler, async ({
  data
}) => {
  const candidates = resolveSymbolCandidates(data.ticker);
  const {
    range,
    interval
  } = RANGE_MAP[data.range];
  for (const c of candidates) {
    const {
      key: key2,
      yf: yf2,
      currency: currency2
    } = resolveYfSymbol(c);
    try {
      const r = await fetchChart(yf2, range, interval);
      const history = parseHistory(r);
      if (history.length >= 6) {
        return {
          ticker: key2,
          yfSymbol: yf2,
          currency: String(r.meta?.currency ?? currency2),
          source: "yahoo",
          asOf: (/* @__PURE__ */ new Date()).toISOString(),
          history
        };
      }
    } catch {
    }
  }
  const {
    key,
    yf,
    currency
  } = resolveYfSymbol(data.ticker);
  return {
    ticker: key,
    yfSymbol: yf,
    currency,
    source: "fallback",
    asOf: (/* @__PURE__ */ new Date()).toISOString(),
    history: [],
    error: `No historical data for ${data.ticker}. Try TCS.NS format or check if delisted.`
  };
});
function validateDateRange(startDate, endDate) {
  const start = /* @__PURE__ */ new Date(startDate + "T00:00:00Z");
  const end = /* @__PURE__ */ new Date(endDate + "T23:59:59Z");
  const today = /* @__PURE__ */ new Date();
  today.setHours(23, 59, 59, 999);
  if (end <= start) throw new Error("End date must be after start date");
  const days = (end.getTime() - start.getTime()) / 864e5;
  if (days < 30) throw new Error("Select at least 30 days of history");
  if (days > 3650) throw new Error("Maximum range is 10 years");
  if (end > today) throw new Error("End date cannot be in the future");
}
const getHistoryByDateRange_createServerFn_handler = createServerRpc({
  id: "4f1b40526a9bb18beecec6d1117f3546cb5ae2bc039791007ab46908ec4abb35",
  name: "getHistoryByDateRange",
  filename: "src/lib/yahooFinance.functions.ts"
}, (opts) => getHistoryByDateRange.__executeServer(opts));
const getHistoryByDateRange = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32),
  startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  interval: enumType(["1d", "1wk", "1mo"]).default("1d")
}).parse).handler(getHistoryByDateRange_createServerFn_handler, async ({
  data
}) => {
  validateDateRange(data.startDate, data.endDate);
  const candidates = resolveSymbolCandidates(data.ticker);
  const p1 = Math.floor((/* @__PURE__ */ new Date(data.startDate + "T00:00:00Z")).getTime() / 1e3);
  const p2 = Math.floor((/* @__PURE__ */ new Date(data.endDate + "T23:59:59Z")).getTime() / 1e3);
  for (const c of candidates) {
    const {
      key: key2,
      yf: yf2,
      currency: currency2
    } = resolveYfSymbol(c);
    const url = `${YF_BASE}/${encodeURIComponent(yf2)}?period1=${p1}&period2=${p2}&interval=${data.interval}&includePrePost=false&events=div%2Csplit`;
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const json = await res.json();
      const r = json?.chart?.result?.[0];
      if (!r) continue;
      const history = parseHistory(r);
      if (history.length >= 6) {
        return {
          ticker: key2,
          yfSymbol: yf2,
          currency: String(r.meta?.currency ?? currency2),
          source: "yahoo",
          asOf: (/* @__PURE__ */ new Date()).toISOString(),
          history
        };
      }
    } catch {
    }
  }
  const {
    key,
    yf,
    currency
  } = resolveYfSymbol(data.ticker);
  return {
    ticker: key,
    yfSymbol: yf,
    currency,
    source: "fallback",
    asOf: (/* @__PURE__ */ new Date()).toISOString(),
    history: [],
    error: `No data for ${data.ticker} between ${data.startDate} and ${data.endDate}`
  };
});
const validateTicker_createServerFn_handler = createServerRpc({
  id: "12e7f71e3765402fa1a9173344b948f6b3654892ac293e5593954ef534a8017c",
  name: "validateTicker",
  filename: "src/lib/yahooFinance.functions.ts"
}, (opts) => validateTicker.__executeServer(opts));
const validateTicker = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  ticker: stringType().min(1).max(32)
}).parse).handler(validateTicker_createServerFn_handler, async ({
  data
}) => {
  const candidates = resolveSymbolCandidates(data.ticker);
  for (const c of candidates) {
    const {
      key,
      yf
    } = resolveYfSymbol(c);
    try {
      const r = await fetchChart(yf, "5d", "1d");
      const meta = r.meta ?? {};
      const last = Number(meta.regularMarketPrice ?? 0);
      if (last > 0) {
        return {
          valid: true,
          symbol: key,
          yfSymbol: yf,
          name: String(meta.longName ?? meta.shortName ?? key),
          currency: String(meta.currency ?? "INR"),
          exchange: String(meta.exchangeName ?? meta.fullExchangeName ?? "—"),
          last
        };
      }
    } catch {
    }
  }
  return {
    valid: false,
    symbol: normalizeTickerKey(data.ticker),
    message: `Symbol "${data.ticker}" not found. Try TCS or TCS.NS for NSE stocks.`
  };
});
export {
  getHistoryByDateRange_createServerFn_handler,
  getLiveHistory_createServerFn_handler,
  getLiveQuote_createServerFn_handler,
  getLiveQuotes_createServerFn_handler,
  validateTicker_createServerFn_handler
};
