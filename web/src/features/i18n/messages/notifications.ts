import { type Messages } from "../messages";

export const notificationMessages = {
  en: {
    reportIssue: "Report issue to Langfuse team",
    close: "Close",
    copyErrorId: "Copy error ID",
    pathLabel: "Path: {path}",
    errorIdLabel: "Error ID: {errorId}",
  },
  "zh-CN": {
    reportIssue: "向 Langfuse 团队报告问题",
    close: "关闭",
    copyErrorId: "复制错误 ID",
    pathLabel: "路径：{path}",
    errorIdLabel: "错误 ID：{errorId}",
  },
} satisfies Messages;
