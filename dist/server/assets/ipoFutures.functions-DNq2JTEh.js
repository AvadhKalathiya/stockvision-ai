import { c as createServerRpc } from "./createServerRpc-Cl0K4URf.js";
import { k as createServerFn } from "./server-Cgfy5VtR.js";
import { o as objectType, e as enumType } from "./types-BfPr8xct.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const YF_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FUTURES_UNIVERSE = [{
  symbol: "ES=F",
  name: "S&P 500 E-mini",
  category: "INDEX"
}, {
  symbol: "NQ=F",
  name: "Nasdaq 100 E-mini",
  category: "INDEX"
}, {
  symbol: "YM=F",
  name: "Dow E-mini",
  category: "INDEX"
}, {
  symbol: "GC=F",
  name: "Gold",
  category: "COMMODITY"
}, {
  symbol: "CL=F",
  name: "Crude Oil WTI",
  category: "COMMODITY"
}, {
  symbol: "BTC=F",
  name: "Bitcoin Futures",
  category: "CRYPTO"
}];
const getFutures_createServerFn_handler = createServerRpc({
  id: "057c9573c99fde8fb33a73a1d091ca0ac409d98441795bd82a2999bed9df8880",
  name: "getFutures",
  filename: "src/lib/ipoFutures.functions.ts"
}, (opts) => getFutures.__executeServer(opts));
const getFutures = createServerFn({
  method: "GET"
}).handler(getFutures_createServerFn_handler, async () => {
  return Promise.all(FUTURES_UNIVERSE.map(async (f) => {
    try {
      const res = await fetch(`${YF_BASE}/${encodeURIComponent(f.symbol)}?interval=1d&range=5d`, {
        headers: {
          "User-Agent": UA,
          Accept: "application/json"
        }
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta ?? {};
      const last = Number(meta.regularMarketPrice ?? 0);
      const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? last);
      return {
        symbol: f.symbol,
        name: f.name,
        last,
        changePct: prev ? (last - prev) / prev * 100 : 0,
        currency: "USD",
        category: f.category
      };
    } catch {
      return {
        symbol: f.symbol,
        name: f.name,
        last: 0,
        changePct: 0,
        currency: "USD",
        category: f.category
      };
    }
  }));
});
async function nseFetch(path) {
  const base = "https://www.nseindia.com";
  const init = await fetch(base, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  const cookie = init.headers.get("set-cookie") ?? "";
  const res = await fetch(`${base}${path}`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Referer: `${base}/market-data/all-upcoming-issues-ipo`,
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: cookie
    }
  });
  if (!res.ok) throw new Error(`NSE ${res.status}`);
  return res.json();
}
function mapNseStatus(s) {
  const u = (s ?? "").toLowerCase();
  if (u.includes("open") || u.includes("current")) return "open";
  if (u.includes("list") || u.includes("listed")) return "listed";
  if (u.includes("close") || u.includes("past")) return "closed";
  return "upcoming";
}
function parseNseIpos(data) {
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  return rows.slice(0, 40).map((row) => {
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
      market: "INDIA",
      status: mapNseStatus(String(row.issueStatus ?? row.status ?? row.issuerType ?? "")),
      openDate: openDate || void 0,
      closeDate: closeDate || void 0,
      listingDate: listingDate || void 0,
      priceBand,
      issueSize,
      subscription: sub != null ? String(sub) : void 0,
      exchange: "NSE",
      source: "nse"
    };
  });
}
async function fetchBseIpos() {
  const url = "https://api.bseindia.com/BseIndiaAPI/api/IPOIssueInfo/w?strType=IPO";
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      Referer: "https://www.bseindia.com/"
    }
  });
  if (!res.ok) throw new Error(`BSE ${res.status}`);
  const json = await res.json();
  const rows = json?.Table ?? [];
  return rows.slice(0, 30).map((row) => ({
    name: String(row.CompanyName ?? row.companyName ?? "—"),
    symbol: String(row.Symbol ?? row.symbol ?? ""),
    market: "INDIA",
    status: mapNseStatus(String(row.IssueStatus ?? row.Status ?? "")),
    openDate: String(row.OpenDate ?? row.IssueOpenDate ?? "") || void 0,
    closeDate: String(row.CloseDate ?? row.IssueCloseDate ?? "") || void 0,
    listingDate: String(row.ListingDate ?? "") || void 0,
    priceBand: String(row.PriceBand ?? row.IssuePrice ?? "—"),
    issueSize: String(row.IssueSize ?? "—"),
    subscription: row.Subscription != null ? String(row.Subscription) : void 0,
    exchange: "BSE",
    source: "bse"
  }));
}
const getIpoCalendar_createServerFn_handler = createServerRpc({
  id: "bd2d647d4c7f0af003a117ce3170f4f4dc3fdfb26bfb796aaf827280c7bddc5b",
  name: "getIpoCalendar",
  filename: "src/lib/ipoFutures.functions.ts"
}, (opts) => getIpoCalendar.__executeServer(opts));
const getIpoCalendar = createServerFn({
  method: "POST"
}).inputValidator(objectType({
  market: enumType(["INDIA", "GLOBAL", "ALL"]).default("INDIA")
}).parse).handler(getIpoCalendar_createServerFn_handler, async () => {
  const results = [];
  const endpoints = ["/api/ipo-current-issue", "/api/all-upcoming-issues?issuerType=Forthcoming", "/api/all-upcoming-issues?issuerType=Open"];
  for (const ep of endpoints) {
    try {
      const data = await nseFetch(ep);
      results.push(...parseNseIpos(data));
    } catch (err) {
      console.error(`NSE IPO ${ep}:`, err);
    }
  }
  try {
    results.push(...await fetchBseIpos());
  } catch (err) {
    console.error("BSE IPO:", err);
  }
  const seen = /* @__PURE__ */ new Set();
  return results.filter((item) => {
    const key = `${item.name}-${item.openDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return item.name && item.name !== "—";
  });
});
export {
  getFutures_createServerFn_handler,
  getIpoCalendar_createServerFn_handler
};
