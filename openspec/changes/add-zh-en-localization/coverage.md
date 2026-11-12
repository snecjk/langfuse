# Localization coverage matrix

This change (add-zh-en-localization) migrates the first-party product UI to a
bilingual (简体中文 / English) interface. The interface language is independent of
the URL; no language path prefix is added. Default is `zh-CN`; the choice is a
per-browser cookie (`langfuse-ui-locale`).

## How to read this matrix

Each row is a **route or non-route entry**, mapped to its **actual rendering
owner** (the component that renders the visible chrome), the **role/toggle gate**
that controls reachability, the **sub-flows and states that actually exist**, the
**translation namespace** it draws from, its **source-migration status**, its
**verification status**, and any **exception rationale** for content that stays
English on purpose.

Status vocabularies (kept separate, never merged into one "done" flag):

- **Source migration:** `未迁移` (not migrated) / `部分迁移` (partial) /
  `源码完成` (source complete). A module is not `源码完成` until every listed
  entry/state is migrated.
- **Verification:** `未验证` (unverified) / `已验证` (verified) / `不适用`
  (not applicable — only when the component truly has no such state; missing
  permission/service/browser is `未验证`, not `不适用`).

Exceptions use one of: `品牌` (brand/proper name), `机器标识` (model/API/DB/enum/
machine export), `用户数据` (user content entered at runtime), `代码示例`
(SDK/code samples), `服务端原文` (server raw diagnostic kept as-is).

## Historical record (preserved)

The earlier partial checkpoint (below the matrix) is kept verbatim as the record
of what was verified at that point in time. It is a snapshot, not a completion
claim. The matrix supersedes it for current status.

## Legend for role/toggle gates

- `公开` public (no auth) · `已登录` any authenticated user · `RBAC:<scope>`
  requires the named scope · `ENT:<entitlement>` requires the entitlement ·
  `FLAG:<flag>` requires the feature flag · `INTERNAL` internal-feature badge.

---

## A. Public / authentication / workspace

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| A1 | `/auth/sign-in` | `features/auth/SignInPage` | 公开 | 表单、错误、captcha、provider 按钮、注册/重置链接、语言选择器 | `auth`, `auth-forms`, `metadata` | 部分迁移 | 未验证 | — |
| A2 | `/auth/sign-up` | `features/auth/SignUpPage` | 公开 | 表单、验证、错误、条款、语言选择器 | `auth`, `auth-forms`, `metadata` | 部分迁移 | 部分验证（SignUpPage.clienttest 覆盖中/英切换） | — |
| A3 | `/auth/reset-password` | `auth-credentials/ResetPasswordPage` | 公开 | 请求邮件、成功/失败、captcha | `auth-forms` | 部分迁移 | 部分验证（clienttest 存在） | — |
| A4 | `/auth/setup-password` | `auth-credentials` setup 页 | 公开（邀请/重置 token） | 设置密码、校验、错误 | `auth-forms` | 部分迁移 | 未验证 | — |
| A5 | `/auth/error` | AuthErrorPage | 公开 | 各身份错误状态、重试、联系支持 | — | 未迁移 | 未验证 | 服务端原文（原始诊断保留） |
| A6 | `/auth/enterprise-sso-required` | enterprise SSO 页 | 公开 | 必需/启动说明、域名校验、跳转 | — | 未迁移 | 未验证 | — |
| A7 | `/auth/sso-initiate` | SSO 启动流程 | 公开 | 跳转中/失败 | — | 未迁移 | 未验证 | 服务端原文 |
| A8 | `/auth/hf-spaces` | Hugging Face 专用页 | 公开 | 空间校验、错误、跳转 | — | 未迁移 | 未验证 | — |
| A9 | `/` (index) | `pages/index` → 组织/项目选择 | 已登录 | 无组织/无项目空态、创建、跳转 | `workspace`, `navigation` | 部分迁移 | 未验证 | — |
| A10 | `/organization/[organizationId]` | `OrganizationSettingsPage` / 组织首页 | 已登录（org 成员） | 项目列表、创建、设置入口 | `workspace`, `settings`, `navigation` | 部分迁移 | 未验证 | — |
| A11 | `/organization/[organizationId]/setup` | org setup 向导 | 已登录（org admin） | 创建项目引导、跳过、完成 | — | 未迁移 | 未验证 | — |
| A12 | `/project/[projectId]/setup` | project setup 向导 | 已登录（project 成员） | 引导步骤、跳过、完成、无数据 | — | 未迁移 | 未验证 | — |
| A13 | `/onboarding` | `features/onboarding`, `components/onboarding` | 已登录 | 引导步骤、示例数据 | — | 未迁移 | 未验证 | — |
| A14 | `/demo/[[...path]]` | demo 路由 | 公开/已登录 | 演示数据浏览 | — | 未迁移 | 未验证 | 用户数据（演示追踪内容不翻译） |
| A15 | `/public/traces/[traceId]` | 公共追踪分享页 | 公开（分享 token） | 追踪查看、JSON | — | 未迁移 | 未验证 | 用户数据（追踪内容不翻译） |
| A16 | `/trace/[traceId]` | 旧版追踪直达 | 公开/已登录 | 追踪查看 | — | 未迁移 | 未验证 | 用户数据 |

## B. Navigation, command menu, notifications, common chrome

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| B1 | 侧栏主导航（全路由） | `layouts/routes.tsx`, `AppSidebar`, `NavMain` | 已登录 | 路由/分组、折叠/展开、账户菜单、区域菜单、升级/支持 | `navigation` | 部分迁移 | 未验证 | — |
| B2 | 命令菜单 (⌘K) | `command-k-menu` | 已登录 | 搜索、分组、跳转、最近 | — | 未迁移 | 未验证 | — |
| B3 | 全局通知/toast | `features/notifications`, `ErrorNotification`, `SuccessNotification` | 已登录 | 成功/错误/警告、带操作、上报 | — | 未迁移 | 未验证 | 服务端原文（原始错误诊断保留） |
| B4 | 顶部横幅/banner | `top-banner`, `payment-banner`, `preview-deployment-banner`, `cloud-status-notification` | 已登录 | 各横幅文案与操作 | — | 未迁移 | 未验证 | — |
| B5 | 主题/外观切换 | `theming/ThemeToggle` | 已登录 | 明暗/系统 | — | 部分迁移 | 未验证 | — |
| B6 | 通用数据表格 chrome | `components/table/*`, `DataTableToolbar`, `DataTablePagination`, `DataTableRefreshButton`, `DataTableSelectAllBanner`, `DataTableColumnVisibilityFilter`, `DataTableRowHeightSwitch` | 已登录 | 分页、全选、列显示、行高、搜索模式、筛选构建器、刷新、导出、空态 | `table` | 部分迁移 | 部分验证（DataTableToolbar.clienttest 覆盖切换保留草稿/选中） | — |
| B7 | 通用筛选器 | `features/filters`, `search-bar`, `natural-language-filters` | 已登录 | 过滤构建器、搜索栏、AI 过滤、已应用/清除 | — | 未迁移 | 未验证 | — |
| B8 | 通用日期/时间选择器 | `components/date-picker`, `global-time-range` | 已登录 | 预设、相对时间、自定义范围 | — | 未迁移 | 未验证 | — |
| B9 | 通用对话框/表单原语 | `components/design-system/*` (Dialog, Form, PasswordInput, Confirm, Dropzone …) | 已登录 | 按钮、占位符、工具提示、密码显隐、确认/错误/加载、aria | — | 未迁移 | 未验证 | — |

## C. Observability & analytics

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| C1 | `/project/[projectId]` (Home) | 项目首页卡片 | 已登录 | 概览卡片、空态、跳转 | — | 未迁移 | 未验证 | — |
| C2 | `/project/[projectId]/dashboards` | `features/dashboard`, `dashboards/[dashboardId]`, `dashboards/new` | 已登录 | 列表、创建、编辑、详情、空态 | `dashboards` | 部分迁移（仪表盘列表页列头与 toast 已迁移；创建/编辑/详情页未迁移） | 未验证 | — |
| C3 | `/project/[projectId]/widgets` `/widgets/new` `/widgets/[widgetId]` | `features/widgets` | 已登录 | 图表类型、查询/指标配置、预览、错误、删除 | — | 部分迁移（ConnectedDashboardWidgetTable 接入） | 未验证 | 机器标识（指标键） |
| C4 | `/project/[projectId]/traces` | `features/traces/TracesPage`, `TracesTable` | 已登录 | 列表列、筛选、详情跳转 | `tracing`, `table` | 部分迁移 | 部分验证（合并回归） | 用户数据（追踪内容） |
| C5 | `/project/[projectId]/traces/[traceId]` | `TraceDetailView`, `TraceDetailViewHeader`, `TraceDetailTabsBarList`, `ObservationDetailView*`, `TracePanelNavigationHeader` | 已登录 | 详情头、tab、观察面板、Formatted/Raw、JSON 工具栏、动作菜单 | `tracing` | 部分迁移 | 部分验证 | 用户数据（输入/输出/JSON 不翻译） |
| C6 | `/project/[projectId]/observations` `/observations/new` | `tracing-tables/observations/*` | 已登录 | 列表、新建、详情 | `tracing`, `table` | 部分迁移 | 部分验证 | — |
| C7 | `/project/[projectId]/sessions` `/sessions/[sessionId]` | `features/sessions` | 已登录 | 列表、详情、关联追踪、空态 | `sessions` | 部分迁移（列表页标题与列头已迁移；详情页 SessionDetailPage 未迁移） | 未验证 | 用户标识/会话值不翻译 |
| C8 | `/project/[projectId]/users` `/users/[userId]` | `features/users` | 已登录 | 列表、详情、关联追踪、空态 | `users` | 部分迁移（列表页标题与列头已迁移；详情页 UserDetailPage 未迁移） | 未验证 | 用户标识不翻译 |
| C9 | `/project/[projectId]/topics` | `features/topics` (`TopicMobileTraceList`, `TopicTraceSelectorView`, 配置/运行弹窗) | 已登录 + `canViewTopics` | 列表、配置/自动处理弹窗、运行详情、网格、追踪选择 | — | 部分迁移 | 未验证 | 用户主题名称/筛选值不翻译 |
| C10 | `/project/[projectId]/alerts` `/alerts/new` `/alerts/[monitorId]` `/alerts/[monitorId]/edit` | `features/monitors` | RBAC:`alerts:read` + FLAG(v4WriteMode≠legacy) | 列表、新建、编辑、详情、删除 | — | 未迁移 | 未验证 | — |
| C11 | `/project/[projectId]/events` (v4) | `features/events/EventsPage` | 已登录 | 事件列表、筛选、详情 | — | 部分迁移（EventsPage 接入） | 未验证 | — |

## D. Content & experiments

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| D1 | `/project/[projectId]/prompts/[[...folder]]` | `features/prompts/PromptsPage`, `PromptTable`, `PromptDetail`, `DeletePrompt` | RBAC:`prompts:read` | 目录、详情、版本、标签保护、创建/编辑/复制、导入导出、文件夹操作 | `prompts` | 部分迁移 | 部分验证 | 用户数据（提示词名/正文）、代码示例（SDK） |
| D2 | `/project/[projectId]/prompts/new` | prompts 创建 | RBAC:`prompts:read` | 创建/编辑 | `prompts` | 部分迁移 | 未验证 | 代码示例 |
| D3 | `/project/[projectId]/prompts/metrics` | `PromptMetricsPage` | RBAC:`prompts:read` | 指标图表 | — | 部分迁移 | 未验证 | — |
| D4 | `/project/[projectId]/datasets` | `features/datasets/DatasetsPage`, `DatasetsTable`, `DeleteDatasetDialog` | RBAC:`datasets:read` | 目录、创建、文件夹、删除 | `datasets` | 部分迁移 | 未验证 | — |
| D5 | `/project/[projectId]/datasets/[datasetId]` | dataset 详情 | RBAC:`datasets:read` | 详情、编辑、schema 配置 | `datasets` | 部分迁移 | 未验证 | 用户数据（输入/预期输出/schema） |
| D6 | `/project/[projectId]/datasets/[datasetId]/items` `/items/[itemId]` `/items/[itemId]/runs` | `DatasetItemsPage` | RBAC:`datasets:read` | 条目列表、详情、编辑、运行、导入 | `datasets` | 部分迁移 | 未验证 | 用户数据（条目内容/API payload） |
| D7 | `/project/[projectId]/datasets/[datasetId]/experiments` | `DatasetExperimentsPage` | RBAC:`datasets:read` | 实验列表 | `datasets` | 部分迁移 | 未验证 | — |
| D8 | `/project/[projectId]/datasets/[datasetId]/compare` `/compare/charts` | 对比页 | RBAC:`datasets:read` | 输出对比、图表 | — | 未迁移 | 未验证 | 用户数据（结果/评分值） |
| D9 | `/project/[projectId]/datasets/[datasetId]/runs/[runId]` | 运行详情 | RBAC:`datasets:read` | 运行详情 | — | 未迁移 | 未验证 | — |
| D10 | `/project/[projectId]/experiments` `/experiments/results` | `features/experiments` | FLAG:`experimentsV4Enabled` | 列表、运行、详情、数据集运行、分析 | — | 未迁移 | 未验证 | 用户数据（结果/评分） |
| D11 | `/project/[projectId]/playground` | `features/playground` | 已登录 | 试验输入、模型选择、结果 | — | 未迁移 | 未验证 | 用户数据（试验输入）、机器标识（模型 ID） |
| D12 | `/project/[projectId]/skills` `/skills/new` `/skills/[skillName]` | `features/skills/SkillsPage` | RBAC:`skills:read` | 列表、文件显示/编辑、执行配置、结果、空/失败 | — | 部分迁移 | 未验证 | 用户数据（文件内容）、机器标识（模型 ID） |

## E. Evaluation

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| E1 | `/project/[projectId]/scores` | `features/scores/ScoresPage`, `ScoresTable` | 已登录 | 列表、配置、编辑、删除、空态 | `evaluations` | 部分迁移 | 部分验证（score 套件） | 用户评分配置名/枚举值不翻译 |
| E2 | `/project/[projectId]/scores/analytics` | `ScoresAnalyticsPage`, `ScoresOnboarding` | 已登录 | 分析图表、引导 | `evaluations` | 部分迁移 | 部分验证 | — |
| E3 | `/project/[projectId]/evals` `/evals/v2` `/evals/v2/[evaluatorId]` `/evals/v2/new` `/evals/v2/rules` | `features/evals/v2/pages/*`, `RulesTable` | RBAC:`evaluator:read`/`evaluationRule:read` | 列表、规则、模板、模型/代码编辑器、创建/编辑/克隆/删除 | `evaluations` | 部分迁移 | 未验证 | 机器标识（模型/规则 ID）、代码示例 |
| E4 | `/project/[projectId]/evals/configs` `/configs/new` `/configs/[configId]` | eval 配置 | RBAC:`evaluationRule:read` | 列表、新建、编辑 | `evaluations` | 未迁移 | 未验证 | — |
| E5 | `/project/[projectId]/evals/templates` `/templates/new` `/templates/[id]` | 模板库 | RBAC:`evaluator:read` | 模板列表、新建、编辑 | `evaluations` | 未迁移 | 未验证 | 代码示例 |
| E6 | `/project/[projectId]/evals/legacy` `/evals/legacy/[evaluatorId]` `/evals/legacy/new` | 旧版评估器 (`EvaluatorTable`) | RBAC:`evaluator:read` | 列表、编辑器、弹窗 | `evaluations` | 部分迁移（EvaluatorTable 接入） | 未验证 | 机器标识、代码示例 |
| E7 | `/project/[projectId]/evals/[evaluatorId]` `/evals/new` `/evals/rules` `/evals/default-model` `/evals/remap` | 旧版/当前评估器路由 | RBAC:`evaluator:read` | 编辑器、规则、默认模型、重映射 | `evaluations` | 未迁移 | 未验证 | 机器标识 |
| E8 | `/project/[projectId]/annotation-queues` | `features/annotation-queues/AnnotationQueuesTable` | RBAC:`annotationQueues:read` | 队列列表、配置、完成/失败 | `evaluations` | 部分迁移 | 部分验证（标注套件） | — |
| E9 | `/project/[projectId]/annotation-queues/[queueId]` `/items` `/items/[itemId]` | `AnnotationQueueItemPage` | RBAC:`annotationQueues:read` | 条目详情、标注表单、快捷键、草稿/提交 | `evaluations` | 部分迁移 | 部分验证（标注套件） | — |

## F. Gateway & batch operations

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| F1 | `/organization/[organizationId]/ai-gateway` `/ai-gateway/[page]` | `features/ai-gateway` | 已登录 + `visibleGatewayPages[slug]` | 概览、提供商模型、密钥管理、分析、首次密钥引导、数据不可用 | — | 未迁移 | 未验证 | 机器标识（密钥/模型 ID/协议字段） |
| F2 | 批量操作/导出 | `features/batch-actions`, `batch-exports` | 已登录 | 任务列表/状态、创建、取消、下载、失败 | — | 未迁移 | 未验证 | 机器标识（任务 ID/导出字段） |

## G. Settings & enterprise

| # | Route / entry | Actual owner | Role / toggle gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|---------------|--------------|--------------------|--------------------|-----------|------------------|--------------|-----------|
| G1 | `/project/[projectId]/settings` `/settings/[page]` | `features/settings/SettingsPage`, `SettingsTable` | 已登录（project 设置权限） | 账户字段、重命名、host、删除/转移、侧栏子入口 | `settings` | 部分迁移 | 部分验证（settings 套件 + delete-project story） | — |
| G2 | `/project/[projectId]/settings/models/[modelId]` | 模型设置 | 已登录 | 模型编辑、连接测试 | — | 未迁移 | 未验证 | 机器标识（模型/字段值） |
| G3 | `/project/[projectId]/settings/integrations/*` (slack/posthog/mixpanel/blobstorage/external-media-storage/web-callouts) | 各集成表单 | 已登录 | API/LLM 密钥表、连接测试、提供商、集成内部表单 | — | 未迁移 | 未验证 | 机器标识（密钥/字段值不进入字典/日志/截图） |
| G4 | `/organization/[organizationId]/settings` `/settings/[page]` | `features/organizations/OrganizationSettingsPage`, `RenameOrganization` | RBAC:`organizationSettings:read` | 组织字段、重命名、成员、SSO、域名、保留、账单、审计 | `settings`, `workspace` | 部分迁移 | 未验证 | — |
| G5 | 成员与邀请 | `features/rbac` / 组织成员 | RBAC:`organizationMembers:CRUD` | 成员/邀请表、角色显示、邀请/撤销/移除、权限错误 | — | 未迁移 | 未验证 | 用户名称不翻译；role/scope 枚举不翻译 |
| G6 | 企业 SSO / 域名 / 数据保留 / 账单 / 审计 | 企业子页面 | ENT + RBAC | SSO 配置、域名、保留、账单/套餐、审计 | — | 未迁移 | 未验证 | — |
| G7 | `/account/settings` | `features/account/AccountSettingsPage` | 已登录 | 账户字段、重命名、删除、语言 | `settings`, `common` | 部分迁移 | 未验证 | 用户名称不翻译 |
| G8 | `/admin`（管理员可达产品 UI）/ 功能预览 | `features/feature-previews` | ENT(管理员) | 功能预览开关、管理员入口 | — | 未迁移 | 未验证 | — |
| G9 | `/background-migrations` | `features/background-migrations` | ENT(管理员) | 迁移配置/进度/失败提示 | — | 未迁移 | 未验证 | 机器标识（迁移状态） |
| G10 | `/v4-migration` | `features/v4-migration` | FLAG/ENT | 迁移配置/进度 | — | 未迁移 | 未验证 | 机器标识 |

## H. Formatting (dates, numbers, charts)

| # | Scope | Actual owner | Gate | Sub-flows & states | Namespace | Source migration | Verification | Exception |
|---|-------|--------------|------|--------------------|-----------|------------------|--------------|-----------|
| H1 | 相对时间/本地时间 | `utils/dates.ts` | 已登录 | 显示格式、相对时间、tooltip | `common`（ locale 参数） | 源码完成 | 已验证（dates 固定时钟双语场景） | 机器标识（ISO/时区不变） |
| H2 | 数字/金额/缩写 | 数字格式化调用点 | 已登录 | 普通数字、金额、缩写 | — | 未迁移 | 未验证 | 机器标识（币种/精度/原值不变） |
| H3 | 图表 chrome | `features/widgets/chart-library`（prepare→visualise） | 已登录 | 时间轴、数值轴、图例/tooltip/分析 chrome | — | 未迁移 | 未验证 | 机器标识（原数据/排序不变） |
| H4 | 日期/时间/范围选择器 | date-picker 消费点 | 已登录 | 预设、相对时间、第三方 chrome | — | 未迁移 | 未验证 | 机器标识（时区/区间/时间戳不变） |

---

## Implemented surfaces (historical checkpoint)

This is a partial migration, not a declaration of full first-party UI coverage.
Task checkboxes remain open when their module-wide or browser acceptance criteria
are not satisfied. The current priority is visible translated content, followed
by full runtime verification.

- Authentication: sign-in, sign-up, password setup/reset, verification email
  actions, provider badges, privacy notice and cloud-region picker.
- Navigation: primary routes, group labels, account menus, theme labels and
  explicitly keyed page tabs. Arbitrary project, organization and tab names are
  not translated.
- Common tables: pagination, empty results, search/filter toolbar, selection
  banner and auto-refresh. The design-system PaginationBar stays context-free;
  application consumers use a translated wrapper with explicit labels.
- Tracing: trace and observation list columns and principal actions, detail
  headers, navigation and principal detail tabs. IDs/accessors and JSON remain
  unchanged.
- Prompts/datasets: list-page titles, directory table columns, principal create,
  import/export and delete actions, and selected detail/metrics pages.
- Evaluation: scores list/analysis empty state, v2 evaluator/rule pages and
  tables, legacy evaluator table, annotation queue list and principal item
  controls.
- Settings: organization/project/account entry pages, rename and host settings,
  delete/transfer project dialogs and account actions.
- Locale-aware relative dates and local-time tooltip labels; ISO values and
  timezone semantics are unchanged.

## Known remaining content (historical checkpoint)

- Auth error, enterprise SSO-required/initiation and Hugging Face-specific pages.
- Independent command menus, sidebar notifications and onboarding components.
- Detail body controls, JSON-viewer toolbars and less common tracing actions.
- Prompt/dataset creation/editing/import dialogs, folder operations and remaining
  item/run/compare tables.
- Evaluator editors, templates and dialogs, nested badges/filter descriptions,
  analysis chart internals and remaining annotation form explanations.
- API/LLM key tables, member/invite forms, integration-specific settings and
  enterprise retention/SSO/billing/audit subpages.
- Remaining shared filters, column visibility controls, export dialogs, date
  pickers and numerical/chart formatting call sites.

## Runtime checkpoint (historical)

- Existing Docker port 3000 was observed serving a prebuilt release, with no
  serialized UI locale. It does not load this checkout's changes.
- A separate source-built Next development server was started on port 3100
  using the development example environment with NEXTAUTH_URL matching 3100.
- Four concurrent sign-in requests with mixed zh-CN/en cookies returned HTTP
  200. Their translated title, HTML lang and serialized page locale matched each
  request; the authentication page props were retained.
- Native browser preview timed out. Full hydration, keyboard/mobile operation,
  authenticated seeded flows and production cache/bundle checks are not signed
  off by these HTTP checks.

## Checks and constraints (historical)

- Consolidated core/date/auth/tab/toolbar/pagination/score/annotation/settings
  regressions passed: `Test Files 13 passed (13)` / `Tests 107 passed (107)`.
- Translation-resource validation verified 654 bilingual entries at this
  checkpoint; this count is not a percentage of total application coverage.
- Web typecheck completed with exit 0. Web lint was rerun after fixing warnings;
  actual command summaries are recorded in chat, not inferred from Turbo cache.
- Full forced monorepo lint cannot complete without Cargo: ai-gateway lint exits
  127 (`cargo: command not found`), `Tasks: 0 successful, 4 total`,
  `Cached: 0 cached, 4 total`.
- Knip exits 1 on dependency/binary findings outside the changed UI files:
  worker's @ag-ui/client, native's @napi-rs/cli and the vitest/napi binaries.
- The existing delete-project Storybook scenario now covers Chinese labels and
  the unchanged confirmation token, but execution requires the missing Chromium
  headless shell. It is not reported as passing.
- Production build, client-bundle scan and full seeded browser validation remain
  deferred; no database seed, migration or user-data rewrite was performed.