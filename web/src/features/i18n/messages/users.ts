import { type Messages } from "../messages";

export const usersMessages = {
  en: {
    userId: "User ID",
    environment: "Environment",
    firstEvent: "First Event",
    lastEvent: "Last Event",
    traceCount: "Trace Count",
    totalEvents: "Total Events",
    totalTokens: "Total Tokens",
    totalCost: "Total Cost",
  },
  "zh-CN": {
    userId: "用户 ID",
    environment: "环境",
    firstEvent: "首个事件",
    lastEvent: "最近事件",
    traceCount: "追踪数",
    totalEvents: "总事件数",
    totalTokens: "总 Token 数",
    totalCost: "总费用",
  },
} satisfies Messages;
