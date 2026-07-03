import { ExternalLink, Newspaper } from "lucide-react";
import type { NewsItem } from "../lib/market";

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  return (
    <section className="panel news-panel" aria-labelledby="news-title">
      <div className="panel-title">
        <Newspaper size={18} />
        <h2 id="news-title">实时成长快讯</h2>
      </div>
      <div className="news-list">
        {news.slice(0, 8).map((item) => (
          <a className="news-item" href={item.url} key={item.id} target="_blank" rel="noreferrer">
            <span className="news-item__meta">
              {item.source} · {new Date(item.publishedAt).toLocaleString("zh-CN", { hour12: false })}
            </span>
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
            <span className="news-item__symbols">
              {item.symbols.map((symbol) => (
                <b key={symbol}>{symbol}</b>
              ))}
              <ExternalLink size={13} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
