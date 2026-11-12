import { type Messages } from "../messages";

export const commonMessages = {
  en: {
    loading: "Loading",
    redirecting: "Redirecting",
    projectNotFound: "Project Not Found",
    projectUnavailable:
      "The project you are trying to access does not exist or you do not have access to it.",
    goHome: "Go to Home",
    language: "Language",
    languageDescription: "Choose the interface language for this browser",
  },
  "zh-CN": {
    loading: "加载中",
    redirecting: "正在跳转",
    projectNotFound: "未找到项目",
    projectUnavailable: "你尝试访问的项目不存在，或你没有访问权限。",
    goHome: "返回首页",
    language: "语言",
    languageDescription: "选择此浏览器的界面语言",
  },
} satisfies Messages;
