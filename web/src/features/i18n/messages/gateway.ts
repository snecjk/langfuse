import { type Messages } from "../messages";

export const gatewayMessages = {
  en: {
    // Page titles (useGatewayPages)
    overview: "Overview",
    providersAndModels: "Providers & Models",
    gatewayKeys: "Gateway keys",
    helpDescriptionManager:
      "Cost and usage of requests made through the AI Gateway, read from its ingestion project.",
    helpDescriptionMember:
      "Cost and usage of your requests made through the AI Gateway.",
    setupRequiredReason: "Finish the gateway setup on Overview first.",

    // GatewayPage
    pageTitle: "AI Gateway",

    // Model tabs
    providersTab: "Providers",
    modelsTab: "Models",

    // Common actions
    retry: "Retry",
    dismiss: "Dismiss",
    done: "Done",
    save: "Save",
    create: "Create",
    close: "Close",
    continue: "Continue",
    back: "Back",
    add: "Add",
    remove: "Remove",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",

    // Overview / Setup hero
    setupHeroTitle: "Set up Langfuse AI Gateway",
    setupHeroLead:
      "Route Claude Code, Codex, OpenCode, and your own apps through Langfuse. Each call becomes a full trace, along with who made it and what it cost.",
    setupHeroDocsLink: "How to set up the gateway",
    connectedProviders: "Connected providers: {names}.",
    noProvidersConnected: "No provider connected yet.",

    // Ingestion
    ingestionSettings: "Ingestion settings",
    gatewayIngestion: "Gateway ingestion",
    ingestionSaved: "Ingestion settings saved",
    ingestionSavedDescription: "New gateway requests use these settings.",
    ingestionDialogDescription:
      "Choose what Langfuse records for requests sent through the gateway.",
    ingestionDocsLink: "How ingestion modes work",
    ingestionSetupButton: "Set up ingestion",
    ingestionModeLabel: "Ingestion: {mode}",
    chooseIngestionTitle: "Choose how gateway traffic is recorded",
    ingestionChangeLater: "You can change this later.",
    ingestionModeFull: "Full",
    ingestionModeFullDesc:
      "Capture full request and response payloads for tracing.",
    ingestionModeUsage: "Usage",
    ingestionModeUsageDesc: "Capture model, token usage, cost, and latency.",
    ingestionModeNone: "None",
    ingestionModeNoneDesc:
      "Route requests without capturing anything in Langfuse.",
    recordInNewProject: "Record in a",
    recordInExistingProject: "Record in an",
    newProjectLabel: "new",
    existingProjectLabel: "existing",
    projectNamed: "project named",
    projectLabel: "project",
    noProjectsYet: "This organization has no projects yet.",
    selectProject: "Select a project",
    searchProjects: "Search projects",
    newOrExistingProject: "New or existing project",
    projectName: "Project name",
    ingestionProject: "Ingestion project",
    notRecordingTraffic: "Not recording gateway traffic",
    recordingUsageOnly: "Recording usage only",
    recordingFull: "Recording full requests and responses",
    recordingInProject: '{summary} in project "{name}"',
    projectAccessAlertTitle:
      "Everyone with project access sees gateway traffic",
    projectAccessAlertDescription:
      "Anyone who can open the ingestion project, including every organization member and viewer through their organization role, can see gateway requests, costs, and gateway key owners{extra}. Use a dedicated project and restrict who can access it.",
    projectAccessAlertFullExtra: ", plus the full prompts and responses",

    // Provider credential dialog
    addProviderCredential: "Add provider credential",
    editProviderCredential: "Edit provider credential",
    providerLabel: "Provider",
    providerDescription: "Where gateway requests for this credential are sent.",
    providerFixedDescription: "Fixed once the credential is saved.",
    credentialNameLabel: "Name",
    credentialNameDescription:
      "Used as the prefix when calling models, e.g. {example}",
    credentialNamePlaceholder: "Production",
    credentialKeyLabel: "{provider} API key",
    credentialKeyDescriptionOpenai:
      "Create one under API keys in the OpenAI platform.",
    credentialKeyDescriptionAnthropic:
      "Create one under API keys in the Claude Console.",
    credentialKeyDescriptionBedrock:
      "Amazon Bedrock API keys. The key needs access to the selected region.",
    credentialKeyPlaceholder: "Enter {provider} API key",
    credentialKeyPlaceholderSaved: "Leave blank to keep current key",
    awsRegionLabel: "AWS region",
    awsRegionDescription:
      "Requests go to Bedrock in this region. It can't be changed after saving.",
    searchRegions: "Search regions",
    selectRegion: "Select a region",
    noMatchingRegion: "No matching region",
    hipaaRegionTitle: "HIPAA region",
    hipaaRegionDescription:
      "Requests are forwarded to the provider you configure, using your credentials and on your instruction. Make sure you have a BAA with that provider before sending PHI.",
    testButton: "Test",
    testAndSaveButton: "Test and save",
    credentialValidTitle: "Provider credential is valid",
    credentialValidDescription: "No changes were saved.",
    credentialValidationError: "Credential validation failed",
    credentialSaveError: "Provider credential could not be saved",
    credentialSaveErrorDescription:
      "The credential could not be saved or validated. Check the key and try again.",
    modelListingDeniedToast:
      "Provider credential saved, but its models can't be listed",
    renameWarningTitle: "Renaming changes model slugs",
    renameWarningDescription:
      "Requests using model slugs with the old connection name will stop resolving.",

    // Advanced settings
    showAdvancedSettings: "Show advanced settings",
    hideAdvancedSettings: "Hide advanced settings",
    apiBaseUrlLabel: "API Base URL",
    apiBaseUrlDescription:
      "Leave blank to use the default base URL. {extra}{default}",
    apiBaseUrlChangeWarning: "Changing it requires a new secret key. ",
    apiBaseUrlDefaultOpenai: "OpenAI default: https://api.openai.com/v1",
    apiBaseUrlDefaultAnthropic:
      "Anthropic default: https://api.anthropic.com (excluding /v1/messages)",
    apiBaseUrlPlaceholder: "default",
    extraHeadersLabel: "Extra Headers",
    extraHeadersDescription:
      "Optional HTTP headers sent with every request to the provider. Header values are stored encrypted.",
    addHeader: "Add Header",
    headerName: "Header name",
    headerValue: "Header value",
    removeHeader: "Remove header",

    // Models page / Provider cards
    noProvidersYet: "No providers yet",
    noProvidersManagerDescription:
      "Add an {providers} credential so the gateway can route requests and discover models.",
    noProvidersMemberDescription:
      "Ask your organization admin to add a provider so the gateway can route requests.",
    addProvider: "Add provider",
    connectProvider: "Connect",
    howToSetupGateway: "How to set up the gateway",
    aboutGatewayModels: "About gateway models",
    moreSoon: "More soon",
    addProviderLabel: "+ Add",
    providerCredentialLabel: "Credential",
    modelsLabel: "Models",
    viewModels: "View models",
    credentialRejected: "Credential rejected",
    loadingEllipsis: "Loading…",
    allModelsEnabled: "All models enabled",
    modelsEnabledCount: "{count} enabled",
    modelsEnabledOfTotal: "{enabled} of {total} enabled",
    refreshModels: "Refresh models",
    refreshModelsFor: "Refresh models for {name}",
    editCredential: "Edit credential",
    editFor: "Edit {name}",
    deleteCredential: "Delete credential",
    deleteFor: "Delete {name}",
    deleteProviderTitle: "Delete provider credential",
    deleteProviderText:
      'Delete "{name}"? Requests will immediately stop using it.',
    deleteCredentialConfirm: "Delete credential",
    loadMore: "Load more",
    setupGuideDescription:
      "Connect provider credentials and choose how gateway traffic is recorded in Langfuse.",
    providersPageDescription:
      "The providers your organization routes gateway requests through.",

    // Models table
    modelColumn: "Model",
    routesColumn: "Routes",
    enabledColumn: "Enabled",
    enableAll: "Enable all",
    disableAll: "Disable all",
    enableAction: "Enable",
    disableAction: "Disable",
    noModelsMatch: "No models match the current search.",
    customBadge: "Custom",
    removeModel: "Remove {model}",
    enableModel: "Enable {model}",
    disableModel: "Disable {model}",
    refreshFromProvider: "Refresh models from provider",
    modelsLoadError: "Models could not be loaded",
    modelsLoadErrorDescription:
      "The provider returned a model discovery error. Refresh the provider before changing model access.",
    loadingModels: "Loading models",

    // Add custom model
    addCustomModel: "Add custom model",
    addModel: "Add model",
    addModelDescription:
      "Add a model the provider does not list, such as a fine-tuned model or an inference profile. Gateway keys can call it once it is enabled.",
    modelIdLabel: "Model ID",
    modelIdPlaceholder: "e.g. ft:gpt-4o-mini:my-org::abc123",
    modelIdRequired: "Enter a model ID.",
    modelAlreadyListed: "This model is already listed.",
    testBeforeAdd: "Send a successful test request first.",
    testModelWithCredential: "Test this model with your current credential",
    modelNotTested: "This model hasn't been tested with your credential yet.",
    testAgain: "Test again",
    sendTestRequest: "Send test request",
    requestAccepted: "Request accepted",
    requestAcceptedDescription:
      "The provider responded in {duration}ms. This model is ready to add.",
    requestFailed: "Request failed",
    requestFailedWithStatus: "Request failed — {status}",

    // API keys page
    gatewayKeysDescriptionManager:
      "Gateway keys authenticate requests to the AI Gateway only. User keys are revoked when their owner leaves the organization; service account keys keep working.",
    gatewayKeysDescriptionMember:
      "Your gateway keys authenticate requests to the AI Gateway only. They are revoked when you leave the organization or lose gateway access.",
    howGatewayKeysWork: "How gateway keys work",
    createKey: "Create key",
    notifyTeam: "Notify team",
    usageInstructions: "Usage instructions",

    // Create key dialog
    createGatewayKeyTitle: "Create gateway key",
    gatewayKeyCreatedTitle: "Gateway key created",
    createKeyButton: "Create key",
    issuedAsLabel: "Issued as",
    issuedAsUser: "My user",
    issuedAsServiceAccount: "Service account",
    issuedAsUserDescription: "Stops working if you leave the organization.",
    issuedAsServiceAccountDescription:
      "Keeps working when people leave the organization.",
    nameFieldLabel: "Name",
    nameFieldPlaceholder: "e.g. claude-local, codex-local, or backend-service",
    nameFieldTooltip:
      "Shown in the key list. Use it to describe what consumes the key.",
    metadataLabel: "Metadata",
    metadataOptional: "(optional)",
    metadataSetCount: " · {count} set",
    metadataTooltipLabel: "About gateway key metadata",
    metadataTooltip:
      "Attached to every trace from this key, so you can filter and group by it.",
    metadataKeyPlaceholder: "key",
    metadataValuePlaceholder: "value",
    metadataKeyAria: "Metadata key",
    metadataValueAria: "Metadata value",
    removeMetadataField: "Remove metadata field",
    addMetadata: "Add metadata",
    gatewayKeyCreateError: "Gateway key could not be created",
    gatewayKeyCreateErrorDescription: "Check the metadata and try again.",

    // API keys table
    tableCreated: "Created",
    tableName: "Name",
    tableKey: "Key",
    tableUser: "User",
    tableExpiration: "Expiration",
    tableLastUsed: "Last used",
    tableMetadata: "Metadata",
    noExpiration: "No expiration",
    expiredOn: "Expired on ",
    serviceAccount: "Service account",
    notUsedInDays: "Not used ({days}d)",
    unavailable: "Unavailable",
    revokeKey: "Revoke key",
    revokeGatewayKeyTitle: "Revoke gateway key",
    revokeGatewayKeyText:
      "Requests using this key will immediately be rejected. This action cannot be undone.",
    confirmRevokeKey: "Revoke key",
    searchByNameOrUser: "Search by name or user",
    noKeysMatchSearch: "No gateway keys match the current search.",
    noKeysCreated: "No gateway keys created.",

    // API keys empty state
    noGatewayKeysYet: "No gateway keys yet",
    noGatewayKeysDescription:
      "Create a gateway key to send requests through the AI Gateway from Claude Code, Codex, or your own code.",
    userKeyTitle: "User key",
    userKeyDescription:
      "Tied to one member. Revoked when they leave the organization.",
    serviceAccountKeyTitle: "Service account key",
    serviceAccountKeyDescription:
      "For apps and pipelines. Keeps working when people leave.",
    yourOwnCode: "Your own code",

    // First key placeholder
    createYourGatewayKey: "Create your gateway key",
    createKeyForOrg:
      "Your admin set up the AI Gateway for {org}. Create a personal key to send requests from Claude Code, Codex, or your own code.",
    yourOrganizationFallback: "your organization",
    createMyKey: "Create my key",
    mintNewKey: "Mint a new key whenever you need one.",
    oneKeyAllModels: "One key for Anthropic and OpenAI models",
    useSameKeyAcrossProviders: "Use the same key across providers.",
    seeAvailableModels: "See available models",
    createYourOwnKeys: "Create your own keys",

    // Not set up notice
    notSetUpTitle: "AI Gateway isn't set up yet",
    notSetUpDescription:
      "An admin or owner of {org} needs to connect a provider before you can create a gateway key. Ask them to set it up.",
    learnMoreAboutGateway: "Learn more about AI Gateway",
    notSetUpLabel: "Not set up",

    // Not deployed notice
    notDeployedTitle: "AI Gateway isn't deployed",
    notDeployedDescription:
      "On self-hosted Langfuse, the AI Gateway runs as a separate service. Deploy it next to your Langfuse instance to configure provider credentials, models and gateway keys.",
    selfHostingGuide: "Self-hosting guide",
    notDeployedLabel: "Not deployed",

    // Analytics
    analyticsNotRecordedTitle: "Gateway requests aren't recorded",
    analyticsNotRecordedManager:
      "Analytics are built from the traces the gateway writes to its ingestion project. Turn on usage or full ingestion with the Ingestion button at the top right to see cost and usage here.",
    analyticsNotRecordedMember:
      "Ask your organization admin to turn on usage or full ingestion for the AI Gateway to see your cost and usage here.",
    howAnalyticsWorks: "How gateway analytics work",
    notRecordedLabel: "Not recorded",
    sendFirstRequest: "Send your first request",
    firstRequestDescription:
      "Cost and usage show up here once requests go through the AI Gateway. Add a gateway key, then point your LLM client at the gateway.",
    addGatewayKey: "Add gateway key",
    readTheDocs: "Read the docs",
    oneKeyEveryProvider: "One key for every provider",
    oneKeyEveryProviderDesc: "Use one key for Anthropic and OpenAI.",
    spendByPersonAndTeam: "Spend by person and team",
    spendByPersonDesc: "Track spend by person, team, and key.",
    approvedModelsOnly: "Approved models only",
    approvedModelsDesc: "Approve and remove models for entire company.",
    fullTraces: "Full traces",
    fullTracesDesc: "Record full traces, not just token counts.",

    // Analytics filters
    filterByUser: "User",
    filterByGatewayKey: "Gateway key",
    searchUsers: "Search users",
    searchGatewayKeys: "Search gateway keys",

    // Unpriced usage alert
    unpricedUsageTitle: "Cost excludes unpriced usage",
    unpricedUsageDescription:
      "{requests} used models without a price ({models}), so the cost widgets count them as $0.",
    addModelPrices: "Add model prices",

    // Analytics widget names
    widgetTotalCost: "Total cost",
    widgetTotalCostDesc: "Cost of all gateway requests",
    widgetRequests: "Requests",
    widgetRequestsDesc: "Observations recorded by the gateway",
    widgetTokens: "Tokens",
    widgetTokensDesc: "Input and output tokens",
    widgetCostOverTime: "Cost over time",
    widgetCostOverTimeDesc: "Cost of all gateway requests over time",
    widgetCostByUser: "Cost by user",
    widgetCostByUserDesc:
      "Top {limit} users by cost; service keys are excluded",
    widgetRequestsPerUser: "Requests per user",
    widgetRequestsPerUserDesc:
      "Top {limit} users by requests; service keys are excluded",
    widgetCostByKey: "Cost by gateway key",
    widgetCostByKeyDesc: "Top {limit} gateway keys by cost",
    widgetCostByModel: "Cost by model",
    widgetCostByModelDesc: "Top {limit} models by cost",

    // Launch banner
    launchBannerGetKey: "Get gateway key",
    launchBannerLearnMore: "Learn more",
    launchBannerSetup: "Set up",
    launchBannerTitle: "AI Gateway",
    launchBannerDescription:
      "Trace and monitor your AI usage by installing the Langfuse AI Gateway in 2 minutes.",

    // Launch dialog
    launchDialogAdminTitle: "Introducing Langfuse AI Gateway",
    launchDialogAdminLead:
      "Route Claude Code, Codex, OpenCode, and your own apps through Langfuse. Each call becomes a full trace, along with who made it and what it cost.",
    launchDialogAdminPoint1: "Use one key for Anthropic and OpenAI",
    launchDialogAdminPoint2: "Track spend by person, team, and key",
    launchDialogAdminPoint3: "Approve and remove models for entire company",
    launchDialogAdminPoint4: "Record full traces, not just token counts",
    launchDialogMemberTitle: "Get your own AI Gateway key",
    launchDialogMemberLead:
      "Access Anthropic and OpenAI models with a single key you create yourself.",
    launchDialogMemberPoint1: "Create your own keys",
    launchDialogMemberPoint2: "One key for Anthropic and OpenAI models",
    selectOrganization: "Select an organization",
    setUpGateway: "Set up gateway",
    getGatewayKey: "Get gateway key",
    askAdminToSetup: "Ask your admin to set it up.",
    learnMore: "Learn more",

    // Team invite
    notifyYourTeam: "Notify your team",
    notifyTeamDescription:
      "Members can create their own gateway keys and use the models you enabled. New people join with the AI Gateway role.",
    aboutRoles: "About roles",
    notificationsNotSent: "Notifications could not be sent",
    skipForNow: "Skip for now",
    allExistingMembers: "All existing members",
    allExistingMembersCount: "All existing members ({count})",
    notifyPeople: "Notify people",
    notifyOnePerson: "Notify 1 person",
    notifyCountPeople: "Notify {count} people",
    emailAddresses: "Email addresses",
    emailPlaceholder: "jsdoe@example.com",
    inviteeReasonSelf: "(you)",
    inviteeReasonMemberWithoutAccess: "(role can't use the gateway)",
    externalInviteeSubjectOne: "1 person isn't",
    externalInviteeSubjectMany: "{count} people aren't",
    externalInviteeHint:
      "{subject} in the organization yet. They'll be invited to the organization and join with the AI Gateway role.",
    inviteTooMany: "You can invite up to {max} people at once.",
    someInvitationsNotSent: "Some invitations were not sent",

    // Invite outcome
    nobodyNotified:
      "Nobody was notified: the addresses you entered get no email.",
    teamNotified: "Team notified",
    teamNotifiedWithInvites:
      "New people can create gateway keys once they join the organization.",
    teamNotifiedMembersOnly: "Members can now create their own gateway keys.",

    // Setup guide steps
    addProviderCredentialTitle: "Add a provider credential",
    addProviderCredentialDescription:
      "Connect {providers} with an API key. Available models are loaded from the provider.",
    credentialAddedFor: "{provider} credential added",
    howCredentialsWork: "How provider credentials work",
    addCredential: "Add credential",
    teamInviteStepTitle: "Notify your team",

    // Connection name validation
    connectionNameDuplicate:
      "A provider credential with this name already exists.",
    connectionNameRequired: "Enter a credential name.",
    connectionNameTooLong: "Credential names can be at most {max} characters.",
    connectionNameInvalid:
      "Use only letters, numbers, hyphens, and underscores, starting with a letter or number.",
    connectionNameReserved: '"ft" is reserved for OpenAI fine-tuned model IDs.',

    // Load errors
    loadErrorSetup: "Gateway setup could not be loaded",
    loadErrorSetupDesc: "Retry the request to continue setting up the gateway.",
    loadErrorProviders: "Providers could not be loaded",
    loadErrorProvidersDesc: "Retry to see the gateway providers.",
    loadErrorConnection: "Provider credential could not be loaded",
    loadErrorConnectionDesc:
      "Retry to manage model access for this credential.",
    loadErrorModels: "Provider models could not be loaded",
    loadErrorModelsDesc: "Retry to load the models of this provider.",

    // Connection filter
    connectionFilterAria: "Provider",
    connectionFilterPlaceholder: "Select a provider",

    // Setup instructions
    setupInstructionsTitle: "Usage instructions",
    setupInstructionsDescription:
      "Call the gateway from your code or connect an AI tool to it. Each tab has the steps for one tool.",
    howToCallApi: "How to call the gateway API",
    howToConnect: "How to connect {label}",
    setupInstructionsAria: "Setup instructions",
    copyForAgent: "Copy for agent",
    copied: "Copied",
    showAllSteps: "Show all steps",
    hideKey: "Hide key",
    showKey: "Show key",
    copyKey: "Copy key",
    connectToGateway: "Connect to the AI Gateway",

    // Agent setup steps
    replaceKeyHint: "Replace {key} with your gateway key.",
    setupInstructionsLoadError: "Setup instructions could not be loaded",
    setupInstructionsLoadErrorDesc:
      "Your key works. Follow the docs to connect your tools.",

    // Connection name error for live validation
    modelListingDeniedTitle: "Models can't be listed",
    modelListingDeniedDescription:
      "This key may call models but can't list all of them, so some models may be missing here. Grant bedrock:ListFoundationModels and bedrock:ListInferenceProfiles to list all models.",

    // Gateway not set up (inline in analytics)
    gatewayNotSetUpDesc:
      "An admin or owner of {org} needs to connect a provider before you can create a gateway key. Ask them to set it up.",

    // Metric descriptions (with limit param)
    topLimitUsersByCost: "Top {limit} users by cost; service keys are excluded",
    topLimitUsersByRequests:
      "Top {limit} users by requests; service keys are excluded",
    topLimitKeysByCost: "Top {limit} gateway keys by cost",
    topLimitModelsByCost: "Top {limit} models by cost",

    // Generated key
    generatedKeyNotice: "Copy the key now. It is shown only once.",

    // Model routes
    routeMessages: "Messages",
    routeCompletions: "Completions",
    routeResponses: "Responses",

    // Traffic sources
    sourceClaudeCode: "Claude Code",
    sourceCodex: "Codex",
    sourceOpenCode: "OpenCode",
    sourceYourApps: "Your apps",
  },
  "zh-CN": {
    // Page titles
    overview: "概览",
    providersAndModels: "提供商与模型",
    gatewayKeys: "网关密钥",
    helpDescriptionManager:
      "通过 AI 网关发出的请求的成本和用量，从网关的摄取项目读取。",
    helpDescriptionMember: "通过 AI 网关发出的请求的成本和用量。",
    setupRequiredReason: "请先在概览页完成网关设置。",

    // GatewayPage
    pageTitle: "AI 网关",

    // Model tabs
    providersTab: "提供商",
    modelsTab: "模型",

    // Common actions
    retry: "重试",
    dismiss: "忽略",
    done: "完成",
    save: "保存",
    create: "创建",
    close: "关闭",
    continue: "继续",
    back: "返回",
    add: "添加",
    remove: "移除",
    edit: "编辑",
    delete: "删除",
    cancel: "取消",
    confirm: "确认",

    // Overview / Setup hero
    setupHeroTitle: "设置 Langfuse AI 网关",
    setupHeroLead:
      "将 Claude Code、Codex、OpenCode 和你自己的应用通过 Langfuse 路由。每次调用都会成为完整的追踪，包括发起人及其成本。",
    setupHeroDocsLink: "如何设置网关",
    connectedProviders: "已连接的提供商：{names}。",
    noProvidersConnected: "尚未连接任何提供商。",

    // Ingestion
    ingestionSettings: "摄取设置",
    gatewayIngestion: "网关摄取",
    ingestionSaved: "摄取设置已保存",
    ingestionSavedDescription: "新的网关请求将使用这些设置。",
    ingestionDialogDescription: "选择 Langfuse 对通过网关的请求记录哪些内容。",
    ingestionDocsLink: "摄取模式的工作原理",
    ingestionSetupButton: "设置摄取",
    ingestionModeLabel: "摄取：{mode}",
    chooseIngestionTitle: "选择网关流量的记录方式",
    ingestionChangeLater: "你可以稍后更改此设置。",
    ingestionModeFull: "完整",
    ingestionModeFullDesc: "捕获完整的请求和响应负载以进行追踪。",
    ingestionModeUsage: "用量",
    ingestionModeUsageDesc: "捕获模型、令牌用量、成本和延迟。",
    ingestionModeNone: "无",
    ingestionModeNoneDesc: "路由请求而不在 Langfuse 中捕获任何内容。",
    recordInNewProject: "记录到",
    recordInExistingProject: "记录到",
    newProjectLabel: "新建",
    existingProjectLabel: "已有",
    projectNamed: "项目名称为",
    projectLabel: "项目",
    noProjectsYet: "此组织尚无项目。",
    selectProject: "选择项目",
    searchProjects: "搜索项目",
    newOrExistingProject: "新建或已有项目",
    projectName: "项目名称",
    ingestionProject: "摄取项目",
    notRecordingTraffic: "未记录网关流量",
    recordingUsageOnly: "仅记录用量",
    recordingFull: "记录完整请求和响应",
    recordingInProject: '{summary}，项目"{name}"',
    projectAccessAlertTitle: "所有拥有项目访问权限的成员均可见网关流量",
    projectAccessAlertDescription:
      "任何可以打开摄取项目的人，包括通过组织角色拥有访问权限的每个组织成员和查看者，都可以看到网关请求、成本和网关密钥所有者{extra}。请使用专用项目并限制可访问的人员。",
    projectAccessAlertFullExtra: "，以及完整的提示词和响应",

    // Provider credential dialog
    addProviderCredential: "添加提供商凭据",
    editProviderCredential: "编辑提供商凭据",
    providerLabel: "提供商",
    providerDescription: "此凭据的网关请求发送到哪里。",
    providerFixedDescription: "保存后不可更改。",
    credentialNameLabel: "名称",
    credentialNameDescription: "用作调用模型时的前缀，例如 {example}。",
    credentialNamePlaceholder: "生产环境",
    credentialKeyLabel: "{provider} API 密钥",
    credentialKeyDescriptionOpenai: "在 OpenAI 平台的 API keys 中创建一个。",
    credentialKeyDescriptionAnthropic:
      "在 Claude Console 的 API keys 中创建一个。",
    credentialKeyDescriptionBedrock:
      "Amazon Bedrock API 密钥。该密钥需要访问所选区域。",
    credentialKeyPlaceholder: "输入 {provider} API 密钥",
    credentialKeyPlaceholderSaved: "留空以保留当前密钥",
    awsRegionLabel: "AWS 区域",
    awsRegionDescription: "请求将发送到此区域的 Bedrock。保存后不可更改。",
    searchRegions: "搜索区域",
    selectRegion: "选择区域",
    noMatchingRegion: "没有匹配的区域",
    hipaaRegionTitle: "HIPAA 区域",
    hipaaRegionDescription:
      "请求将使用你的凭据并根据你的指示转发到你配置的提供商。在发送受保护健康信息之前，请确保与该提供商签署了 BAA。",
    testButton: "测试",
    testAndSaveButton: "测试并保存",
    credentialValidTitle: "提供商凭据有效",
    credentialValidDescription: "未保存任何更改。",
    credentialValidationError: "凭据验证失败",
    credentialSaveError: "提供商凭据无法保存",
    credentialSaveErrorDescription: "凭据无法保存或验证。请检查密钥后重试。",
    modelListingDeniedToast: "提供商凭据已保存，但无法列出其模型",
    renameWarningTitle: "重命名将更改模型标识",
    renameWarningDescription: "使用旧连接名称的模型标识的请求将无法解析。",

    // Advanced settings
    showAdvancedSettings: "显示高级设置",
    hideAdvancedSettings: "隐藏高级设置",
    apiBaseUrlLabel: "API 基础 URL",
    apiBaseUrlDescription: "留空以使用默认基础 URL。{extra}{default}",
    apiBaseUrlChangeWarning: "更改后需要新的密钥。",
    apiBaseUrlDefaultOpenai: "OpenAI 默认：https://api.openai.com/v1",
    apiBaseUrlDefaultAnthropic:
      "Anthropic 默认：https://api.anthropic.com（不包括 /v1/messages）",
    apiBaseUrlPlaceholder: "默认",
    extraHeadersLabel: "额外标头",
    extraHeadersDescription:
      "每次向提供商发送请求时发送的可选 HTTP 标头。标头值已加密存储。",
    addHeader: "添加标头",
    headerName: "标头名称",
    headerValue: "标头值",
    removeHeader: "移除标头",

    // Models page / Provider cards
    noProvidersYet: "暂无提供商",
    noProvidersManagerDescription:
      "添加 {providers} 凭据，以便网关可以路由请求并发现模型。",
    noProvidersMemberDescription:
      "请你的组织管理员添加提供商，以便网关可以路由请求。",
    addProvider: "添加提供商",
    connectProvider: "连接",
    howToSetupGateway: "如何设置网关",
    aboutGatewayModels: "关于网关模型",
    moreSoon: "即将推出",
    addProviderLabel: "+ 添加",
    providerCredentialLabel: "凭据",
    modelsLabel: "模型",
    viewModels: "查看模型",
    credentialRejected: "凭据被拒绝",
    loadingEllipsis: "加载中…",
    allModelsEnabled: "已启用所有模型",
    modelsEnabledCount: "已启用 {count} 个",
    modelsEnabledOfTotal: "已启用 {enabled}/{total} 个",
    refreshModels: "刷新模型",
    refreshModelsFor: "刷新 {name} 的模型",
    editCredential: "编辑凭据",
    editFor: "编辑 {name}",
    deleteCredential: "删除凭据",
    deleteFor: "删除 {name}",
    deleteProviderTitle: "删除提供商凭据",
    deleteProviderText: '删除"{name}"？请求将立即停止使用它。',
    deleteCredentialConfirm: "删除凭据",
    loadMore: "加载更多",
    setupGuideDescription:
      "连接提供商凭据并选择如何在 Langfuse 中记录网关流量。",
    providersPageDescription: "你的组织通过其路由网关请求的提供商。",

    // Models table
    modelColumn: "模型",
    routesColumn: "路由",
    enabledColumn: "已启用",
    enableAll: "全部启用",
    disableAll: "全部禁用",
    enableAction: "启用",
    disableAction: "禁用",
    noModelsMatch: "没有与当前搜索匹配的模型。",
    customBadge: "自定义",
    removeModel: "移除 {model}",
    enableModel: "启用 {model}",
    disableModel: "禁用 {model}",
    refreshFromProvider: "从提供商刷新模型",
    modelsLoadError: "模型无法加载",
    modelsLoadErrorDescription:
      "提供商返回了模型发现错误。请在更改模型访问权限之前刷新提供商。",
    loadingModels: "加载模型",

    // Add custom model
    addCustomModel: "添加自定义模型",
    addModel: "添加模型",
    addModelDescription:
      "添加提供商未列出的模型，例如微调模型或推理配置文件。启用后，网关密钥即可调用它。",
    modelIdLabel: "模型 ID",
    modelIdPlaceholder: "例如 ft:gpt-4o-mini:my-org::abc123",
    modelIdRequired: "请输入模型 ID。",
    modelAlreadyListed: "该模型已在列表中。",
    testBeforeAdd: "请先发送成功的测试请求。",
    testModelWithCredential: "使用当前凭据测试此模型",
    modelNotTested: "此模型尚未使用你的凭据进行测试。",
    testAgain: "再次测试",
    sendTestRequest: "发送测试请求",
    requestAccepted: "请求已接受",
    requestAcceptedDescription:
      "提供商在 {duration}ms 内响应。此模型已准备好添加。",
    requestFailed: "请求失败",
    requestFailedWithStatus: "请求失败 — {status}",

    // API keys page
    gatewayKeysDescriptionManager:
      "网关密钥仅用于验证对 AI 网关的请求。用户密钥在其所有者离开组织时会被撤销；服务账户密钥将继续有效。",
    gatewayKeysDescriptionMember:
      "你的网关密钥仅用于验证对 AI 网关的请求。当你离开组织或失去网关访问权限时，它们将被撤销。",
    howGatewayKeysWork: "网关密钥的工作原理",
    createKey: "创建密钥",
    notifyTeam: "通知团队",
    usageInstructions: "使用说明",

    // Create key dialog
    createGatewayKeyTitle: "创建网关密钥",
    gatewayKeyCreatedTitle: "网关密钥已创建",
    createKeyButton: "创建密钥",
    issuedAsLabel: "签发为",
    issuedAsUser: "我的用户",
    issuedAsServiceAccount: "服务账户",
    issuedAsUserDescription: "离开组织后将停止工作。",
    issuedAsServiceAccountDescription: "人员离开组织后将继续有效。",
    nameFieldLabel: "名称",
    nameFieldPlaceholder: "例如 claude-local、codex-local 或 backend-service",
    nameFieldTooltip: "显示在密钥列表中。用于描述此密钥的用途。",
    metadataLabel: "元数据",
    metadataOptional: "（可选）",
    metadataSetCount: " · 已设置 {count} 个",
    metadataTooltipLabel: "关于网关密钥元数据",
    metadataTooltip: "附加到此密钥的每个追踪上，以便进行筛选和分组。",
    metadataKeyPlaceholder: "键",
    metadataValuePlaceholder: "值",
    metadataKeyAria: "元数据键",
    metadataValueAria: "元数据值",
    removeMetadataField: "移除此元数据字段",
    addMetadata: "添加元数据",
    gatewayKeyCreateError: "网关密钥无法创建",
    gatewayKeyCreateErrorDescription: "请检查元数据后重试。",

    // API keys table
    tableCreated: "创建时间",
    tableName: "名称",
    tableKey: "密钥",
    tableUser: "用户",
    tableExpiration: "过期时间",
    tableLastUsed: "最后使用",
    tableMetadata: "元数据",
    noExpiration: "无过期时间",
    expiredOn: "过期于 ",
    serviceAccount: "服务账户",
    notUsedInDays: "{days}天内未使用",
    unavailable: "不可用",
    revokeKey: "撤销密钥",
    revokeGatewayKeyTitle: "撤销网关密钥",
    revokeGatewayKeyText: "使用此密钥的请求将立即被拒绝。此操作无法撤销。",
    confirmRevokeKey: "撤销密钥",
    searchByNameOrUser: "按名称或用户搜索",
    noKeysMatchSearch: "没有与当前搜索匹配的网关密钥。",
    noKeysCreated: "尚未创建网关密钥。",

    // API keys empty state
    noGatewayKeysYet: "尚无网关密钥",
    noGatewayKeysDescription:
      "创建网关密钥，以便从 Claude Code、Codex 或你自己的代码发送请求通过 AI 网关。",
    userKeyTitle: "用户密钥",
    userKeyDescription: "绑定到一个成员。他们离开组织时会被撤销。",
    serviceAccountKeyTitle: "服务账户密钥",
    serviceAccountKeyDescription: "用于应用程序和管道。人员离开后继续有效。",
    yourOwnCode: "你自己的代码",

    // First key placeholder
    createYourGatewayKey: "创建你的网关密钥",
    createKeyForOrg:
      "你的管理员已为 {org} 设置了 AI 网关。创建一个个人密钥，以便从 Claude Code、Codex 或你自己的代码发送请求。",
    yourOrganizationFallback: "你的组织",
    createMyKey: "创建我的密钥",
    mintNewKey: "随时创建新密钥。",
    oneKeyAllModels: "一个密钥用于 Anthropic 和 OpenAI 模型",
    useSameKeyAcrossProviders: "跨提供商使用同一密钥。",
    seeAvailableModels: "查看可用模型",
    createYourOwnKeys: "创建你自己的密钥",

    // Not set up notice
    notSetUpTitle: "AI 网关尚未设置",
    notSetUpDescription:
      "{org} 的管理员或所有者需要先连接一个提供商，然后你才能创建网关密钥。请让他们设置。",
    learnMoreAboutGateway: "了解更多关于 AI 网关的信息",
    notSetUpLabel: "尚未设置",

    // Not deployed notice
    notDeployedTitle: "AI 网关尚未部署",
    notDeployedDescription:
      "在自托管的 Langfuse 上，AI 网关作为独立服务运行。请将其部署在 Langfuse 实例旁边，以配置提供商凭据、模型和网关密钥。",
    selfHostingGuide: "自托管指南",
    notDeployedLabel: "尚未部署",

    // Analytics
    analyticsNotRecordedTitle: "网关请求未被记录",
    analyticsNotRecordedManager:
      '分析数据来自网关写入其摄取项目的追踪。使用右上角的"摄取"按钮打开用量或完整摄取，即可在此处查看成本和用量。',
    analyticsNotRecordedMember:
      "请你的组织管理员为 AI 网关打开用量或完整摄取，以便在此处查看你的成本和用量。",
    howAnalyticsWorks: "网关分析的工作原理",
    notRecordedLabel: "未记录",
    sendFirstRequest: "发送第一个请求",
    firstRequestDescription:
      "一旦请求通过 AI 网关，成本和用量将显示在这里。添加网关密钥，然后将你的 LLM 客户端指向网关。",
    addGatewayKey: "添加网关密钥",
    readTheDocs: "阅读文档",
    oneKeyEveryProvider: "一个密钥支持所有提供商",
    oneKeyEveryProviderDesc: "使用一个密钥即可访问 Anthropic 和 OpenAI。",
    spendByPersonAndTeam: "按个人和团队追踪支出",
    spendByPersonDesc: "按人员、团队和密钥追踪支出。",
    approvedModelsOnly: "仅限已批准的模型",
    approvedModelsDesc: "为公司整体批准和移除模型。",
    fullTraces: "完整追踪",
    fullTracesDesc: "记录完整追踪，而不仅仅是令牌计数。",

    // Analytics filters
    filterByUser: "用户",
    filterByGatewayKey: "网关密钥",
    searchUsers: "搜索用户",
    searchGatewayKeys: "搜索网关密钥",

    // Unpriced usage alert
    unpricedUsageTitle: "成本不包括未定价的用量",
    unpricedUsageDescription:
      "{requests} 使用了没有价格的模型（{models}），因此成本组件将它们计为 $0。",
    addModelPrices: "添加模型价格",

    // Analytics widget names
    widgetTotalCost: "总成本",
    widgetTotalCostDesc: "所有网关请求的成本",
    widgetRequests: "请求数",
    widgetRequestsDesc: "网关记录的观察数",
    widgetTokens: "令牌数",
    widgetTokensDesc: "输入和输出令牌数",
    widgetCostOverTime: "成本趋势",
    widgetCostOverTimeDesc: "所有网关请求随时间的成本变化",
    widgetCostByUser: "按用户统计成本",
    widgetCostByUserDesc: "按成本排名的前 {limit} 位用户（不含服务密钥）",
    widgetRequestsPerUser: "每用户请求数",
    widgetRequestsPerUserDesc:
      "按请求数排名的前 {limit} 位用户（不含服务密钥）",
    widgetCostByKey: "按网关密钥统计成本",
    widgetCostByKeyDesc: "按成本排名的前 {limit} 个网关密钥",
    widgetCostByModel: "按模型统计成本",
    widgetCostByModelDesc: "按成本排名的前 {limit} 个模型",

    // Launch banner
    launchBannerGetKey: "获取网关密钥",
    launchBannerLearnMore: "了解更多",
    launchBannerSetup: "设置",
    launchBannerTitle: "AI 网关",
    launchBannerDescription:
      "通过在 2 分钟内安装 Langfuse AI 网关来追踪和监控你的 AI 用量。",

    // Launch dialog
    launchDialogAdminTitle: "引入 Langfuse AI 网关",
    launchDialogAdminLead:
      "将 Claude Code、Codex、OpenCode 和你自己的应用通过 Langfuse 路由。每次调用都会成为完整的追踪，包括发起人及其成本。",
    launchDialogAdminPoint1: "一个密钥用于 Anthropic 和 OpenAI",
    launchDialogAdminPoint2: "按人员、团队和密钥追踪支出",
    launchDialogAdminPoint3: "为公司整体批准和移除模型",
    launchDialogAdminPoint4: "记录完整追踪，而不仅仅是令牌计数",
    launchDialogMemberTitle: "获取你自己的 AI 网关密钥",
    launchDialogMemberLead:
      "使用你自行创建的单一密钥访问 Anthropic 和 OpenAI 模型。",
    launchDialogMemberPoint1: "创建你自己的密钥",
    launchDialogMemberPoint2: "一个密钥用于 Anthropic 和 OpenAI 模型",
    selectOrganization: "选择组织",
    setUpGateway: "设置网关",
    getGatewayKey: "获取网关密钥",
    askAdminToSetup: "请你的管理员设置。",
    learnMore: "了解更多",

    // Team invite
    notifyYourTeam: "通知你的团队",
    notifyTeamDescription:
      "成员可以创建自己的网关密钥并使用你启用的模型。新成员将以 AI 网关角色加入。",
    aboutRoles: "关于角色",
    notificationsNotSent: "通知无法发送",
    skipForNow: "暂时跳过",
    allExistingMembers: "所有现有成员",
    allExistingMembersCount: "所有现有成员（{count}）",
    notifyPeople: "通知人员",
    notifyOnePerson: "通知 1 人",
    notifyCountPeople: "通知 {count} 人",
    emailAddresses: "电子邮件地址",
    emailPlaceholder: "jsdoe@example.com",
    inviteeReasonSelf: "（你）",
    inviteeReasonMemberWithoutAccess: "（角色无法使用网关）",
    externalInviteeSubjectOne: "1 人不在",
    externalInviteeSubjectMany: "{count} 人不在",
    externalInviteeHint:
      "{subject}组织中。他们将被邀请加入组织并以 AI 网关角色加入。",
    inviteTooMany: "你一次最多可邀请 {max} 人。",
    someInvitationsNotSent: "部分邀请未发送",

    // Invite outcome
    nobodyNotified: "无人收到通知：你输入的地址不会收到邮件。",
    teamNotified: "团队已通知",
    teamNotifiedWithInvites: "新成员加入组织后可以创建网关密钥。",
    teamNotifiedMembersOnly: "成员现在可以创建自己的网关密钥。",

    // Setup guide steps
    addProviderCredentialTitle: "添加提供商凭据",
    addProviderCredentialDescription:
      "使用 API 密钥连接 {providers}。可用模型将从提供商加载。",
    credentialAddedFor: "{provider} 凭据已添加",
    howCredentialsWork: "提供商凭据的工作原理",
    addCredential: "添加凭据",
    teamInviteStepTitle: "通知你的团队",

    // Connection name validation
    connectionNameDuplicate: "已存在同名提供商凭据。",
    connectionNameRequired: "请输入凭据名称。",
    connectionNameTooLong: "凭据名称最多 {max} 个字符。",
    connectionNameInvalid:
      "仅使用字母、数字、连字符和下划线，以字母或数字开头。",
    connectionNameReserved: '"ft" 保留用于 OpenAI 微调模型 ID。',

    // Load errors
    loadErrorSetup: "网关设置无法加载",
    loadErrorSetupDesc: "重试请求以继续设置网关。",
    loadErrorProviders: "提供商无法加载",
    loadErrorProvidersDesc: "重试以查看网关提供商。",
    loadErrorConnection: "提供商凭据无法加载",
    loadErrorConnectionDesc: "重试以管理此凭据的模型访问权限。",
    loadErrorModels: "提供商模型无法加载",
    loadErrorModelsDesc: "重试以加载此提供商的模型。",

    // Connection filter
    connectionFilterAria: "提供商",
    connectionFilterPlaceholder: "选择提供商",

    // Setup instructions
    setupInstructionsTitle: "使用说明",
    setupInstructionsDescription:
      "从你的代码调用网关或连接 AI 工具。每个标签页包含一个工具的操作步骤。",
    howToCallApi: "如何调用网关 API",
    howToConnect: "如何连接 {label}",
    setupInstructionsAria: "设置说明",
    copyForAgent: "为 Agent 复制",
    copied: "已复制",
    showAllSteps: "显示所有步骤",
    hideKey: "隐藏密钥",
    showKey: "显示密钥",
    copyKey: "复制密钥",
    connectToGateway: "连接到 AI 网关",

    // Agent setup steps
    replaceKeyHint: "将 {key} 替换为你的网关密钥。",
    setupInstructionsLoadError: "设置说明无法加载",
    setupInstructionsLoadErrorDesc: "你的密钥可用。请按照文档连接你的工具。",

    // Model listing denied
    modelListingDeniedTitle: "无法列出模型",
    modelListingDeniedDescription:
      "此密钥可以调用模型但无法列出所有模型，因此此处可能缺少某些模型。请授予 bedrock:ListFoundationModels 和 bedrock:ListInferenceProfiles 权限以列出所有模型。",

    // Gateway not set up inline
    gatewayNotSetUpDesc:
      "{org} 的管理员或所有者需要先连接一个提供商，然后你才能创建网关密钥。请让他们设置。",

    // Metric descriptions
    topLimitUsersByCost: "按成本排名的前 {limit} 位用户（不含服务密钥）",
    topLimitUsersByRequests: "按请求数排名的前 {limit} 位用户（不含服务密钥）",
    topLimitKeysByCost: "按成本排名的前 {limit} 个网关密钥",
    topLimitModelsByCost: "按成本排名的前 {limit} 个模型",

    // Generated key
    generatedKeyNotice: "请立即复制密钥。它仅显示一次。",

    // Model routes
    routeMessages: "消息",
    routeCompletions: "补全",
    routeResponses: "响应",

    // Traffic sources
    sourceClaudeCode: "Claude Code",
    sourceCodex: "Codex",
    sourceOpenCode: "OpenCode",
    sourceYourApps: "你的应用",
  },
} satisfies Messages;
