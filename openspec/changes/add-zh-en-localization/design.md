# Design

## Context

参见 proposal.md 的动机与范围。当前使用 Next.js Pages Router；`web/next.config.mjs` 仅配置 `en`，`web/src/pages/_document.tsx` 固定 `lang="en"`，`web/src/pages/_app.tsx` 集中装配上下文。导航标签分布于 `web/src/features/navigation/utils/*-tabs.ts` 和侧边栏组件，日期工具 `web/src/utils/dates.ts` 包含英文 locale。当前没有发现通用翻译库或现有 OpenSpec 能力规范。

本改动跨公共布局、业务模块及格式化逻辑，因此需要设计文档。规划阶段不安装依赖或修改这些源文件。

## Goals / Non-Goals

**Goals:** 在保持 URL 和业务契约稳定的前提下，实现可逐功能迁移、可验证、首屏一致的双语 UI。

**Non-Goals:** 账户跨设备同步、自动翻译用户内容、根据浏览器语言自动决定首次语言、改造为 App Router、改变后端原始错误/邮件或第三方页面。

## Decisions

### 1. Web 内部集中式翻译层

在 `web/src/features/i18n/` 提供 locale 白名单、纯函数解析器、类型化 key、参数插值和 React provider/hook。英文资源定义完整 key 类型，中文资源按相同结构组织并允许运行时英文回退；发布前检查范围内 key 的双语完整性。按 common/auth/navigation/tracing/prompts/datasets/evaluations/settings 等命名空间拆文件，核心资源同步可用，业务资源按页面模块导入，避免所有页面引入全部词典。

先使用小型内部字典层，不引入外部翻译平台或运行时自动翻译。选它是因为当前明确只有两种语言及有限插值需求；拒绝对 DOM 做文本替换，这会破坏 React 与业务数据边界。涉及计数时使用显式单复数消息及 `Intl.PluralRules`；插值只产生字符串/React 文本，不接受任意 HTML。开发时缺少英文 key 抛出明确错误，生产端最终回退通用可读错误消息并记录 key，不把 key 暴露给用户。

### 2. 浏览器 Cookie 偏好与原址切换

使用独立 `langfuse-ui-locale` Cookie，白名单仅 `zh-CN` / `en`，无效或缺失均解析为 `zh-CN`。Cookie 使用 Path=/、SameSite=Lax、有效期一年，HTTPS 下 Secure；不包含身份信息，需客户端可写。写入失败时仍在当前页面更新语言，但不承诺被浏览器禁止的持久化。

provider 接收已解析初始语言；切换只更新上下文与 Cookie，不触发 router.push、页面重挂载或表单重置。登录布局与应用公共区域使用同一个选择器，先查找 design-system 中适合的菜单/选择组件。保存的是浏览器偏好，不写数据库。相比 localStorage-only，Cookie 可参与 SSR，避免英文闪烁；相比语言 URL 前缀，不影响深链接、认证回调与查询参数。

### 3. 服务端与客户端共享初始语言

在 `_app` 服务端初始化路径解析 Cookie 并将 locale 序列化到页面初始 props；使用 App 的 getInitialProps 时保留 Next 原有页面 props 获取链，不丢失既有 getServerSideProps 的输出。`_document` 用同一 resolver 设置 HTML lang；客户端从序列化值初始化，切换同步更新 document.documentElement.lang。

该方案可能关闭部分页面的自动静态优化，这是为了正确的每请求语言首屏而接受的代价。显式 getStaticProps 页面不能依赖每请求 Cookie：实施时将需要翻译的此类产品页改为请求期渲染，保持业务取数语义，并以构建路由清单确认没有残留冲突。现有 Next i18n 路由设置不扩展 zh 前缀，界面语言不依赖 router.locale。

响应不得跨语言共享 HTML 缓存：保留认证页面的私有响应策略，对新增请求期语言页面设置 private/no-store，避免 CDN 缓存串语言。客户端路由进入新页面时沿用 provider 当前语言，不被旧的 pageProps 覆盖。不要在服务器使用全局可变 locale，避免并发请求串语言。

### 4. 标签与业务值分离

静态导航与列定义保存 labelKey，或在 hook/渲染函数中调用翻译器；语言变化必须使相关 memo/列头/验证消息重新计算。URL、表格列 ID、枚举值和 API payload 不使用译文。浏览器可预期错误按稳定错误码映射翻译，无法识别的服务端错误保留原始诊断文本。

日期与图表格式化显式接收 locale，采用现有日期工具可支持的中文 locale 及 Intl 格式化；沿用既有时区、币种、精度和排序的原始值。不要全局替换代码中的 `en`，避免误改协议和模型标识。

### 5. 按模块迁移，最终完整验收

维护术语表：Trace=追踪、Observation=观察、Prompt=提示词、Dataset=数据集、Score=评分；专业名称必要时保留英文。覆盖公共组件、认证、核心业务、设置、当前可用企业界面及可访问名称；不改 API 文档示例、用户 JSON 或外部内容。每批记录已迁移页面清单和明确排除项。最终检查 UI 字面量与资源完整性，人工区分业务数据和可译文案，不能简单以存在英文字符判定失败。

## Risks / Trade-offs

- [每请求渲染增加服务端成本] → 对照生产构建路由清单和首屏响应；避免为了读取 locale 重复请求业务数据。
- [中文长度导致菜单/表格挤压] → 验证窄屏、折叠侧边栏、弹窗与英文长文本，不写仅适合一种语言的固定宽度。
- [静态标签或 memo 不更新] → 迁移为翻译 key/响应式计算；用带未提交输入的语言切换检查捕获回归。
- [业务命名空间漏装导致闪烁] → 当前页面所需资源在首屏与客户端首次渲染前均可用，不在 hydration 后才加载首屏词典。
- [英文回退掩盖遗漏] → 回退用于可靠性；发布验收要求范围内资源齐全，并记录审查结果。

## Migration Plan

先交付基础模块与公共切换入口，再按公共界面、核心业务、设置/企业界面迁移，每批保持中英文可用。没有数据库迁移。依照现有 seed CLI 准备合成数据，不写临时原始数据脚本。最终在生产构建运行时检查 SSR、深链接、认证跳转、状态保留与布局。回滚恢复原组件文案与 provider/入口/文档初始化，废弃 Cookie 无业务副作用，不需要数据回滚。
