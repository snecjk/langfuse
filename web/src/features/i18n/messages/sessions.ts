import { type Messages } from "../messages";

export const sessionsMessages = {
  en: {
    id: "ID",
    createdAt: "Created At",
    duration: "Duration",
    environment: "Environment",
    scores: "Scores",
    userIds: "User IDs",
    traces: "Traces",
    inputCost: "Input Cost",
    outputCost: "Output Cost",
    totalCost: "Total Cost",
    inputTokens: "Input Tokens",
    outputTokens: "Output Tokens",
    totalTokens: "Total Tokens",
    usage: "Usage",
    traceTags: "Trace Tags",
    // Page shell (SessionsPage)
    sessionsPageHelp:
      "A session is a collection of related traces, such as a conversation or thread. To begin, add a sessionId to the trace.",
    sessionsPageHelpLink: "docs",
    sessionsPageHelpSuffix: "to learn more.",
    // Sessions table
    helpDescription:
      "A session is a collection of related traces, such as a conversation or thread. To begin, add a sessionId to the trace.",
    traceCountTooltip: "The number of traces in the session.",
    addToAnnotationQueue: "Add to Annotation Queue",
    addToAnnotationQueueDescription:
      "Add selected sessions to an annotation queue.",
    annotationQueue: "Annotation Queue",
    sessionsAddedToQueueTitle: "Sessions added to queue",
    sessionsAddedToQueueDescription:
      'Selected sessions will be added to queue "{queueName}". This may take a minute.',
    viewQueue: 'View queue "{queueName}"',
    // Session detail (legacy + events pages)
    unauthorizedSession: "You do not have access to this session.",
    sessionNotFoundTitle: "Session not found",
    sessionNotFoundMessage:
      "The session is either still being processed or has been deleted.",
    retry: "Retry",
    failedToLoadSessionTitle: "Failed to load session",
    failedToLoadSessionMessage:
      "The session could not be loaded. Please try again.",
    sessionsBreadcrumb: "Sessions",
    sessionActions: "Session actions",
    downloadJson: "Download JSON",
    showCorrections: "Show corrections",
    sessionControls: "Session controls",
    tracesCount: "{count} traces",
    filterObservations: "Filter observations",
    editFilters: "Edit filters",
    clearFilters: "Clear filters",
    showToolCalls: "Show tool calls",
    showSystemPrompt: "Show system prompt",
    copySessionId: "Copy session ID",
    // Session header menu / misc
    positionInTrace: "Position in Trace",
    sessionMessagesAndTools: "Session messages and tools",
  },
  "zh-CN": {
    id: "ID",
    createdAt: "创建时间",
    duration: "持续时间",
    environment: "环境",
    scores: "评分",
    userIds: "用户 ID",
    traces: "追踪数",
    inputCost: "输入费用",
    outputCost: "输出费用",
    totalCost: "总费用",
    inputTokens: "输入 Token 数",
    outputTokens: "输出 Token 数",
    totalTokens: "总 Token 数",
    usage: "用量",
    traceTags: "追踪标签",
    // Page shell (SessionsPage)
    sessionsPageHelp:
      "会话是一组相关追踪的集合，例如一段对话或主题讨论。要开始使用，请在追踪中添加 sessionId。",
    sessionsPageHelpLink: "文档",
    sessionsPageHelpSuffix: "以了解更多。",
    // Sessions table
    helpDescription:
      "会话是一组相关追踪的集合，例如一段对话或主题讨论。要开始使用，请在追踪中添加 sessionId。",
    traceCountTooltip: "会话中的追踪数量。",
    addToAnnotationQueue: "添加到标注队列",
    addToAnnotationQueueDescription: "将所选会话添加到标注队列。",
    annotationQueue: "标注队列",
    sessionsAddedToQueueTitle: "会话已添加到队列",
    sessionsAddedToQueueDescription:
      "所选会话将被添加到队列“{queueName}”。这可能需要一分钟。",
    viewQueue: "查看队列“{queueName}”",
    // Session detail (legacy + events pages)
    unauthorizedSession: "你没有访问此会话的权限。",
    sessionNotFoundTitle: "未找到会话",
    sessionNotFoundMessage: "该会话可能仍在处理中，或已被删除。",
    retry: "重试",
    failedToLoadSessionTitle: "加载会话失败",
    failedToLoadSessionMessage: "无法加载该会话。请重试。",
    sessionsBreadcrumb: "会话",
    sessionActions: "会话操作",
    downloadJson: "下载 JSON",
    showCorrections: "显示更正",
    sessionControls: "会话控制",
    tracesCount: "{count} 条追踪",
    filterObservations: "筛选观察",
    editFilters: "编辑筛选",
    clearFilters: "清除筛选",
    showToolCalls: "显示工具调用",
    showSystemPrompt: "显示系统提示词",
    copySessionId: "复制会话 ID",
    // Session header menu / misc
    positionInTrace: "追踪中的位置",
    sessionMessagesAndTools: "会话消息与工具",
  },
} satisfies Messages;
