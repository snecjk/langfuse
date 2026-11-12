import { type Messages } from "../messages";

export const onboardingMessages = {
  en: {
    onboardingTitle: "Onboarding | Langfuse",
    failedToFinishOnboarding: "Failed to finish onboarding",
    failedToContinueOnboarding: "Failed to continue onboarding",
    pleaseTryAgain: "Please try again.",
    settingUpProject: "Setting up your project",
    takingYouToTracing: "Taking you to tracing...",
    failedToLoadOnboarding: "Failed to load onboarding",
    refreshPage: "Refresh the page to try again.",
    whatElseInputLabel: "What else will you use Langfuse for?",
    buildIntentOtherPlaceholder: "Tell us briefly",
    whereDidYouHear: "Where did you hear about us?",
    referralPlaceholder: "Colleague, Word of Mouth, X, Reddit, Event",
    organizationalSettings: "Organizational settings",
    organizationalSettingsHelp:
      "This setting applies to all users in your organization. You can change it later in organization settings.",
    enableAiFeatures: "Enable AI powered features",
    enableAiFeaturesCloudHelp:
      "Relevant project data can be sent to AWS Bedrock within your Langfuse data region. Your data will not be used to train models.",
    enableAiFeaturesSelfHostedHelp:
      "Relevant project data can be sent to the model provider configured by your instance administrator.",
    learnMore: "Learn more",
    next: "Next",
    question: "What will you use Langfuse for?",
    pickUpTo: "Pick up to {count}",
    newsletterGettingReady: "Getting your workspace ready",
    newsletterOneMoment: "One moment...",
    newsletterFinishingSetup: "Finishing setup",
    newsletterTakingYouToWorkspace: "Taking you to your workspace...",
    newsletterStayUpToDate: "Stay up to date",
    newsletterExplainerLabel: "How your address is used",
    newsletterInstallerDescription:
      "Monthly product updates, plus a heads-up when a new major version or a required upgrade affects your instance.",
    newsletterInvitedDescription:
      "One email a month with the newest Langfuse features and improvements.",
    newsletterInstallerExplainer:
      "By subscribing, you'll be added to the Langfuse mailing lists for product updates and self-hosting notices. Expect a monthly email about new features, plus a heads-up when a new major version or a required upgrade affects your instance.",
    newsletterInvitedExplainer:
      "By subscribing, you'll be added to the Langfuse product updates list. Expect one email a month about new features.",
    newsletterFallbackUnreachable:
      "This browser can't reach langfuse.com. To subscribe, open a link below on a device with internet access:",
    newsletterFallbackFailed:
      "We couldn't subscribe you. You can sign up here instead:",
    newsletterFallbackOss: "Self-hosting notices:",
    newsletterFallbackProduct: "Product updates:",
    newsletterEmail: "Email",
    newsletterSubscribe: "Subscribe",
    newsletterSkip: "Skip",
    newsletterContinue: "Continue",
    newsletterValidEmail: "Enter a valid email address",
    newsletterUnsubscribe:
      "You can unsubscribe at any time with the link in every email.",
    newsletterBrowserCheckPrefix:
      "Shown once to new users. Your browser, not this instance, checks it can reach langfuse.com and sends your address to",
    newsletterBrowserCheckSuffix:
      "when you subscribe. If it can't reach it, you'll see sign-up links instead.",
    newsletterAdminsDisablePrefix:
      "Langfuse admins can disable this question entirely by setting",
    newsletterAdminsDisableSuffix: ".",
    copyPrompt: "Copy prompt",
    copied: "Copied",
    failedToCopy: "Failed to copy to clipboard",
    failedToCreateApiKey: "Failed to create API key",
    waitingForFirstTrace: "Waiting for first trace",
    timeToLogFirstTrace: "Time to log your first trace, it only takes a minute",
    tracesSetupDescription:
      "Get your API keys first, then ask your coding agent to add observability with Langfuse to your application.",
    createApiKeys: "Create API keys",
    createApiKeysDescription:
      "Your application needs API keys to send traces to Langfuse.",
    createNewApiKey: "Create new API key",
    manageApiKeys: "Manage API keys",
    addTracingWithCodingAgent: "Add tracing with your coding agent",
    recommended: "Recommended",
    pastePromptIntoAgent:
      "Paste this prompt into Claude, Cursor, Copilot, or another coding agent.",
    followDocsManually: "or follow our docs to set up tracing manually",
    runAppTracesAppear: "Run your app — traces will appear here",
    tracesAppearDescription:
      "Once your app makes an LLM call, traces show up within seconds.",
  },
  "zh-CN": {
    onboardingTitle: "引导 | Langfuse",
    failedToFinishOnboarding: "完成引导失败",
    failedToContinueOnboarding: "继续引导失败",
    pleaseTryAgain: "请重试。",
    settingUpProject: "正在设置项目",
    takingYouToTracing: "正在跳转到追踪……",
    failedToLoadOnboarding: "加载引导失败",
    refreshPage: "请刷新页面重试。",
    whatElseInputLabel: "你还会用 Langfuse 做什么？",
    buildIntentOtherPlaceholder: "请简要描述",
    whereDidYouHear: "你是从哪里了解我们的？",
    referralPlaceholder: "同事、口碑传播、X、Reddit、活动",
    organizationalSettings: "组织设置",
    organizationalSettingsHelp:
      "此设置适用于组织中的所有用户。你可以稍后在组织设置中更改。",
    enableAiFeatures: "启用 AI 功能",
    enableAiFeaturesCloudHelp:
      "相关项目数据可能会被发送到你的 Langfuse 数据区域内 AWS Bedrock。你的数据不会被用于训练模型。",
    enableAiFeaturesSelfHostedHelp:
      "相关项目数据可能会被发送到你的实例管理员配置的模型提供商。",
    learnMore: "了解更多",
    next: "下一步",
    question: "你将会用 Langfuse 做什么？",
    pickUpTo: "最多选择 {count} 项",
    newsletterGettingReady: "正在准备你的工作区",
    newsletterOneMoment: "请稍候……",
    newsletterFinishingSetup: "正在完成设置",
    newsletterTakingYouToWorkspace: "正在跳转到你的工作区……",
    newsletterStayUpToDate: "保持更新",
    newsletterExplainerLabel: "你的地址将如何被使用",
    newsletterInstallerDescription:
      "每月一次产品更新，以及在你实例升级影响重大版本或必须升级时发送提醒。",
    newsletterInvitedDescription:
      "每月一封邮件，介绍最新的 Langfuse 功能与改进。",
    newsletterInstallerExplainer:
      "订阅后，你会被加入 Langfuse 产品更新和自托管通知的邮件列表。你预计每月会收到一封关于新功能的邮件，以及在你实例升级影响重大版本或必须升级时收到提醒。",
    newsletterInvitedExplainer:
      "订阅后，你会被加入 Langfuse 产品更新列表。你预计每月会收到一封关于新功能的邮件。",
    newsletterFallbackUnreachable:
      "此浏览器无法访问 langfuse.com。如需订阅，请在可上网的设备上打开下面的链接：",
    newsletterFallbackFailed: "我们无法为你完成订阅。你可以在此注册：",
    newsletterFallbackOss: "自托管通知：",
    newsletterFallbackProduct: "产品更新：",
    newsletterEmail: "邮箱",
    newsletterSubscribe: "订阅",
    newsletterSkip: "跳过",
    newsletterContinue: "继续",
    newsletterValidEmail: "请输入有效的邮箱地址",
    newsletterUnsubscribe: "你可以随时通过每封邮件中的链接退订。",
    newsletterBrowserCheckPrefix:
      "仅向新用户展示一次。由你的浏览器（而非本实例）检查是否能访问 langfuse.com，并在你订阅时把你的地址发送到",
    newsletterBrowserCheckSuffix: "。如果无法访问，你将看到注册链接。",
    newsletterAdminsDisablePrefix: "Langfuse 管理员可以通过设置",
    newsletterAdminsDisableSuffix: "来完全关闭此问题。",
    copyPrompt: "复制提示词",
    copied: "已复制",
    failedToCopy: "复制到剪贴板失败",
    failedToCreateApiKey: "创建 API 密钥失败",
    waitingForFirstTrace: "等待第一条追踪",
    timeToLogFirstTrace: "是时候记录你的第一条追踪了，只需一分钟",
    tracesSetupDescription:
      "请先获取 API 密钥，然后让编码代理为你的应用接入 Langfuse 可观测性。",
    createApiKeys: "创建 API 密钥",
    createApiKeysDescription: "你的应用需要 API 密钥才能向 Langfuse 发送追踪。",
    createNewApiKey: "新建 API 密钥",
    manageApiKeys: "管理 API 密钥",
    addTracingWithCodingAgent: "使用编码代理添加追踪",
    recommended: "推荐",
    pastePromptIntoAgent:
      "将此提示词粘贴到 Claude、Cursor、Copilot 或其他编码代理中。",
    followDocsManually: "或按照我们的文档手动设置追踪",
    runAppTracesAppear: "运行你的应用 — 追踪将显示在这里",
    tracesAppearDescription: "一旦你的应用发起 LLM 调用，追踪会在几秒内出现。",
  },
} satisfies Messages;
