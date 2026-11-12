import { type Messages } from "../messages";

export const catalogMessages = {
  en: {
    confirm: "Please confirm",
    deletePrompt: "Delete Prompt",
    deletePromptPrefix:
      "This action permanently deletes this prompt. All requests to fetch prompt",
    deletePromptSuffix: "will error.",
    error: "Error:",
    deleteDataset: "Delete dataset",
    deleteDatasetWarning:
      "This action cannot be undone and removes all the data associated with this dataset.",

    prompts: "Prompts",
    datasets: "Datasets",
    createNewPrompt: "Create new prompt",
    newPromptHelp:
      "Manage and version your prompts in Langfuse. Edit and update them via the UI and SDK. Retrieve the production version via the SDKs. Learn more in the docs.",
    promptImmutable:
      "Prompts are immutable in Langfuse. To update a prompt, create a new version.",
    exportFailed: "Failed to export prompts. Please try again.",
    promptHelp:
      "Manage and version your prompts in Langfuse. Edit and update them via the UI and SDK. Retrieve the production version via the SDKs. Learn more in the docs.",
    datasetHelp:
      "Datasets in Langfuse are a collection of inputs (and expected outputs) of an LLM application. They are used to benchmark new releases before deployment to production. See docs to learn more.",
    latestVersion: "Latest version per prompt",
    allVersions: "All versions",
    exporting: "Exporting…",
    export: "Export",
    import: "Import",
    newPrompt: "New prompt",
    newDataset: "New dataset",
    name: "Name",
    versions: "Versions",
    type: "Type",
    latestVersionCreated: "Latest Version Created At",
    observations7d: "Number of Observations (7d)",
    tags: "Tags",
    actions: "Actions",
    description: "Description",
    items: "Items",
    experiments: "Experiments",
    created: "Created",
    lastRun: "Last Run",
    inputSchema: "Input Schema",
    expectedOutputSchema: "Expected Output Schema",
    metadata: "Metadata",
    edit: "Edit",
    delete: "Delete",
    datasetsDeleted: "Datasets deleted",
    deleteDescription:
      "Selected datasets will be deleted. Associated run items and media links are cleaned up asynchronously.",
    deleteWarning:
      "This action cannot be undone. Selected folders delete all datasets contained in them.",
  },
  "zh-CN": {
    confirm: "请确认",
    deletePrompt: "删除提示词",
    deletePromptPrefix: "此操作将永久删除此提示词。之后所有获取提示词",
    deletePromptSuffix: "的请求都将报错。",
    error: "错误：",
    deleteDataset: "删除数据集",
    deleteDatasetWarning: "此操作无法撤销，将删除与此数据集关联的所有数据。",

    prompts: "提示词",
    datasets: "数据集",
    createNewPrompt: "新建提示词",
    newPromptHelp:
      "在 Langfuse 中管理提示词及其版本，通过界面或 SDK 编辑更新，并通过 SDK 获取生产版本。请参阅文档了解更多。",
    promptImmutable:
      "提示词在 Langfuse 中是不可变的。如需更新提示词，请新建一个版本。",
    exportFailed: "导出提示词失败，请重试。",
    promptHelp:
      "在 Langfuse 中管理提示词及其版本，通过界面或 SDK 编辑更新，并通过 SDK 获取生产版本。请参阅文档了解更多。",
    datasetHelp:
      "Langfuse 数据集是大模型应用输入（及预期输出）的集合，用于在新版本部署到生产环境之前进行基准测试。请参阅文档了解更多。",
    latestVersion: "每个提示词的最新版本",
    allVersions: "所有版本",
    exporting: "正在导出…",
    export: "导出",
    import: "导入",
    newPrompt: "新建提示词",
    newDataset: "新建数据集",
    name: "名称",
    versions: "版本",
    type: "类型",
    latestVersionCreated: "最新版本创建时间",
    observations7d: "观察数（7 天）",
    tags: "标签",
    actions: "操作",
    description: "描述",
    items: "条目",
    experiments: "实验",
    created: "创建时间",
    lastRun: "上次运行",
    inputSchema: "输入 Schema",
    expectedOutputSchema: "预期输出 Schema",
    metadata: "元数据",
    edit: "编辑",
    delete: "删除",
    datasetsDeleted: "数据集已删除",
    deleteDescription:
      "所选数据集将被删除，关联的运行条目和媒体链接将异步清理。",
    deleteWarning: "此操作无法撤销，删除所选文件夹将同时删除其中的所有数据集。",
  },
} satisfies Messages;
