# Spec Delta

## Purpose

为使用 Langfuse 的中文和英文用户提供一致的界面语言选择、翻译与格式化体验，使语言偏好跨刷新保留，同时保证业务数据、访问路径和外部接口契约不因界面语言变化而改变。

## ADDED Requirements

### Requirement: Language selection and persistence
系统 SHALL 支持简体中文 `zh-CN` 与英文 `en`，无有效偏好时默认简体中文。系统 SHALL 在登录页及已登录应用公共区域提供语言入口，将选择保存在当前浏览器，而非账户级同步。

#### Scenario: First visit or invalid preference
- **WHEN** 用户没有语言偏好或偏好值不受支持
- **THEN** 页面使用简体中文，不因浏览器系统语言自动改为英文

#### Scenario: Remember explicit choice
- **WHEN** 用户切换到 English 后刷新、访问深链接或退出后重新登录
- **THEN** 同一浏览器继续显示英文，并可切换回简体中文

### Requirement: State preserving language switch
系统 SHALL 在语言切换时保留 URL 路径、查询参数、片段、当前项目、筛选、选中对象及未提交输入，不触发业务写操作。

#### Scenario: Switch on a filtered detail page
- **WHEN** 用户在带查询参数的详情页编辑未提交表单并切换语言
- **THEN** 标签和提示更新，但 URL、选中对象、筛选和输入保持不变

### Requirement: First party interface translations
系统 SHALL 为当前版本全部第一方产品 UI 提供中英文，包括公共控件、身份/工作区、仪表盘/widgets、追踪/观察/会话/用户、提示词/数据集/实验、评分/评估/标注、Topics/Skills/试验场、AI Gateway、批量操作/导出、设置、企业/管理员/迁移界面。可达旧版、角色受限及功能开关页面 SHALL 纳入；不得因为当前账号无权限而排除。

#### Scenario: Navigate after choosing Chinese
- **WHEN** 用户选择中文并访问上述范围内的页面或打开对话框
- **THEN** 第一方静态 UI 文案及可访问名称使用中文，英文选择提供对应英文

### Requirement: Safe fallback and interpolation
系统 SHALL 在中文翻译缺失时回退对应英文文案，且参数值不得被解释为 HTML。生产页面不得向用户显示内部翻译 key。

#### Scenario: Missing Chinese entry
- **WHEN** 某个有效英文消息缺少中文译文
- **THEN** 页面显示含正确参数的英文消息而非空白或内部 key

#### Scenario: Untrusted message parameter
- **WHEN** 插值参数包含 HTML 或脚本样式文本
- **THEN** 该参数按文本显示，不作为 HTML 执行

### Requirement: Consistent rendering and localized formats
系统 SHALL 保证服务端首屏与客户端初始渲染使用相同语言，HTML 语言属性与当前界面一致。日期、相对时间及普通数字显示 SHALL 使用当前语言的格式，同时保留既有时区、精度、币种及排序语义。

#### Scenario: Refresh an English session
- **WHEN** 保存英文偏好的用户直接请求详情页并完成 hydration
- **THEN** 首屏及客户端均为英文，HTML 语言属性为英文，无语言引起的 hydration 错误

#### Scenario: Change formatting language
- **WHEN** 用户在展示时间和普通数值的页面切换语言
- **THEN** 时间及数字格式更新，时区、币种、数值、筛选与排序不变

### Requirement: Business and protocol isolation
系统 SHALL 仅翻译界面呈现，不修改用户内容、提示词正文、模型标识、API 字段、数据库枚举、导出机器字段及服务端原始错误。无法映射的原始错误允许作为诊断信息保留。

#### Scenario: Inspect and submit user data
- **WHEN** 用户切换语言后查看追踪 JSON、编辑提示词或提交使用枚举的表单
- **THEN** 原始内容及请求字段和值与切换前一致，只有展示标签改变

### Requirement: Complete interaction state coverage
系统 SHALL 翻译范围内每个页面实际存在的列表、详情、新建/编辑/导入和确认流程，以及加载、空结果、无权限、验证错误、失败和成功状态。按钮、列头、筛选说明、占位符、工具提示、对话框和可访问名称 SHALL 使用当前语言；不得仅翻译入口标题。

#### Scenario: Open a secondary editor
- **WHEN** 用户在中文数据集页面打开导入弹窗并遇到系统校验错误
- **THEN** 弹窗标题、操作、说明及校验消息均为中文，输入的数据与 schema 内容不被改写

#### Scenario: Visit a gated feature
- **WHEN** 合法具备权限且功能已启用的用户访问企业 SSO 配置、管理员或迁移界面
- **THEN** 所有第一方系统文案使用选择的语言，权限与功能开关行为不变

### Requirement: Auditable translation completeness
系统的全量汉化交付 SHALL 提供覆盖页面及交互状态的审查清单，区分已迁移、已验证和不适用。发布时 SHALL 不存在未处理的可译英文或缺失中文译文；残留英文只能属于有明确理由的非翻译内容。回退行为、条目总数和单元测试通过均不得单独作为完整覆盖证据。

#### Scenario: Dictionary passes while a dialog remains English
- **WHEN** 所有已收录字典均完整，但中文界面仍显示未迁移的第一方编辑弹窗
- **THEN** 该页面不得标为完成，且全量汉化不得通过发布验收

#### Scenario: Preserve legitimate English content
- **WHEN** 中文界面展示品牌名、模型标识、协议字段或用户自行填写的英文名称
- **THEN** 它们保持原样，并与需要迁移的系统文案明确区分，不通过盲目替换英文破坏数据

### Requirement: Reactive messages and language appropriate composition
系统 SHALL 使用当前语言呈现完整的参数化消息、计数消息和包含链接的系统说明，允许中英文采用不同语序。切换语言后已显示的系统验证错误及通知 SHALL 同步更新，同时保持草稿和动态业务值。

#### Scenario: Switch after validation failed
- **WHEN** 用户遇到系统表单错误后切换语言
- **THEN** 错误、字段标签和操作更新为新语言，输入值与原验证规则不变

#### Scenario: Render linked and counted instructions
- **WHEN** 系统说明同时包含链接、条目数和用户提供的名称
- **THEN** 消息使用当前语言的语序和计数形式，链接功能不变，名称按原始文本安全显示

### Requirement: Localized errors with preserved diagnostics
系统 SHALL 为可预期的第一方失败提供当前语言的主要说明和可执行操作。未知服务端或第三方原始错误 SHALL 保留为诊断信息，不被盲目翻译；其外围通用错误标题、重试及联系支持操作 SHALL 本地化。

#### Scenario: Unknown provider error
- **WHEN** 外部身份提供商返回未映射的英文错误
- **THEN** 界面主要错误说明与操作使用当前语言，原始错误仍可作为诊断查看，认证协议及上报内容不变
