import { type Messages } from "../messages";

export const workspaceMessages = {
  en: {
    organizations: "Organizations",
    projects: "Projects",
    new: "New",
    newOrganization: "New organization",
    newProject: "New project",
    searchOrganizations: "Search organizations...",
    searchProjects: "Search projects...",
    noOrganizations: "No organization found.",
    noProjects: "No project found.",
    settingsFor: "Go to settings for {name}",

    home: "Home",
    create: "Create",
    loading: "Loading...",
    welcomeToLangfuse: "Welcome to Langfuse",
    getStarted: "Get Started",
    getStartedCanCreate:
      "Create an organization to get started. Alternatively, ask your organization admin to invite you.",
    getStartedInviteOnly:
      "You need to get invited to an organization to get started with Langfuse.",
    docs: "Docs",
    askAi: "Ask AI",
    demoOrganization: "Demo Organization",
    tryLangfuseDemo: "Try Langfuse Demo",
    demoDescription:
      "We have built a Q&A chatbot that answers questions based on the Langfuse Docs. Interact with it to see traces in Langfuse.",
    viewDemoProject: "View Demo Project",

    newOrganizationTitle: "New Organization",
    newProjectTitle: "New Project",
    organizationsHelp:
      "Organizations are used to manage your projects and teams.",
    createOrganizationHelp:
      "Create an organization to get started. Alternatively, ask your organization admin to invite you.",
    projectsHelp:
      "Projects are used to group traces, datasets, evals and prompts. Environments can be separated using the built-in environment feature.",
    organizationName: "Organization name",
    projectName: "Project name",
    aiFeaturesEnabled: "Enable AI powered features",
    aiFeaturesCloudHelp:
      "Relevant project data can be sent to AWS Bedrock within your Langfuse data region. Your data will not be used to train models.",
    aiFeaturesSelfHostedHelp:
      "Relevant project data can be sent to the model provider configured by your instance administrator.",
    learnMore: "Learn more",
    failedToCreateOrganization: "Failed to create organization",

    setup: "Setup",
    createOrganizationStep: "1. Create Organization",
    createProjectStep: "2. Create Project",
    organizationSettingsTile: "Organization settings",
    noProjectsTitle: "No projects",
    noProjectsHelp: "This organization has no projects yet.",
    noProjectAccessHelp:
      "You don't have access to any projects in this organization.",
    gatewayPendingHelp:
      "The AI Gateway of {name} isn't ready yet. Your admin is still setting it up, so check back soon.",
    gatewayNoKeyHelp:
      "You've been invited to use the AI Gateway of {name}. Create your personal gateway key to start using your team's AI models.",
    gatewayHasKeyHelp:
      "You're set up with the AI Gateway of {name}. Manage your gateway keys or see which AI models you can use.",
    createGatewayKey: "Create gateway key",
    manageGatewayKeys: "Manage gateway keys",
    viewModels: "View models",
    whatsTheAiGateway: "What's the AI Gateway?",
    noAccessToOrganization: "No access to this organization",
    aiGatewayNotEnabled:
      "AI Gateway is not enabled for this organization. Ask an organization admin to change your role.",
    organizationNotFound: "Organization not found",
    organizationNotFoundHelp:
      "This organization does not exist or you do not have access to it.",
    goToProject: "Go to project",
    goToProjectAria: "Go to project {name}",
    projectDeletionPending: "Project is being deleted",
    lastTrace: "Last trace {time}",
    noTraces30d: "No traces in the last 30d",
    gatewayProjectHint: "Receives AI Gateway traces",
    gatewayProjectAria: "AI Gateway project",

    noData: "No data",
  },
  "zh-CN": {
    organizations: "组织",
    projects: "项目",
    new: "新建",
    newOrganization: "新建组织",
    newProject: "新建项目",
    searchOrganizations: "搜索组织…",
    searchProjects: "搜索项目…",
    noOrganizations: "未找到组织。",
    noProjects: "未找到项目。",
    settingsFor: "打开 {name} 的设置",

    home: "首页",
    create: "创建",
    loading: "加载中…",
    welcomeToLangfuse: "欢迎使用 Langfuse",
    getStarted: "开始使用",
    getStartedCanCreate:
      "请创建一个组织以开始使用。或者，请你的组织管理员邀请你加入。",
    getStartedInviteOnly: "你需要被邀请加入一个组织后才能开始使用 Langfuse。",
    docs: "文档",
    askAi: "向 AI 提问",
    demoOrganization: "演示组织",
    tryLangfuseDemo: "体验 Langfuse 演示",
    demoDescription:
      "我们构建了一个基于 Langfuse 文档回答问题的 Q&A 聊天机器人。与它互动即可在 Langfuse 中查看追踪。",
    viewDemoProject: "查看演示项目",

    newOrganizationTitle: "新建组织",
    newProjectTitle: "新建项目",
    organizationsHelp: "组织用于管理你的项目和团队。",
    createOrganizationHelp:
      "请创建一个组织以开始使用。或者，请你的组织管理员邀请你加入。",
    projectsHelp:
      "项目用于对追踪、数据集、评估和提示词进行分组。你可以使用内置的环境功能来区分不同环境。",
    organizationName: "组织名称",
    projectName: "项目名称",
    aiFeaturesEnabled: "启用 AI 功能",
    aiFeaturesCloudHelp:
      "相关项目数据可能会被发送到你的 Langfuse 数据区域内 AWS Bedrock。你的数据不会被用于训练模型。",
    aiFeaturesSelfHostedHelp:
      "相关项目数据可能会被发送到你的实例管理员配置的模型提供商。",
    learnMore: "了解更多",
    failedToCreateOrganization: "创建组织失败",

    setup: "设置",
    createOrganizationStep: "1. 创建组织",
    createProjectStep: "2. 创建项目",
    organizationSettingsTile: "组织设置",
    noProjectsTitle: "暂无项目",
    noProjectsHelp: "此组织还没有任何项目。",
    noProjectAccessHelp: "你没有此组织中任何项目的访问权限。",
    gatewayPendingHelp:
      "{name} 的 AI 网关尚未准备就绪。你的管理员仍在设置中，请稍后再来看看。",
    gatewayNoKeyHelp:
      "你已被邀请使用 {name} 的 AI 网关。请创建你的个人网关密钥，以开始使用团队的 AI 模型。",
    gatewayHasKeyHelp:
      "你已完成 {name} 的 AI 网关设置。你可以管理你的网关密钥，或查看你可用的 AI 模型。",
    createGatewayKey: "创建网关密钥",
    manageGatewayKeys: "管理网关密钥",
    viewModels: "查看模型",
    whatsTheAiGateway: "什么是 AI 网关？",
    noAccessToOrganization: "无权访问此组织",
    aiGatewayNotEnabled: "此组织未启用 AI 网关。请联系组织管理员更改你的角色。",
    organizationNotFound: "未找到组织",
    organizationNotFoundHelp: "此组织不存在，或你没有访问权限。",
    goToProject: "前往项目",
    goToProjectAria: "前往项目 {name}",
    projectDeletionPending: "项目正在删除中",
    lastTrace: "最近追踪：{time}",
    noTraces30d: "最近 30 天暂无追踪",
    gatewayProjectHint: "接收 AI 网关追踪",
    gatewayProjectAria: "AI 网关项目",

    noData: "暂无数据",
  },
} satisfies Messages;
