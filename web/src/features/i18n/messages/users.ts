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
    // Users table column tooltips
    userIdTooltip:
      "The unique identifier for the user that was logged in Langfuse. See docs for more details on how to set this up.",
    firstEventTooltip: "The earliest trace recorded for this user.",
    lastEventTooltip: "The latest trace recorded for this user.",
    totalEventsTooltip:
      "Total number of events for the user, includes traces and observations. See data model for more details.",
    totalTokensTooltip:
      "Total number of tokens used for the user across all generations.",
    totalCostTooltip: "Total cost for the user across all generations.",
    noEventYet: "No event yet",
    // Users page help (UsersPage)
    usersPageHelp:
      "Attribute data in Langfuse to a user by adding a userId to your traces.",
    docsLink: "docs",
    learnMore: "to learn more.",
    // User detail page
    usersBreadcrumb: "Users",
    dashboard: "Dashboard",
    observationsCount: "Observations: {count}",
    tracesCount: "Traces: {count}",
    totalTokensBadge: "Total Tokens: {count}",
    totalCostBadge: "Total Cost: {cost}",
    activeRange: "Active: {range}",
    noActivityYet: "No activity yet",
    noTracesYet: "No traces yet",
    selectTab: "Select a tab",
    tabsLabel: "Tabs",
    // User detail tabs
    tabTraces: "Traces",
    tabSessions: "Sessions",
    tabScores: "Scores",
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
    // Users table column tooltips
    userIdTooltip:
      "在 Langfuse 中记录的用户唯一标识。有关如何设置的更多细节，请参阅文档。",
    firstEventTooltip: "为该用户记录的最早追踪。",
    lastEventTooltip: "为该用户记录的最新追踪。",
    totalEventsTooltip:
      "用户的事件总数，包括追踪和观察。有关数据模型的更多细节，请参阅文档。",
    totalTokensTooltip: "用户在所有生成中使用的 Token 总数。",
    totalCostTooltip: "用户在所有生成中的总费用。",
    noEventYet: "暂无事件",
    // Users page help (UsersPage)
    usersPageHelp: "通过在追踪中添加 userId，将数据归属于某个用户。",
    docsLink: "文档",
    learnMore: "以了解更多。",
    // User detail page
    usersBreadcrumb: "用户",
    dashboard: "仪表板",
    observationsCount: "观察数：{count}",
    tracesCount: "追踪数：{count}",
    totalTokensBadge: "总 Token 数：{count}",
    totalCostBadge: "总费用：{cost}",
    activeRange: "活跃：{range}",
    noActivityYet: "暂无活动",
    noTracesYet: "暂无追踪",
    selectTab: "选择标签页",
    tabsLabel: "标签页",
    // User detail tabs
    tabTraces: "追踪",
    tabSessions: "会话",
    tabScores: "评分",
  },
} satisfies Messages;
