import { useEffect, useMemo, useState } from "react";
import { BarChart3, DatabaseZap, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";
import { LearningPath } from "./components/LearningPath";
import { MarketPulse } from "./components/MarketPulse";
import { NewsFeed } from "./components/NewsFeed";
import { StockAnalysis } from "./components/StockAnalysis";
import { getFreshnessLabel, type MarketData } from "./lib/market";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: MarketData }
  | { status: "error"; message: string };

function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/market.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`数据请求失败：${response.status}`);
        return response.json() as Promise<MarketData>;
      })
      .then((data) => setState({ status: "ready", data }))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState({ status: "error", message: error.message });
      });
    return () => controller.abort();
  }, []);

  const marketBreadth = useMemo(() => {
    if (state.status !== "ready") return { up: 0, down: 0 };
    return state.data.quotes.reduce(
      (summary, quote) => ({
        up: summary.up + (quote.changePercent >= 0 ? 1 : 0),
        down: summary.down + (quote.changePercent < 0 ? 1 : 0),
      }),
      { up: 0, down: 0 },
    );
  }, [state]);

  if (state.status === "loading") {
    return (
      <main className="app-shell app-shell--center">
        <div className="loading-panel">
          <RefreshCw className="spin" size={28} />
          <span>正在加载近实时市场数据...</span>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="app-shell app-shell--center">
        <div className="loading-panel loading-panel--error">
          <ShieldAlert size={30} />
          <strong>市场数据暂时不可用</strong>
          <span>{state.message}</span>
        </div>
      </main>
    );
  }

  const freshness = getFreshnessLabel(state.data.generatedAt);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">
            <Sparkles size={19} />
          </span>
          <div>
            <strong>投资成长雷达</strong>
            <small>Investment Growth Radar</small>
          </div>
        </div>
        <div className="status-strip" aria-label="数据状态">
          <span>
            <DatabaseZap size={15} />
            {freshness}
          </span>
          <span>
            <BarChart3 size={15} />
            上涨 {marketBreadth.up} / 下跌 {marketBreadth.down}
          </span>
        </div>
      </header>

      <section className="hero-dashboard" aria-label="市场总览">
        <div className="hero-dashboard__copy">
          <p className="eyebrow">实时数据 · 成长框架 · 风险提示</p>
          <h1>把快讯、课堂和个股信号放在同一个投资操作台。</h1>
          <p>
            数据由 GitHub Actions 定时刷新，当前来源为 Yahoo Finance 公开行情与资讯 RSS。
            页面会保留更新时间和来源链接，方便继续核验。
          </p>
        </div>
        <div className="hero-dashboard__matrix" aria-hidden="true">
          {state.data.quotes.slice(0, 12).map((quote) => (
            <span className={quote.changePercent >= 0 ? "matrix-cell matrix-cell--up" : "matrix-cell matrix-cell--down"} key={quote.symbol}>
              {quote.symbol}
            </span>
          ))}
        </div>
      </section>

      <MarketPulse quotes={state.data.quotes} />

      <div className="content-grid">
        <NewsFeed news={state.data.news} />
        <LearningPath />
      </div>

      <StockAnalysis quotes={state.data.quotes} />

      <footer className="footer-note">
        {state.data.providerNote} 数据生成时间：
        {new Date(state.data.generatedAt).toLocaleString("zh-CN", { hour12: false })}。
      </footer>
    </main>
  );
}

export default App;
