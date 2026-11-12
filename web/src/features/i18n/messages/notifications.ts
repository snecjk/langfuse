import { type Messages } from "../messages";

export const notificationMessages = {
  en: {
    reportIssue: "Report issue to Langfuse team",
    close: "Close",
    copyErrorId: "Copy error ID",
    pathLabel: "Path: {path}",
    errorIdLabel: "Error ID: {errorId}",
    paymentBillingIssueTitle: "Billing Issue:",
    paymentBillingIssueMessage:
      "We have problems collecting subscription payment for your organization '{organization}'. Please update your payment information to continue using Langfuse.",
    paymentUpdatePayment: "Update Payment",
    previewDeploymentPrefix: "Preview deployment of",
    previewDeploymentPr: "PR #{prNumber}",
    previewDeploymentPrGeneric: "a pull request",
    previewDeploymentBy: "by",
    previewDeploymentUpdated: "updated {time}",
    notificationChannelsTitle: "Project Notifications",
    notificationChannelsDescription:
      "Manage project notifications. Channel notifications are sent in addition to the admin emails.",
    notificationChannelsEvents: "Events",
    notificationChannelsEventsDescription:
      "Choose which events are delivered to your channels.",
    notificationChannelsEventsDescriptionEmpty:
      "Configure a channel above to enable project notifications.",
    notificationChannelsWebhookSecretTitle: "Webhook Secret Created",
    notificationChannelsWebhookSecretDescription:
      "Copy the webhook secret below — it will only be shown once.",
    notificationChannelsWebhookSecretConfirm: "I've saved the secret",
    notificationChannelsBlobExportFailedTitle: "Blob storage export failed",
    notificationChannelsBlobExportFailedDescription:
      "Sent when a scheduled blob storage export fails.",
    notificationChannelsPosthogExportFailedTitle: "PostHog export failed",
    notificationChannelsPosthogExportFailedDescription:
      "Sent when a PostHog export is disabled after a configuration error, such as an unreachable host.",
    notificationChannelsEvaluatorBlockedTitle: "Evaluator deactivated",
    notificationChannelsEvaluatorBlockedDescription:
      "Sent when an evaluator is deactivated due to an unrecoverable error, such as a deleted model or LLM connection.",
    notificationChannelsLoading: "Loading channels...",
    notificationChannelsEditChannel: "Edit channel",
    notificationChannelsDeleteChannel: "Delete channel",
    notificationChannelsAddChannel: "Add channel",
    personalNotificationsTitle: "Personal Notifications",
    personalNotificationsLoading: "Loading preferences...",
    personalNotificationsEmailTitle: "Email Notifications",
    personalNotificationsEmailDescription:
      "Manage your personal email notification preferences for this project.",
    personalNotificationsCommentMentions: "Comment Mentions",
    personalNotificationsCommentMentionsDescription:
      "Receive an email when someone mentions you in a comment",
    personalNotificationsUpdateFailed:
      "Failed to update notification preference. Please try again.",
  },
  "zh-CN": {
    reportIssue: "向 Langfuse 团队报告问题",
    close: "关闭",
    copyErrorId: "复制错误 ID",
    pathLabel: "路径：{path}",
    errorIdLabel: "错误 ID：{errorId}",
    paymentBillingIssueTitle: "账单问题：",
    paymentBillingIssueMessage:
      "我们难以收取你的组织“{organization}”的订阅付款。请更新你的支付信息以继续使用 Langfuse。",
    paymentUpdatePayment: "更新支付方式",
    previewDeploymentPrefix: "预览部署来自",
    previewDeploymentPr: "PR #{prNumber}",
    previewDeploymentPrGeneric: "一个拉取请求",
    previewDeploymentBy: "来自",
    previewDeploymentUpdated: "更新于 {time}",
    notificationChannelsTitle: "项目通知",
    notificationChannelsDescription:
      "管理项目通知。频道通知会在管理员邮件之外额外发送。",
    notificationChannelsEvents: "事件",
    notificationChannelsEventsDescription: "选择要投递到频道的事件。",
    notificationChannelsEventsDescriptionEmpty:
      "请在上方配置频道以启用项目通知。",
    notificationChannelsWebhookSecretTitle: "Webhook 密钥已创建",
    notificationChannelsWebhookSecretDescription:
      "请复制下方的 Webhook 密钥——它只会显示一次。",
    notificationChannelsWebhookSecretConfirm: "我已保存密钥",
    notificationChannelsBlobExportFailedTitle: "Blob 存储导出失败",
    notificationChannelsBlobExportFailedDescription:
      "当计划中的 Blob 存储导出失败时发送。",
    notificationChannelsPosthogExportFailedTitle: "PostHog 导出失败",
    notificationChannelsPosthogExportFailedDescription:
      "当 PostHog 导出在发生配置错误（例如主机无法访问）后被禁用时发送。",
    notificationChannelsEvaluatorBlockedTitle: "评估器已停用",
    notificationChannelsEvaluatorBlockedDescription:
      "当评估器因不可恢复的错误（例如模型或 LLM 连接已被删除）而被停用时发送。",
    notificationChannelsLoading: "正在加载频道…",
    notificationChannelsEditChannel: "编辑频道",
    notificationChannelsDeleteChannel: "删除频道",
    notificationChannelsAddChannel: "添加频道",
    personalNotificationsTitle: "个人通知",
    personalNotificationsLoading: "正在加载偏好设置…",
    personalNotificationsEmailTitle: "邮件通知",
    personalNotificationsEmailDescription:
      "管理你在此项目中的个人邮件通知偏好。",
    personalNotificationsCommentMentions: "评论提及",
    personalNotificationsCommentMentionsDescription:
      "当有人在评论中提及你时接收邮件",
    personalNotificationsUpdateFailed: "更新通知偏好失败。请重试。",
  },
} satisfies Messages;
