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
系统 SHALL 为公共导航、认证和引导、仪表盘、追踪与观察详情、提示词管理、数据集、评分与评估、标注、项目及组织设置和可用企业功能的第一方 UI 提供双语标题、标签、操作、空状态、提示与可预期错误说明。中间迁移批次允许英文回退，但不得作为完成标准。

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
