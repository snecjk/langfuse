import { type Messages } from "../messages";

export const metadataMessages = {
  en: {
    signInCloudTitle: "Sign in | Langfuse Cloud",
    signUpCloudTitle: "Sign up | Langfuse Cloud",
    signInTitle: "Sign in | Langfuse",
    signUpTitle: "Sign up | Langfuse",
    resetTitle: "Reset password | Langfuse",
    setupTitle: "Set password | Langfuse",
    signInCloudDescription:
      "Sign in to Langfuse Cloud, the open source agent evals & observability platform. EU, US, Japan, and HIPAA data regions.",
    signUpCloudDescription:
      "Create a free Langfuse Cloud account. No credit card required. Trace, evaluate, and manage prompts for your LLM application.",
    signInDescription:
      "Sign in to Langfuse, the open source agent evals & observability platform.",
    signUpDescription: "Create a Langfuse account.",
    resetDescription: "Reset the password of your Langfuse account.",
    setupDescription: "Set the password of your Langfuse account.",
  },
  "zh-CN": {
    signInCloudTitle: "登录 | Langfuse Cloud",
    signUpCloudTitle: "注册 | Langfuse Cloud",
    signInTitle: "登录 | Langfuse",
    signUpTitle: "注册 | Langfuse",
    resetTitle: "重置密码 | Langfuse",
    setupTitle: "设置密码 | Langfuse",
    signInCloudDescription:
      "登录 Langfuse Cloud，开源智能体评估与可观测性平台。支持欧盟、美国、日本和 HIPAA 数据区域。",
    signUpCloudDescription:
      "免费创建 Langfuse Cloud 账户，无需信用卡。为你的大模型应用追踪、评估并管理提示词。",
    signInDescription: "登录 Langfuse，开源智能体评估与可观测性平台。",
    signUpDescription: "创建 Langfuse 账户。",
    resetDescription: "重置你的 Langfuse 账户密码。",
    setupDescription: "设置你的 Langfuse 账户密码。",
  },
} satisfies Messages;
