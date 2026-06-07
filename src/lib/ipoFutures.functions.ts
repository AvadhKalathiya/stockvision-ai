import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type IpoItem = {
  name: string;
  symbol?: string;
  market: "INDIA" | "GLOBAL";
  status: "upcoming" | "open" | "listed";
  openDate?: string;
  closeDate?: string;
  listingDate?: string;
  priceBand?: string;
  issueSize?: string;
  exchange?: string;
  source: "firecrawl" | "fallback";
};

export type FutureContract = {
  symbol: string;
  name: string;
  last: number;
  changePct: number;
  currency: string;
  category: "INDEX" | "COMMODITY" | "CURRENCY" | "CRYPTO";
};

const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/* ---------------- Futures (Yahoo Finance) ---------------- */

const FUTURES_UNIVERSE: { symbol: string; name: string; category: FutureContract["category"] }[] = [
  // Index futures
  { symbol: "ES=F", name: "S&P 500 E-mini", category: "INDEX" },
  { symbol: "NQ=F", name: "Nasdaq 100 E-mini", category: "INDEX" },
  { symbol: "YM=F", name: "Dow E-mini", category: "INDEX" },
  { symbol: "RTY=F", name: "Russell 2000 E-mini", category: "INDEX" },
  { symbol: "NKD=F", name: "Nikkei 225", category: "INDEX" },
  // Commodity
  { symbol: "GC=F", name: "Gold", category: "COMMODITY" },
  { symbol: "SI=F", name: "Silver", category: "COMMODITY" },
  { symbol: "CL=F", name: "Crude Oil WTI", category: "COMMODITY" },
  { symbol: "BZ=F", name: "Brent Crude", category: "COMMODITY" },
  { symbol: "NG=F", name: "Natural Gas", category: "COMMODITY" },
  { symbol: "HG=F", name: "Copper", category: "COMMODITY" },
  // Currency
  { symbol: "6E=F", name: "Euro FX", category: "CURRENCY" },
  { symbol: "6J=F", name: "Japanese Yen", category: "CURRENCY" },
  { symbol: "DX=F", name: "US Dollar Index", category: "CURRENCY" },
  // Crypto
  { symbol: "BTC=F", name: "Bitcoin Futures", category: "CRYPTO" },
  { symbol: "ETH=F", name: "Ether Futures", category: "CRYPTO" },
];

export const getFutures = createServerFn({ method: "GET" }).handler(
  async (): Promise<FutureContract[]> => {
    const out = await Promise.all(
      FUTURES_UNIVERSE.map(async (f) => {
        try {
          const res = await fetch(
            `${YF_BASE}/${encodeURIComponent(f.symbol)}?interval=1d&range=5d`,
            {
              headers: { "User-Agent": UA, Accept: "application/json" },
            },
          );
          if (!res.ok) throw new Error(String(res.status));
          const json = (await res.json()) as any;
          const meta = json?.chart?.result?.[0]?.meta ?? {};
          const last = Number(meta.regularMarketPrice ?? 0);
          const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
          return {
            symbol: f.symbol,
            name: f.name,
            last,
            changePct: prev ? ((last - prev) / prev) * 100 : 0,
            currency: meta.currency ?? "USD",
            category: f.category,
          } satisfies FutureContract;
        } catch (e) {
          console.error("future failed", f.symbol, e);
          return {
            symbol: f.symbol,
            name: f.name,
            last: 0,
            changePct: 0,
            currency: "USD",
            category: f.category,
          };
        }
      }),
    );
    return out;
  },
);

/* ---------------- IPO Calendar (Firecrawl) ---------------- */

const IPO_SOURCES = {
  INDIA: "https://www.chittorgarh.com/report/mainboard-ipo-list-in-india-bse-nse/83/",
  GLOBAL: "https://www.nasdaq.com/market-activity/ipos",
};

async function firecrawlScrape(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  if (!res.ok) throw new Error(`Firecrawl ${res.status}`);
  const json = (await res.json()) as any;
  return json?.data?.markdown ?? json?.markdown ?? "";
}

function parseIndiaIpoMarkdown(md: string): IpoItem[] {
  // Chittorgarh tables: rows like | Issuer | Open | Close | Listing | Price | Size |
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
  const items: IpoItem[] = [];
  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4) continue;
    if (/issuer|company/i.test(cells[0]) && /open/i.test(cells[1] ?? "")) continue;
    if (/^[-:\s]+$/.test(cells[0])) continue;
    const name = cells[0].replace(/\[|\]\(.+?\)/g, "").trim();
    if (!name || name.length > 120) continue;
    items.push({
      name,
      market: "INDIA",
      status: /upcoming/i.test(md) ? "upcoming" : "open",
      openDate: cells[1],
      closeDate: cells[2],
      listingDate: cells[3],
      priceBand: cells[4],
      issueSize: cells[5],
      exchange: "NSE/BSE",
      source: "firecrawl",
    });
    if (items.length >= 25) break;
  }
  return items;
}

function parseGlobalIpoMarkdown(md: string): IpoItem[] {
  const lines = md.split("\n").filter((l) => l.trim().startsWith("|"));
  const items: IpoItem[] = [];
  for (const line of lines) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    if (/symbol|company/i.test(cells[0])) continue;
    if (/^[-:\s]+$/.test(cells[0])) continue;
    const symbol = cells[0].replace(/\[|\]\(.+?\)/g, "").trim();
    const name = cells[1] ?? symbol;
    if (!symbol || symbol.length > 20) continue;
    items.push({
      name,
      symbol,
      market: "GLOBAL",
      status: "upcoming",
      listingDate: cells[2],
      priceBand: cells[3],
      issueSize: cells[4],
      exchange: "NASDAQ",
      source: "firecrawl",
    });
    if (items.length >= 25) break;
  }
  return items;
}

export const getIpoCalendar = createServerFn({ method: "POST" })
  .inputValidator(z.object({ market: z.enum(["INDIA", "GLOBAL", "ALL"]).default("ALL") }).parse)
  .handler(async ({ data }): Promise<IpoItem[]> => {
    const targets: ("INDIA" | "GLOBAL")[] =
      data.market === "ALL" ? ["INDIA", "GLOBAL"] : [data.market];
    const results = await Promise.all(
      targets.map(async (m) => {
        try {
          const md = await firecrawlScrape(IPO_SOURCES[m]);
          return m === "INDIA" ? parseIndiaIpoMarkdown(md) : parseGlobalIpoMarkdown(md);
        } catch (err) {
          console.error(`IPO scrape ${m} failed:`, err);
          return [] as IpoItem[];
        }
      }),
    );
    return results.flat();
  });
