export type Trend = "up" | "down" | "flat";

export interface PricePoint {
  time: string;
  value: number;
}

export interface Quote {
  symbol: string;
  name: string;
  assetType: "equity" | "etf" | "crypto";
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  trend: Trend;
  points: PricePoint[];
  sourceUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  symbols: string[];
}

export interface MarketData {
  generatedAt: string;
  provider: string;
  providerNote: string;
  quotes: Quote[];
  news: NewsItem[];
}

export interface StockSignal {
  label: string;
  value: string;
  tone: "good" | "warn" | "risk" | "neutral";
}

export function formatPrice(value: number, currency: string): string {
  const currencyPrefix = currency === "USD" ? "$" : `${currency} `;
  return `${currencyPrefix}${value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 100 ? 2 : 4,
  })}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function getFreshnessLabel(generatedAt: string, now = new Date()): string {
  const timestamp = new Date(generatedAt).getTime();
  if (Number.isNaN(timestamp)) return "更新时间未知";
  const minutes = Math.max(0, Math.round((now.getTime() - timestamp) / 60_000));
  if (minutes < 1) return "刚刚更新";
  if (minutes < 60) return `${minutes} 分钟前更新`;
  const hours = Math.round(minutes / 60);
  return `${hours} 小时前更新`;
}

export function buildStockSignals(quote: Quote): StockSignal[] {
  const range = quote.high - quote.low;
  const rangePercent = quote.price > 0 ? (range / quote.price) * 100 : 0;
  const momentumTone = quote.changePercent > 1 ? "good" : quote.changePercent < -1 ? "risk" : "neutral";
  const volatilityTone = rangePercent > 5 ? "warn" : "neutral";
  const volumeTone = quote.volume > 50_000_000 ? "good" : "neutral";

  return [
    {
      label: "日内动量",
      value: formatPercent(quote.changePercent),
      tone: momentumTone,
    },
    {
      label: "日内波动",
      value: formatPercent(rangePercent),
      tone: volatilityTone,
    },
    {
      label: "成交量",
      value: formatVolume(quote.volume),
      tone: volumeTone,
    },
  ];
}

export function getSparklinePath(points: PricePoint[], width: number, height: number): string {
  if (points.length === 0) return "";
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((point.value - min) / span) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
