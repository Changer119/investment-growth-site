import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import type { MarketData, NewsItem, PricePoint, Quote, Trend } from "../src/lib/market";

interface WatchSymbol {
  symbol: string;
  name: string;
  assetType: Quote["assetType"];
}

interface YahooChartResult {
  timestamp?: number[];
  meta?: {
    currency?: string;
    regularMarketPrice?: number;
    previousClose?: number;
    chartPreviousClose?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
  };
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      volume?: Array<number | null>;
    }>;
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
    error?: { description?: string } | null;
  };
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
}

interface RssDocument {
  rss?: {
    channel?: {
      item?: RssItem | RssItem[];
    };
  };
}

const symbols: WatchSymbol[] = [
  { symbol: "NVDA", name: "NVIDIA", assetType: "equity" },
  { symbol: "MSFT", name: "Microsoft", assetType: "equity" },
  { symbol: "AAPL", name: "Apple", assetType: "equity" },
  { symbol: "TSLA", name: "Tesla", assetType: "equity" },
  { symbol: "TSM", name: "Taiwan Semiconductor", assetType: "equity" },
  { symbol: "BABA", name: "Alibaba", assetType: "equity" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", assetType: "etf" },
  { symbol: "BTC-USD", name: "Bitcoin", assetType: "crypto" },
];

const outputPath = resolve("public/data/market.json");
const parser = new XMLParser({ ignoreAttributes: false });

function toFiniteNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function compactPoints(timestamps: number[], closes: Array<number | null>): PricePoint[] {
  return timestamps
    .map((timestamp, index) => ({
      time: new Date(timestamp * 1000).toISOString(),
      value: closes[index],
    }))
    .filter((point): point is PricePoint => typeof point.value === "number" && Number.isFinite(point.value))
    .slice(-16);
}

function stripHtml(value = ""): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function inferTrend(changePercent: number): Trend {
  if (changePercent > 0.2) return "up";
  if (changePercent < -0.2) return "down";
  return "flat";
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "investment-growth-site/0.1 (+https://github.com)",
      Accept: "application/json,text/plain,*/*",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchQuote(item: WatchSymbol): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    item.symbol,
  )}?range=5d&interval=30m`;
  const payload = (await fetchJson(url)) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  if (!result || !quote) throw new Error(`Yahoo chart missing for ${item.symbol}`);

  const timestamps = result.timestamp ?? [];
  const closes = quote.close ?? [];
  const points = compactPoints(timestamps, closes);
  const latest = toFiniteNumber(result.meta?.regularMarketPrice, points.at(-1)?.value ?? 0);
  const previousClose = toFiniteNumber(result.meta?.previousClose, result.meta?.chartPreviousClose ?? latest);
  const change = latest - previousClose;
  const changePercent = previousClose === 0 ? 0 : (change / previousClose) * 100;
  const high = toFiniteNumber(result.meta?.regularMarketDayHigh, Math.max(...points.map((point) => point.value)));
  const low = toFiniteNumber(result.meta?.regularMarketDayLow, Math.min(...points.map((point) => point.value)));
  const volume = toFiniteNumber(result.meta?.regularMarketVolume, toFiniteNumber(quote.volume?.at(-1)));

  return {
    symbol: item.symbol,
    name: item.name,
    assetType: item.assetType,
    currency: result.meta?.currency ?? "USD",
    price: latest,
    previousClose,
    change,
    changePercent,
    high,
    low,
    volume,
    trend: inferTrend(changePercent),
    points,
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(item.symbol)}`,
  };
}

async function fetchNews(): Promise<NewsItem[]> {
  const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbols
    .map((item) => item.symbol)
    .join(",")}&region=US&lang=en-US`;
  const response = await fetch(rssUrl, {
    headers: { "User-Agent": "investment-growth-site/0.1 (+https://github.com)" },
  });
  if (!response.ok) throw new Error(`RSS ${response.status} ${response.statusText}`);
  const xml = await response.text();
  const document = parser.parse(xml) as RssDocument;
  const rawItems = document.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.slice(0, 12).map((item, index) => {
    const title = stripHtml(item.title ?? "Untitled");
    const summary = stripHtml(item.description ?? "").slice(0, 180);
    const matchedSymbols = symbols
      .filter((symbol) => title.includes(symbol.symbol.replace("-USD", "")) || summary.includes(symbol.name))
      .map((symbol) => symbol.symbol);
    return {
      id: `${new Date(item.pubDate ?? Date.now()).getTime()}-${index}`,
      title,
      url: item.link ?? "https://finance.yahoo.com/news/",
      source: "Yahoo Finance",
      publishedAt: new Date(item.pubDate ?? Date.now()).toISOString(),
      summary,
      symbols: matchedSymbols.length > 0 ? matchedSymbols : symbols.slice(0, 3).map((symbol) => symbol.symbol),
    };
  });
}

function readExistingData(): MarketData | null {
  if (!existsSync(outputPath)) return null;
  return JSON.parse(readFileSync(outputPath, "utf8")) as MarketData;
}

async function main(): Promise<void> {
  const existing = readExistingData();
  const settledQuotes = await Promise.allSettled(symbols.map((symbol) => fetchQuote(symbol)));
  const freshQuotes = settledQuotes
    .filter((result): result is PromiseFulfilledResult<Quote> => result.status === "fulfilled")
    .map((result) => result.value);
  const fallbackQuotes = existing?.quotes ?? [];
  const quotes = symbols
    .map((symbol) => freshQuotes.find((quote) => quote.symbol === symbol.symbol) ?? fallbackQuotes.find((quote) => quote.symbol === symbol.symbol))
    .filter((quote): quote is Quote => Boolean(quote));

  let news = existing?.news ?? [];
  try {
    news = await fetchNews();
  } catch (error) {
    console.warn(`news fallback: ${(error as Error).message}`);
  }

  if (quotes.length === 0) throw new Error("没有可用行情数据，且不存在本地回退数据。");

  const data: MarketData = {
    generatedAt: new Date().toISOString(),
    provider: "Yahoo Finance public endpoints",
    providerNote:
      "行情与资讯来自 Yahoo Finance 公开端点，由 GitHub Actions 每 30 分钟刷新；公开端点可能存在延迟，请以交易所与券商终端为准。",
    quotes,
    news,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`market data written: ${quotes.length} quotes, ${news.length} news`);
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
