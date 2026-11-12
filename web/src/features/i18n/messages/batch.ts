import { type Messages } from "../messages";

export const batchMessages = {
  en: {
    // Export button
    export: "Export",
    exportQueued: "Export queued",
    exportQueuedDescription:
      "You will receive an email when the export is ready.",
    viewExports: "View exports",
    exportAs: "Export as {format}",
    traceExportWarning:
      "Note: Filters on observation-level columns (Level, Tokens, Cost, Latency) and Comments are not included in trace exports. You may receive more data than expected.",
    observationExportWarning:
      "Note: Filters on trace-level columns (Trace Name, Trace Tags, User ID, Trace Environment) and Comments are not included in observation exports. You may receive more data than expected.",
    eventExportWarning:
      "Note: Filters on Comments are not included in event exports. You may receive more data than expected.",
    sessionExportWarning:
      "Note: Filters on Comments are not included in session exports. You may receive more data than expected.",
    auditLogExportWarning:
      "Note: Filters are not applied to audit log exports. All audit logs for this project will be exported.",

    // Exports settings page
    exportsPageTitle: "Exports",
    exportsPageDescription:
      "Export large datasets in your preferred format via the export buttons across Langfuse. Exports are processed asynchronously and remain available for download until the expiry shown for each export below. You will receive an email notification once your export is ready.",
    exportsAccessDenied: "Access Denied",
    exportsNoPermission: "You do not have permission to view batch exports.",

    // Batch actions settings page
    batchActionsPageTitle: "Batch actions",
    batchActionsPageDescription:
      "Track the status of bulk operations performed on tables, such as adding observations to datasets, deleting traces, and adding items to annotation queues. Actions are processed asynchronously in the background.",
    batchActionsAccessDenied: "Access Denied",
    batchActionsNoPermission:
      "You do not have permission to view batch actions.",

    // Batch actions table
    actionType: "Action type",
    table: "Table",
    status: "Status",
    progress: "Progress",
    created: "Created",
    finished: "Finished",
    createdBy: "Created by",
    unknown: "Unknown",
    log: "Log",
    failedCount: "{count} failed",

    // Batch exports table
    name: "Name",
    nameTooltip:
      "Created: {createdAt}\nFinished: {finishedAt}\nDownload expires: {expiresAt}",
    exportError: "Export error",
    action: "Action",
    download: "Download",
    expired: "Expired",
    cancel: "Cancel",
    expires: "Expires",
    format: "Format",

    // Cancel export confirmation
    cancelExportTitle: "Cancel batch export?",
    cancelExportText:
      "Are you sure you want to cancel this batch export? This action cannot be undone.",
    cancelExportConfirm: "Yes, cancel export",
  },
  "zh-CN": {
    // Export button
    export: "导出",
    exportQueued: "导出已排队",
    exportQueuedDescription: "导出完成后您将收到一封电子邮件。",
    viewExports: "查看导出",
    exportAs: "导出为 {format}",
    traceExportWarning:
      "注意：追踪导出不包含观察级别列（级别、Token、费用、延迟）和评论的筛选条件。您收到的数据可能多于预期。",
    observationExportWarning:
      "注意：观察导出不包含追踪级别列（追踪名称、追踪标签、用户 ID、追踪环境）和评论的筛选条件。您收到的数据可能多于预期。",
    eventExportWarning:
      "注意：事件导出不包含评论的筛选条件。您收到的数据可能多于预期。",
    sessionExportWarning:
      "注意：会话导出不包含评论的筛选条件。您收到的数据可能多于预期。",
    auditLogExportWarning:
      "注意：筛选条件不会应用于审计日志导出。此项目的所有审计日志都会被导出。",

    // Exports settings page
    exportsPageTitle: "导出",
    exportsPageDescription:
      "通过 Langfuse 各处的导出按钮，按您偏好的格式导出大型数据集。导出为异步处理，在下方显示的每个导出的过期时间之前均可下载。导出准备完成后，您将收到一封电子邮件通知。",
    exportsAccessDenied: "拒绝访问",
    exportsNoPermission: "您没有查看批量导出的权限。",

    // Batch actions settings page
    batchActionsPageTitle: "批量操作",
    batchActionsPageDescription:
      "跟踪对表执行的批量操作的状态，例如将观察添加到数据集、删除追踪、将项目添加到注释队列。操作在后台异步处理。",
    batchActionsAccessDenied: "拒绝访问",
    batchActionsNoPermission: "您没有查看批量操作的权限。",

    // Batch actions table
    actionType: "操作类型",
    table: "表",
    status: "状态",
    progress: "进度",
    created: "创建时间",
    finished: "完成时间",
    createdBy: "创建者",
    unknown: "未知",
    log: "日志",
    failedCount: "{count} 个失败",

    // Batch exports table
    name: "名称",
    nameTooltip:
      "创建时间：{createdAt}\n完成时间：{finishedAt}\n下载过期时间：{expiresAt}",
    exportError: "导出错误",
    action: "操作",
    download: "下载",
    expired: "已过期",
    cancel: "取消",
    expires: "过期时间",
    format: "格式",

    // Cancel export confirmation
    cancelExportTitle: "取消批量导出？",
    cancelExportText: "确定要取消此批量导出吗？此操作无法撤销。",
    cancelExportConfirm: "是，取消导出",
  },
} satisfies Messages;
