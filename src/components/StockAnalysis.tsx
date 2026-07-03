import { Gauge, Signal, TrendingUp } from "lucide-react";
import { buildStockSignals, formatPrice, getSparklinePath, type Quote } from "../lib/market";

interface StockAnalysisProps {
  quotes: Quote[];
}

export function StockAnalysis({ quotes }: StockAnalysisProps) {
  return (
    <section className="panel" aria-labelledby="analysis-title">
      <div className="panel-title">
        <Gauge size={18} />
        <h2 id="analysis-title">个股分析</h2>
      </div>
      <div className="analysis-table">
        {quotes.map((quote) => (
          <article className="analysis-row" key={quote.symbol}>
            <div className="analysis-row__identity">
              <span>{quote.symbol}</span>
              <strong>{quote.name}</strong>
            </div>
            <svg className="mini-chart" viewBox="0 0 150 46" aria-hidden="true">
              <polyline points={getSparklinePath(quote.points, 150, 46)} />
            </svg>
            <div className="analysis-row__price">
              <span>{formatPrice(quote.price, quote.currency)}</span>
              <small>Prev {formatPrice(quote.previousClose, quote.currency)}</small>
            </div>
            <div className="signal-grid">
              {buildStockSignals(quote).map((signal) => (
                <span className={`signal signal--${signal.tone}`} key={signal.label}>
                  <Signal size={12} />
                  {signal.label}: {signal.value}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="disclaimer">
        <TrendingUp size={15} />
        个股信号基于公开行情做机械化摘要，不构成投资建议。
      </div>
    </section>
  );
}
