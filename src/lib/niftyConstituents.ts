/** NIFTY 50 + NIFTY NEXT 50 NSE symbols (without .NS suffix). */
export const NIFTY50_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", "SBIN",
  "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN",
  "SUNPHARMA", "BAJFINANCE", "WIPRO", "HCLTECH", "ULTRACEMCO", "NTPC", "POWERGRID",
  "M&M", "TATAMOTORS", "ONGC", "ADANIENT", "ADANIPORTS", "JSWSTEEL", "TATASTEEL",
  "INDUSINDBK", "TECHM", "HINDALCO", "COALINDIA", "DIVISLAB", "GRASIM", "BPCL",
  "EICHERMOT", "CIPLA", "DRREDDY", "APOLLOHOSP", "HEROMOTOCO", "BRITANNIA",
  "NESTLEIND", "TRENT", "BEL", "SHRIRAMFIN", "BAJAJ-AUTO", "TATACONSUM", "LTIM",
  "HDFCLIFE",
] as const;

export const NIFTY_NEXT50_SYMBOLS = [
  "ABB", "ADANIENSOL", "AMBUJACEM", "AUROPHARMA", "BAJAJFINSV", "BANKBARODA",
  "BERGEPAINT", "BOSCHLTD", "CANBK", "CHOLAFIN", "COLPAL", "DABUR", "DLF", "DMART",
  "GAIL", "GODREJCP", "HAL", "HAVELLS", "HDFCAMC", "ICICIPRULI", "ICICIGI", "INDIGO",
  "IOC", "IRCTC", "JINDALSTEL", "LICI", "MARICO", "MOTHERSON", "NAUKRI", "OFSS",
  "PERSISTENT", "PETRONET", "PIDILITIND", "PNB", "RECLTD", "SRF", "SIEMENS",
  "TATAPOWER", "TATAELXSI", "TVSMOTOR", "UPL", "VBL", "VEDL", "ZOMATO", "INDHOTEL",
  "JIOFIN", "MAXHEALTH", "NHPC", "NYKAA", "POLYCAB",
] as const;

export const STOCK_SECTOR_MAP: Record<string, string> = {
  RELIANCE: "Conglomerate", TCS: "IT Services", HDFCBANK: "Banking", INFY: "IT Services",
  ICICIBANK: "Banking", HINDUNILVR: "FMCG", ITC: "FMCG", SBIN: "Banking",
  BHARTIARTL: "Telecom", KOTAKBANK: "Banking", LT: "Infrastructure", AXISBANK: "Banking",
  ASIANPAINT: "Paints", MARUTI: "Auto", TITAN: "Consumer", SUNPHARMA: "Pharma",
  BAJFINANCE: "NBFC", WIPRO: "IT Services", HCLTECH: "IT Services", ULTRACEMCO: "Cement",
  NTPC: "Power", POWERGRID: "Power", "M&M": "Auto", TATAMOTORS: "Auto", ONGC: "Energy",
  ADANIENT: "Conglomerate", ADANIPORTS: "Infrastructure", JSWSTEEL: "Metals",
  TATASTEEL: "Metals", INDUSINDBK: "Banking", TECHM: "IT Services", HINDALCO: "Metals",
  COALINDIA: "Energy", DIVISLAB: "Pharma", GRASIM: "Diversified", BPCL: "Energy",
  EICHERMOT: "Auto", CIPLA: "Pharma", DRREDDY: "Pharma", APOLLOHOSP: "Healthcare",
  HEROMOTOCO: "Auto", BRITANNIA: "FMCG", NESTLEIND: "FMCG", TRENT: "Retail", BEL: "Defence",
  SHRIRAMFIN: "NBFC", "BAJAJ-AUTO": "Auto", TATACONSUM: "FMCG", LTIM: "IT Services",
  HDFCLIFE: "Insurance",
};

export function displayName(sym: string): string {
  return sym.replace(/-/g, " ");
}
