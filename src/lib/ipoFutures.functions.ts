import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type IpoItem = {
  name: string;
  symbol?: string;
  market: "INDIA";
  status: "upcoming" | "open" | "closed" | "listed";
  openDate?: string;
  closeDate?: string;
  listingDate?: string;
  priceBand?: string;
  issueSize?: string;
  issuePrice?: number;
  subscription?: string;
  gmp?: number;
  exchange?: string;
  source: "nse" | "bse" | "exchange";
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

const FUTURES_UNIVERSE: { symbol: string; name: string; category: FutureContract["category"] }[] = [
  { symbol: "ES=F", name: "S&P 500 E-mini", category: "INDEX" },
  { symbol: "NQ=F", name: "Nasdaq 100 E-mini", category: "INDEX" },
  { symbol: "YM=F", name: "Dow E-mini", category: "INDEX" },
  { symbol: "GC=F", name: "Gold", category: "COMMODITY" },
  { symbol: "CL=F", name: "Crude Oil WTI", category: "COMMODITY" },
  { symbol: "BTC=F", name: "Bitcoin Futures", category: "CRYPTO" },
];

export const getFutures = createServerFn({ method: "GET" }).handler(
  async (): Promise<FutureContract[]> => {
    return Promise.all(
      FUTURES_UNIVERSE.map(async (f) => {
        try {
          const res = await fetch(`${YF_BASE}/${encodeURIComponent(f.symbol)}?interval=1d&range=5d`, {
            headers: { "User-Agent": UA, Accept: "application/json" },
          });
          if (!res.ok) throw new Error(String(res.status));
          const json = (await res.json()) as { chart?: { result?: { meta?: Record<string, number> }[] } };
          const meta = json?.chart?.result?.[0]?.meta ?? {};
          const last = Number(meta.regularMarketPrice ?? 0);
          const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
          return {
            symbol: f.symbol,
            name: f.name,
            last,
            changePct: prev ? ((last - prev) / prev) * 100 : 0,
            currency: "USD",
            category: f.category,
          };
        } catch {
          return { symbol: f.symbol, name: f.name, last: 0, changePct: 0, currency: "USD", category: f.category };
        }
      }),
    );
  },
);

async function nseFetch(path: string): Promise<unknown> {
  const base = "https://www.nseindia.com";
  const init = await fetch(base, {
    headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en-US,en;q=0.9" },
  });
  const cookie = init.headers.get("set-cookie") ?? "";
  const res = await fetch(`${base}${path}`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Referer: `${base}/market-data/all-upcoming-issues-ipo`,
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: cookie,
    },
  });
  if (!res.ok) throw new Error(`NSE ${res.status}`);
  return res.json();
}

function mapNseStatus(s: string): IpoItem["status"] {
  const u = (s ?? "").toLowerCase();
  if (u.includes("open") || u.includes("current")) return "open";
  if (u.includes("list") || u.includes("listed")) return "listed";
  if (u.includes("close") || u.includes("past")) return "closed";
  return "upcoming";
}

function parseNseIpos(data: unknown): IpoItem[] {
  const rows = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
  return rows.slice(0, 40).map((row: Record<string, unknown>) => {
    const name = String(row.companyName ?? row.issuerName ?? row.symbol ?? "—");
    const issueSize = String(row.issueSize ?? row.issueSizeInRs ?? row.issueSizeRs ?? "—");
    const priceBand = String(row.priceBand ?? row.issuePrice ?? row.floorPrice ?? "—");
    const openDate = String(row.issueOpenDate ?? row.openDate ?? row.bidOpenDate ?? "");
    const closeDate = String(row.issueCloseDate ?? row.closeDate ?? row.bidCloseDate ?? "");
    const listingDate = String(row.listingDate ?? row.listDate ?? "");
    const sub = row.subscription ?? row.subscriptionTimes ?? row.totalSubscription;
    return {
      name,
      symbol: String(row.symbol ?? ""),
      market: "INDIA" as const,
      status: mapNseStatus(String(row.issueStatus ?? row.status ?? row.issuerType ?? "")),
      openDate: openDate || undefined,
      closeDate: closeDate || undefined,
      listingDate: listingDate || undefined,
      priceBand,
      issueSize,
      subscription: sub != null ? String(sub) : undefined,
      exchange: "NSE",
      source: "nse" as const,
    };
  });
}

async function fetchBseIpos(): Promise<IpoItem[]> {
  const url = "https://api.bseindia.com/BseIndiaAPI/api/IPOIssueInfo/w?strType=IPO";
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json", Referer: "https://www.bseindia.com/" },
  });
  if (!res.ok) throw new Error(`BSE ${res.status}`);
  const json = (await res.json()) as { Table?: Record<string, unknown>[] };
  const rows = json?.Table ?? [];
  return rows.slice(0, 30).map((row) => ({
    name: String(row.CompanyName ?? row.companyName ?? "—"),
    symbol: String(row.Symbol ?? row.symbol ?? ""),
    market: "INDIA" as const,
    status: mapNseStatus(String(row.IssueStatus ?? row.Status ?? "")),
    openDate: String(row.OpenDate ?? row.IssueOpenDate ?? "") || undefined,
    closeDate: String(row.CloseDate ?? row.IssueCloseDate ?? "") || undefined,
    listingDate: String(row.ListingDate ?? "") || undefined,
    priceBand: String(row.PriceBand ?? row.IssuePrice ?? "—"),
    issueSize: String(row.IssueSize ?? "—"),
    subscription: row.Subscription != null ? String(row.Subscription) : undefined,
    exchange: "BSE",
    source: "bse" as const,
  }));
}

async function fetchChittorgarhIpos(): Promise<IpoItem[]> {
  const url = "https://www.chittorgarh.com/ipo/mainboard_ipos.asp";
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) return [];
  
  const html = await res.text();
  const items: IpoItem[] = [];
  
  const tableMatch = html.match(/<table[^>]*class="[^"]*ipo[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return items;
  
  const rowMatches = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!rowMatches) return items;
  
  for (const row of rowMatches.slice(1, 20)) {
    const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cellMatches || cellMatches.length < 6) continue;
    
    const name = cellMatches[0]?.replace(/<[^>]*>/g, "").trim() || "";
    const priceBand = cellMatches[1]?.replace(/<[^>]*>/g, "").trim() || "";
    const openDate = cellMatches[2]?.replace(/<[^>]*>/g, "").trim() || "";
    const closeDate = cellMatches[3]?.replace(/<[^>]*>/g, "").trim() || "";
    const status = cellMatches[4]?.replace(/<[^>]*>/g, "").trim().toLowerCase() || "";
    
    if (!name || name === "Company Name") continue;
    
    items.push({
      name,
      market: "INDIA",
      status: status.includes("open") ? "open" : status.includes("list") ? "listed" : status.includes("close") ? "closed" : "upcoming",
      openDate: openDate || undefined,
      closeDate: closeDate || undefined,
      priceBand: priceBand || "—",
      exchange: "NSE",
      source: "exchange",
    });
  }
  
  return items;
}

async function fetchInvestorGainIpos(): Promise<IpoItem[]> {
  const url = "https://www.investorgain.com/ipo-calendar/";
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) return [];
  
  const html = await res.text();
  const items: IpoItem[] = [];
  
  const cardMatches = html.match(/<div[^>]*class="[^"]*ipo-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
  if (!cardMatches) return items;
  
  for (const card of cardMatches.slice(0, 15)) {
    const nameMatch = card.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    const priceMatch = card.match(/price[^:]*:\s*([^<]+)/i);
    const dateMatch = card.match(/(?:open|close)[^:]*:\s*([^<]+)/i);
    const statusMatch = card.match(/status[^:]*:\s*([^<]+)/i);
    
    const name = nameMatch?.[1]?.trim() || "";
    const priceBand = priceMatch?.[1]?.trim() || "";
    const date = dateMatch?.[1]?.trim() || "";
    const status = statusMatch?.[1]?.trim().toLowerCase() || "";
    
    if (!name) continue;
    
    items.push({
      name,
      market: "INDIA",
      status: status.includes("open") ? "open" : status.includes("list") ? "listed" : status.includes("close") ? "closed" : "upcoming",
      openDate: date || undefined,
      priceBand: priceBand || "—",
      exchange: "NSE",
      source: "exchange",
    });
  }
  
  return items;
}

async function fetchGmpData(): Promise<Record<string, number>> {
  const url = "https://www.chittorgarh.com/ipo/gmp.asp";
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) return {};
  
  const html = await res.text();
  const gmpMap: Record<string, number> = {};
  
  const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!rowMatches) return gmpMap;
  
  for (const row of rowMatches.slice(1, 30)) {
    const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cellMatches || cellMatches.length < 3) continue;
    
    const name = cellMatches[0]?.replace(/<[^>]*>/g, "").trim() || "";
    const gmpText = cellMatches[1]?.replace(/<[^>]*>/g, "").trim() || "";
    const gmp = parseFloat(gmpText.replace(/[^\d.-]/g, ""));
    
    if (name && !isNaN(gmp)) {
      gmpMap[name.toLowerCase()] = gmp;
    }
  }
  
  return gmpMap;
}

export const getIpoCalendar = createServerFn({ method: "POST" })
  .inputValidator(z.object({ market: z.enum(["INDIA", "GLOBAL", "ALL"]).default("INDIA") }).parse)
  .handler(async (): Promise<IpoItem[]> => {
    const results: IpoItem[] = [];
    const endpoints = [
      "/api/ipo-current-issue",
      "/api/all-upcoming-issues?issuerType=Forthcoming",
      "/api/all-upcoming-issues?issuerType=Open",
    ];

    for (const ep of endpoints) {
      try {
        const data = await nseFetch(ep);
        results.push(...parseNseIpos(data));
      } catch (err) {
        console.error(`NSE IPO ${ep}:`, err);
      }
    }

    try {
      results.push(...(await fetchBseIpos()));
    } catch (err) {
      console.error("BSE IPO:", err);
    }

    try {
      results.push(...(await fetchChittorgarhIpos()));
    } catch (err) {
      console.error("Chittorgarh IPO:", err);
    }

    try {
      results.push(...(await fetchInvestorGainIpos()));
    } catch (err) {
      console.error("InvestorGain IPO:", err);
    }

    try {
      const gmpData = await fetchGmpData();
      for (const item of results) {
        const gmp = gmpData[item.name.toLowerCase()];
        if (gmp !== undefined) {
          item.gmp = gmp;
        }
      }
    } catch (err) {
      console.error("GMP data:", err);
    }

    const seen = new Set<string>();
    return results.filter((item) => {
      const key = `${item.name}-${item.openDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return item.name && item.name !== "—";
    });
  });
