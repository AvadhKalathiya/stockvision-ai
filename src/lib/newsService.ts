export interface NewsItem {
  headline: string;
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  ticker: string;
  source: string;
  publishedAt: string;
  url: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: { name: string };
  }>;
}

interface GNewsResponse {
  totalArticles: number;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: { name: string };
  }>;
}

interface FinnhubNewsItem {
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
  related: string[];
}

function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const lower = text.toLowerCase();
  const bullish = ["gain", "rise", "surge", "growth", "profit", "up", "positive", "rally", "bull", "strong", "increase"];
  const bearish = ["loss", "fall", "drop", "decline", "down", "negative", "crash", "bear", "weak", "decrease"];
  
  const bullishCount = bullish.filter(word => lower.includes(word)).length;
  const bearishCount = bearish.filter(word => lower.includes(word)).length;
  
  if (bullishCount > bearishCount) return "bullish";
  if (bearishCount > bullishCount) return "bearish";
  return "neutral";
}

function extractTicker(text: string): string {
  const indianTickers = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", "SBIN",
    "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN",
    "SUNPHARMA", "BAJFINANCE", "WIPRO", "HCLTECH", "ULTRACEMCO", "NTPC", "POWERGRID",
    "NIFTY", "SENSEX", "BANKNIFTY"
  ];
  
  const upper = text.toUpperCase();
  for (const ticker of indianTickers) {
    if (upper.includes(ticker)) {
      return ticker.includes("NIFTY") || ticker === "SENSEX" ? ticker : `${ticker}.NS`;
    }
  }
  return "MARKET";
}

async function fetchNewsAPI(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + " India stock market")}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const data = await res.json() as NewsAPIResponse;
    return data.articles.map(article => ({
      headline: article.title,
      summary: article.description || "",
      sentiment: analyzeSentiment(article.title + " " + article.description),
      ticker: extractTicker(article.title),
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url
    }));
  } catch {
    return [];
  }
}

async function fetchGNews(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];
  
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query + " India stock market")}&lang=en&country=in&max=20&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const data = await res.json() as GNewsResponse;
    return data.articles.map(article => ({
      headline: article.title,
      summary: article.description || "",
      sentiment: analyzeSentiment(article.title + " " + article.description),
      ticker: extractTicker(article.title),
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url
    }));
  } catch {
    return [];
  }
}

async function fetchFinnhub(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];
  
  try {
    const category = query.toLowerCase().includes("ipo") ? "ipo" : "general";
    const url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const data = await res.json() as FinnhubNewsItem[];
    return data
      .filter(item => {
        const text = (item.headline + " " + item.summary).toLowerCase();
        return text.includes("india") || text.includes("nse") || text.includes("bse") || 
               item.related.some(t => t.endsWith(".NS") || t.endsWith(".BO"));
      })
      .slice(0, 20)
      .map(item => ({
        headline: item.headline,
        summary: item.summary,
        sentiment: analyzeSentiment(item.headline + " " + item.summary),
        ticker: item.related.find(t => t.endsWith(".NS") || t.endsWith(".BO")) || extractTicker(item.headline),
        source: item.source,
        publishedAt: new Date(item.datetime * 1000).toISOString(),
        url: item.url
      }));
  } catch {
    return [];
  }
}

export async function fetchMarketNews(query: string): Promise<NewsItem[]> {
  const results: NewsItem[] = [];
  
  const newsAPI = await fetchNewsAPI(query);
  results.push(...newsAPI);
  
  if (results.length < 10) {
    const gnews = await fetchGNews(query);
    results.push(...gnews);
  }
  
  if (results.length < 10) {
    const finnhub = await fetchFinnhub(query);
    results.push(...finnhub);
  }
  
  const unique = new Map();
  for (const item of results) {
    const key = item.url;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }
  
  return Array.from(unique.values()).slice(0, 20);
}
