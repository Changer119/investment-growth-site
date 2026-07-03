import { BookOpen, Brain, LineChart, ShieldCheck, type LucideIcon } from "lucide-react";

export interface Lesson {
  title: string;
  level: "入门" | "进阶" | "实战";
  duration: string;
  icon: LucideIcon;
  summary: string;
  checkpoints: string[];
}

export const lessons: Lesson[] = [
  {
    title: "从财报到自由现金流",
    level: "入门",
    duration: "28 min",
    icon: BookOpen,
    summary: "用资产负债表、利润表和现金流量表搭一个最小可用的企业质量框架。",
    checkpoints: ["收入质量", "经营现金流", "资本开支"],
  },
  {
    title: "成长股估值的三层模型",
    level: "进阶",
    duration: "36 min",
    icon: LineChart,
    summary: "把 TAM、渗透率、利润率和折现率拆成可跟踪假设，避免只看叙事。",
    checkpoints: ["市场空间", "增长耐久性", "安全边际"],
  },
  {
    title: "组合风控与回撤复盘",
    level: "实战",
    duration: "31 min",
    icon: ShieldCheck,
    summary: "围绕仓位、相关性和触发条件建立可执行的复盘清单。",
    checkpoints: ["单票上限", "相关性", "卖出规则"],
  },
  {
    title: "AI 时代的产业链研究",
    level: "进阶",
    duration: "42 min",
    icon: Brain,
    summary: "从算力、数据、软件分发和商业模式四个层次识别增长迁移。",
    checkpoints: ["瓶颈环节", "议价权", "资本效率"],
  },
];
