import { type Messages } from "../messages";

export const accountMessages = {
  en: {
    // Project settings: data retention
    dataRetention: "Data Retention",
    dataRetentionHelp:
      "Data retention automatically deletes events older than the specified number of days. The value must be 0 or at least 3 days. Set to 0 to retain data indefinitely. The deletion happens asynchronously, i.e. event may be available for a while after they expired.",
    retentionWillChange:
      "Your Project's retention will be set from {from} to {to} days.",
    retainsDataIndefinitely: "Your Project retains data indefinitely.",
    currentRetentionDays: "Your Project's current retention is {n} days.",
    indefiniteRetention: "Indefinite",
    noAccess: "No access",
    save: "Save",

    // Organization settings: AI features switch
    aiFeatures: "AI Features",
    enableAiFeaturesHeading: "Enable AI powered features for your organization",
    aiFeaturesCloudHelp:
      "This setting applies to all users and projects. Any data {emphasis} be sent to AWS Bedrock within the Langfuse data region. Your data will not be used to train models. Applicable HIPAA, SOC2, GDPR, and ISO 27001 compliance remains intact.",
    aiFeaturesCloudHelpDocs: "More details in the docs here.",
    aiFeaturesSelfHostedHelp:
      "This setting applies to all users and projects. When enabled, Halo can send relevant project data to the model provider configured by your instance administrator.",
    aiDataUseHeading: "AI Data Use for Product/Service Improvement",
    aiDataUseBody:
      "Share data about your use of AI with Langfuse for product and service improvement.",
    confirmAiFeaturesChange: "Confirm AI Features Change",
    confirmAiFeaturesBody:
      "You are about to {action} AI features for your organization. When enabled, relevant data can be sent {destination} for processing.",
    proceedConfirm: "Are you sure you want to proceed?",
    learnMoreAiFeatures: "Learn more in the docs.",

    // Organization settings: delete organization dialog
    deleteOrganizationDialogTitle: "Delete Organization",
    deleteOrganizationDialogLabel: "Delete Organization",
    deleteOrgHasProjectsHelp:
      "You can only delete an organization if it has no projects associated with it. Please delete or transfer all projects first. Deleting projects may take a few minutes.",

    // Organization settings: delete organization controller toasts
    organizationDeleted: "Organization Deleted",
    organizationDeletedHelp: "The organization has been successfully deleted.",
    deleteOrgNotAllowed:
      "You don't have permission to delete this organization.",

    // Organization settings: AI features disabled notice
    aiFeaturesDisabledHelp:
      "Ask your organization administrator to enable AI features in organization settings.",
    enableAiFeaturesButton: "Enable in Organization Settings",

    // Confirm input helpers (shared with settings namespace wording)
    confirmInput: 'To confirm, type "{value}" in the input box',
    confirmValue: 'Please confirm with "{value}"',

    // Organization name validation messages
    orgNameShort: "Must have at least 3 characters",
    orgNameLong: "Must have at most 60 characters",
  },
  "zh-CN": {
    // Project settings: data retention
    dataRetention: "数据保留",
    dataRetentionHelp:
      "数据保留会自动删除早于指定天数的事件。取值必须为 0 或至少 3 天。设为 0 表示永久保留数据。删除是异步进行的，即事件可能在过期后仍可用一段时间。",
    retentionWillChange: "你的项目保留期将从“{from}”更改为“{to}”天。",
    retainsDataIndefinitely: "你的项目永久保留数据。",
    currentRetentionDays: "你的项目当前保留期为“{n}”天。",
    indefiniteRetention: "永久保留",
    noAccess: "无访问权限",
    save: "保存",

    // Organization settings: AI features switch
    aiFeatures: "AI 功能",
    enableAiFeaturesHeading: "为你的组织启用 AI 功能",
    aiFeaturesCloudHelp:
      "此设置适用于所有用户和项目。任何数据{emphasis}被发送到你的 Langfuse 数据区域内 AWS Bedrock。你的数据不会被用于训练模型。适用 HIPAA、SOC2、GDPR 和 ISO 27001 合规要求。",
    aiFeaturesCloudHelpDocs: "在文档中了解更多。",
    aiFeaturesSelfHostedHelp:
      "此设置适用于所有用户和项目。启用后，Halo 可将相关项目数据发送到由你的实例管理员配置的模型提供商。",
    aiDataUseHeading: "AI 数据用于产品/服务改进",
    aiDataUseBody: "分享你使用 AI 的数据，帮助 Langfuse 改进产品和服务。",
    confirmAiFeaturesChange: "确认 AI 功能变更",
    confirmAiFeaturesBody:
      "你即将{action}你的组织的 AI 功能。启用后，相关数据将被发送{destination}进行处理。",
    proceedConfirm: "你确定要继续吗？",
    learnMoreAiFeatures: "在文档中了解更多。",

    // Organization settings: delete organization dialog
    deleteOrganizationDialogTitle: "删除组织",
    deleteOrganizationDialogLabel: "删除组织",
    deleteOrgHasProjectsHelp:
      "只有当组织中没有项目时，才能删除组织。请先删除或转移所有项目。删除项目可能需要几分钟。",

    // Organization settings: delete organization controller toasts
    organizationDeleted: "组织已删除",
    organizationDeletedHelp: "组织已成功删除。",
    deleteOrgNotAllowed: "你没有权限删除此组织。",

    // Organization settings: AI features disabled notice
    aiFeaturesDisabledHelp: "请联系你的组织管理员在组织设置中启用 AI 功能。",
    enableAiFeaturesButton: "在组织设置中启用",

    // Confirm input helpers (shared with settings namespace wording)
    confirmInput: "请在输入框中输入“{value}”以确认",
    confirmValue: "请输入“{value}”以确认",

    // Organization name validation messages
    orgNameShort: "至少需要 3 个字符",
    orgNameLong: "最多包含 60 个字符",
  },
} satisfies Messages;
