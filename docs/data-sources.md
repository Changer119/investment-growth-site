# 数据源说明

本网站采用静态站点部署，市场数据由 GitHub Actions 在构建时生成，站点运行时读取 `public/data/market.json`。

## 当前来源

- 行情：Yahoo Finance 公开 chart endpoint。
- 资讯：Yahoo Finance RSS。
- 刷新频率：GitHub Actions 每 30 分钟触发一次构建。

## 准确性边界

Yahoo Finance 公开数据可能存在延迟、字段缺失或临时限流。页面展示的价格、涨跌幅和资讯用于研究看板，不构成投资建议；关键交易决策仍应以交易所、券商终端或付费数据源为准。

## 后续可升级方向

- 接入 Polygon、Finnhub、Tiingo 等需要 API Key 的正式行情源。
- 增加港股、A 股和基金数据源。
- 将新闻按公司、产业链和财报事件做实体抽取。
