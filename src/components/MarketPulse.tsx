import { Activity, ArrowDownRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { formatPercent, formatPrice, getSparklinePath, type Quote } from "../lib/market";

interface MarketPulseProps {
  quotes: Quote[];
}

export function MarketPulse({ quotes }: MarketPulseProps) {
  const leaders = [...quotes].sort((left, right) => right.changePercent - left.changePercent).slice(0, 4);

  return (
    <section className="section-grid market-grid" aria-labelledby="market-pulse-title">
      <div className="section-heading">
        <p>Market Pulse</p>
        <h2 id="market-pulse-title">投资快讯</h2>
      </div>
      {leaders.map((quote) => {
        const isUp = quote.changePercent >= 0;
        const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
        return (
          <article className="quote-card" key={quote.symbol}>
            <div className="quote-card__top">
              <span className="quote-card__symbol">{quote.symbol}</span>
              <span className={`pill ${isUp ? "pill--good" : "pill--risk"}`}>
                <TrendIcon size={15} />
                {formatPercent(quote.changePercent)}
              </span>
            </div>
            <h3>{quote.name}</h3>
            <div className="quote-card__price">{formatPrice(quote.price, quote.currency)}</div>
            <svg className="sparkline" viewBox="0 0 180 54" role="img" aria-label={`${quote.symbol} 近期走势`}>
              <polyline
                points={getSparklinePath(quote.points, 180, 54)}
                className={isUp ? "sparkline__path sparkline__path--up" : "sparkline__path sparkline__path--down"}
              />
            </svg>
            <a className="source-link" href={quote.sourceUrl} target="_blank" rel="noreferrer">
              <Activity size={14} />
              Yahoo Finance
              <ExternalLink size={13} />
            </a>
          </article>
        );
      })}
    </section>
  );
}
