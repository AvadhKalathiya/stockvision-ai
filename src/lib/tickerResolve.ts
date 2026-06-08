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
  "NIFTY NEXT 50": "NIFTYNEXT50",
  NIFTYNEXT50: "NIFTYNEXT50",
};

const COMPANY_NAME_ALIASES: Record<string, string> = {
  RELIANCE: "RELIANCE",
  "RELIANCE INDUSTRIES": "RELIANCE",
  "RELIANCE IND": "RELIANCE",
  TCS: "TCS",
  "TATA CONSULTANCY SERVICES": "TCS",
  HDFCBANK: "HDFCBANK",
  "HDFC BANK": "HDFCBANK",
  INFY: "INFY",
  INFOSYS: "INFY",
  "INFOSYS LTD": "INFY",
  ICICIBANK: "ICICIBANK",
  "ICICI BANK": "ICICIBANK",
  HINDUNILVR: "HINDUNILVR",
  "HINDUSTAN UNILEVER": "HINDUNILVR",
  ITC: "ITC",
  "ITC LTD": "ITC",
  SBIN: "SBIN",
  "STATE BANK OF INDIA": "SBIN",
  "SBI": "SBIN",
  BHARTIARTL: "BHARTIARTL",
  "BHARTI AIRTEL": "BHARTIARTL",
  "AIRTEL": "BHARTIARTL",
  KOTAKBANK: "KOTAKBANK",
  "KOTAK MAHINDRA BANK": "KOTAKBANK",
  "KOTAK": "KOTAKBANK",
  LT: "LT",
  "LARSEN & TOUBRO": "LT",
  "L&T": "LT",
  AXISBANK: "AXISBANK",
  "AXIS BANK": "AXISBANK",
  ASIANPAINT: "ASIANPAINT",
  "ASIAN PAINTS": "ASIANPAINT",
  MARUTI: "MARUTI",
  "MARUTI SUZUKI": "MARUTI",
  TITAN: "TITAN",
  "TITAN COMPANY": "TITAN",
  SUNPHARMA: "SUNPHARMA",
  "SUN PHARMACEUTICAL": "SUNPHARMA",
  "SUN PHARMA": "SUNPHARMA",
  BAJFINANCE: "BAJFINANCE",
  "BAJAJ FINANCE": "BAJFINANCE",
  WIPRO: "WIPRO",
  HCLTECH: "HCLTECH",
  "HCL TECHNOLOGIES": "HCLTECH",
  ULTRACEMCO: "ULTRACEMCO",
  "ULTRATECH CEMENT": "ULTRACEMCO",
  NTPC: "NTPC",
  POWERGRID: "POWERGRID",
  "POWER GRID": "POWERGRID",
  "M&M": "M&M",
  "MAHINDRA & MAHINDRA": "M&M",
  TATAMOTORS: "TATAMOTORS",
  "TATA MOTORS": "TATAMOTORS",
  ONGC: "ONGC",
  ADANIENT: "ADANIENT",
  "ADANI ENTERPRISES": "ADANIENT",
  ADANIPORTS: "ADANIPORTS",
  "ADANI PORTS": "ADANIPORTS",
  JSWSTEEL: "JSWSTEEL",
  "JSW STEEL": "JSWSTEEL",
  TATASTEEL: "TATASTEEL",
  "TATA STEEL": "TATASTEEL",
  INDUSINDBK: "INDUSINDBK",
  "INDUSIND BANK": "INDUSINDBK",
  TECHM: "TECHM",
  "TECH MAHINDRA": "TECHM",
  HINDALCO: "HINDALCO",
  COALINDIA: "COALINDIA",
  "COAL INDIA": "COALINDIA",
  DIVISLAB: "DIVISLAB",
  "DIVIS LABORATORIES": "DIVISLAB",
  GRASIM: "GRASIM",
  BPCL: "BPCL",
  "BHARAT PETROLEUM": "BPCL",
  EICHERMOT: "EICHERMOT",
  "EICHER MOTORS": "EICHERMOT",
  CIPLA: "CIPLA",
  DRREDDY: "DRREDDY",
  "DR REDDY": "DRREDDY",
  "DR REDDY'S": "DRREDDY",
  APOLLOHOSP: "APOLLOHOSP",
  "APOLLO HOSPITALS": "APOLLOHOSP",
  HEROMOTOCO: "HEROMOTOCO",
  "HERO MOTOCORP": "HEROMOTOCO",
  "HERO": "HEROMOTOCO",
  BRITANNIA: "BRITANNIA",
  "BRITANNIA INDUSTRIES": "BRITANNIA",
  NESTLEIND: "NESTLEIND",
  "NESTLE INDIA": "NESTLEIND",
  "NESTLE": "NESTLEIND",
  TRENT: "TRENT",
  BEL: "BEL",
  "BHARAT ELECTRONICS": "BEL",
  SHRIRAMFIN: "SHRIRAMFIN",
  "SHRIRAM FINANCE": "SHRIRAMFIN",
  BAJAJAUTO: "BAJAJ-AUTO",
  "BAJAJ AUTO": "BAJAJ-AUTO",
  TATACONSUM: "TATACONSUM",
  "TATA CONSUMER": "TATACONSUM",
  LTIM: "LTIM",
  "LTIMINDTREE": "LTIM",
  HDFCLIFE: "HDFCLIFE",
  "HDFC LIFE": "HDFCLIFE",
};

function fuzzyMatch(input: string, target: string): number {
  const lowerInput = input.toLowerCase();
  const lowerTarget = target.toLowerCase();
  
  if (lowerInput === lowerTarget) return 100;
  if (lowerTarget.includes(lowerInput)) return 80;
  if (lowerInput.includes(lowerTarget)) return 70;
  
  let score = 0;
  let inputIdx = 0;
  for (const char of lowerTarget) {
    if (inputIdx < lowerInput.length && char === lowerInput[inputIdx]) {
      score += 10;
      inputIdx++;
    }
  }
  
  return score;
}

export function searchTickers(query: string, limit = 10): Array<{ symbol: string; name: string; matchScore: number }> {
  const raw = query.trim().toUpperCase();
  if (!raw) return [];
  
  const results: Array<{ symbol: string; name: string; matchScore: number }> = [];
  
  for (const [key, config] of Object.entries(TICKER_CONFIG)) {
    const name = (config as { name?: string }).name || key;
    const symbolScore = fuzzyMatch(raw, key);
    const nameScore = fuzzyMatch(raw, name);
    const score = Math.max(symbolScore, nameScore);
    
    if (score >= 50) {
      results.push({ symbol: key, name, matchScore: score });
    }
  }
  
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/** Build ordered Yahoo symbol candidates for Indian + global tickers. */
export function resolveSymbolCandidates(input: string): string[] {
  const raw = input.trim().toUpperCase();
  if (!raw) return [];

  const alias = COMPANY_NAME_ALIASES[raw];
  const normalized = alias || raw;

  if (INDEX_ALIASES[normalized]) return [INDEX_ALIASES[normalized]];
  if ((TICKER_CONFIG as Record<string, unknown>)[normalized]) return [normalized];

  const out: string[] = [];
  if (normalized.includes(".")) {
    out.push(normalized);
    const base = normalized.split(".")[0];
    if (!normalized.endsWith(".NS")) out.push(`${base}.NS`);
    if (!normalized.endsWith(".BO")) out.push(`${base}.BO`);
  } else {
    out.push(`${normalized}.NS`, `${normalized}.BO`, normalized);
  }

  return [...new Set(out)];
}

/** Resolve to canonical config key or best Yahoo symbol. */
export function resolveYfSymbol(input: string): { key: string; yf: string; currency: string } {
  const raw = input.trim().toUpperCase();
  const alias = COMPANY_NAME_ALIASES[raw];
  const normalized = alias || raw;
  
  const candidates = resolveSymbolCandidates(normalized);
  for (const c of candidates) {
    const cfg = (TICKER_CONFIG as Record<string, { yf: string; currency: string }>)[c];
    if (cfg) return { key: c, yf: cfg.yf, currency: cfg.currency };
  }
  
  const primary = candidates[0] ?? normalized;
  const isIndian = primary.endsWith(".NS") || primary.endsWith(".BO");
  return { key: primary, yf: primary, currency: isIndian ? "INR" : "USD" };
}

export function normalizeTickerKey(input: string): string {
  return resolveYfSymbol(input).key;
}
