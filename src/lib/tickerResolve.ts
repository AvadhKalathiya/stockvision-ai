import { TICKER_CONFIG } from "./tickerConfig";

const INDEX_ALIASES: Record<string, string> = {
  NIFTY: "NIFTY50",
  NIFTY50: "NIFTY50",
  "NIFTY 50": "NIFTY50",
  "^NSEI": "NIFTY50",
  BANKNIFTY: "BANKNIFTY",
  "BANK NIFTY": "BANKNIFTY",
  "^NSEBANK": "BANKNIFTY",
  SENSEX: "SENSEX",
  "^BSESN": "SENSEX",
};

/** Build ordered Yahoo symbol candidates for Indian + global tickers. */
export function resolveSymbolCandidates(input: string): string[] {
  const raw = input.trim().toUpperCase();
  if (!raw) return [];

  if (INDEX_ALIASES[raw]) return [INDEX_ALIASES[raw]];
  if ((TICKER_CONFIG as Record<string, unknown>)[raw]) return [raw];

  const out: string[] = [];
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

/** Resolve to canonical config key or best Yahoo symbol. */
export function resolveYfSymbol(input: string): { key: string; yf: string; currency: string } {
  const candidates = resolveSymbolCandidates(input);
  for (const c of candidates) {
    const cfg = (TICKER_CONFIG as Record<string, { yf: string; currency: string }>)[c];
    if (cfg) return { key: c, yf: cfg.yf, currency: cfg.currency };
  }
  const primary = candidates[0] ?? input.trim().toUpperCase();
  const isIndian = primary.endsWith(".NS") || primary.endsWith(".BO");
  return { key: primary, yf: primary, currency: isIndian ? "INR" : "USD" };
}

export function normalizeTickerKey(input: string): string {
  return resolveYfSymbol(input).key;
}
