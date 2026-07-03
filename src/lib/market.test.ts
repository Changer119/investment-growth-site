import { describe, expect, it } from "vitest";
import { buildStockSignals, formatPercent, getFreshnessLabel, getSparklinePath, type Quote } from "./market";

const quote: Quote = {
  symbol: "NVDA",
  name: "NVIDIA",
  assetType: "equity",
  currency: "USD",
  price: 130,
  previousClose: 125,
  change: 5,
  changePercent: 4,
  high: 132,
  low: 123,
  volume: 72_000_000,
  trend: "up",
  points: [
    { time: "2026-07-03T01:00:00.000Z", value: 125 },
    { time: "2026-07-03T02:00:00.000Z", value: 128 },
    { time: "2026-07-03T03:00:00.000Z", value: 130 },
  ],
  sourceUrl: "https://finance.yahoo.com/quote/NVDA",
};

describe("market helpers", () => {
  it("formats signed percentages", () => {
    expect(formatPercent(2.345)).toBe("+2.35%");
    expect(formatPercent(-1.2)).toBe("-1.20%");
  });

  it("builds compact stock signals", () => {
    const signals = buildStockSignals(quote);
    expect(signals).toHaveLength(3);
    expect(signals[0].tone).toBe("good");
  });

  it("creates sparkline coordinate pairs", () => {
    const path = getSparklinePath(quote.points, 120, 40);
    expect(path.split(" ")).toHaveLength(3);
    expect(path).toContain(",");
  });

  it("labels fresh data in Chinese", () => {
    const now = new Date("2026-07-03T03:30:00.000Z");
    expect(getFreshnessLabel("2026-07-03T03:00:00.000Z", now)).toBe("30 分钟前更新");
  });
});
