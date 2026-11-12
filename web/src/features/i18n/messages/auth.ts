import { type Messages } from "../messages";

export const authMessages = {
  en: {
    signInTitle: "Sign in to your account",
    signIn: "Sign in",
    signUp: "Sign up",
    continue: "Continue",
    email: "Email",
    password: "Password",
    forgotPassword: "(forgot password?)",
    whatIsThis: "What is this?",
    lastUsed: "Last used",
    noAccount: "No account yet?",
    unexpectedError: "An unexpected error occurred.",
    automaticSignInFailed: "Automatic preview sign-in failed.",
    invalidEmail: "Invalid email address",
    passwordMinimum: "Password must be at least 8 characters long",
    supportError: "Contact support if this error is unexpected.",
    correctRegion: "Make sure you are using the correct cloud data region.",
    ssoCheckFailed: "Unable to check SSO configuration. Please try again.",
    accountNotLinked:
      "Please sign in with the same provider (e.g. Google, GitHub, Azure AD, etc.) that you used to create this account.",
    credentialsInvalid: "Invalid credentials",
    credentialsSignIn: "CredentialsSignin",
    signingInAs: "Signing in as {email}",
    refreshAdvice:
      "If you are experiencing issues signing in, please force refresh this page (CMD + SHIFT + R) or clear your browser cache.",
    contactUs: "(contact us)",
    orSignUpWith: "or sign up with",
    workosOrganization: "WorkOS (organization)",
    workosConnection: "WorkOS (connection)",
    enterOrganization: "Please enter your organization ID",
    enterConnection: "Please enter your connection ID",
    privacyPrefix: "By {action} you are agreeing to our",
    signingIn: "signing in",
    signingUp: "signing up",
    terms: "ClickHouse General Terms and Conditions",
    addendum: "Langfuse Cloud Addendum",
    privacy: "Langfuse Privacy Policy",
    and: ", and",
    accurateData: ". You also confirm that the entered data is accurate.",

    // Sign-in fallbacks assigned as form errors before localization, so the
    // mapping below needs an entry to resolve them against.
    unexpectedErrorOccurred: "An unexpected error occurred.",
    automaticSignInFailedForm: "Automatic preview sign-in failed.",
    ssoCheckFailedForm: "Unable to check SSO configuration. Please try again.",

    // Authentication error page.
    authenticationError: "Authentication Error",
    authenticationErrorFallback:
      "An authentication error occurred. Please reach out to support.",

    // Enterprise SSO required. Provider names are not translated.
    enterpriseSsoRequiredTitle: "Use your Enterprise SSO",
    enterpriseSsoRequiresProvider:
      "This domain requires your company's custom Enterprise SSO.",
    enterpriseSsoTriedProvider:
      "You tried signing in with {provider}, but this domain requires your company's custom Enterprise SSO.",
    enterpriseSsoEnterCompanyEmail:
      "Enter your company email so we can send you to the correct identity provider.",
    enterpriseSsoEmail: "Email",
    enterpriseSsoSubmit: "Continue with Enterprise SSO",
    enterpriseSsoNoConfiguration:
      "We couldn't find a custom Enterprise SSO configuration for this domain. Double-check your company email or contact your administrator.",
    enterpriseSsoStartFailed:
      "Unable to start the Enterprise SSO sign-in flow. Please try again.",
    enterpriseSsoCheckFailed:
      "Something went wrong while checking your Enterprise SSO configuration. Please try again.",
    enterpriseSsoBackToSignIn: "Back to other sign-in options",
    enterpriseSsoNeedHelp: "Need help? Contact",
    enterpriseSsoPageTitle: "Enterprise SSO Required | Langfuse",

    // SSO initiation (redirect-in-progress and failure shell).
    ssoInitiateNoProvider:
      "No SSO provider specified. Please contact your administrator.",
    ssoInitiateFailed:
      "Failed to initiate SSO sign-in. Please try again or contact support.",
    ssoInitiateFailedTitle: "SSO Sign-in Failed",
    ssoInitiateRedirecting: "Redirecting to your identity provider...",
    signingInPageTitle: "Signing in | Langfuse",
  },
  "zh-CN": {
    signInTitle: "登录你的账户",
    signIn: "登录",
    signUp: "注册",
    continue: "继续",
    email: "邮箱",
    password: "密码",
    forgotPassword: "（忘记密码？）",
    whatIsThis: "这是什么？",
    lastUsed: "上次使用",
    noAccount: "还没有账户？",
    unexpectedError: "发生了意外错误。",
    automaticSignInFailed: "预览环境自动登录失败。",
    invalidEmail: "请输入有效的邮箱地址",
    passwordMinimum: "密码至少需要 8 个字符",
    supportError: "如果此错误不符合预期，请联系支持团队。",
    correctRegion: "请确认选择了正确的云数据区域。",
    ssoCheckFailed: "无法检查 SSO 配置，请重试。",
    accountNotLinked:
      "请使用创建账户时的同一登录提供商（例如 Google、GitHub、Azure AD 等）登录。",
    credentialsInvalid: "邮箱或密码不正确",
    credentialsSignIn: "邮箱或密码不正确",
    signingInAs: "正在以 {email} 登录",
    refreshAdvice:
      "如果登录遇到问题，请强制刷新此页面（CMD + SHIFT + R）或清除浏览器缓存。",
    contactUs: "（联系我们）",
    orSignUpWith: "或使用以下方式注册",
    workosOrganization: "WorkOS（组织）",
    workosConnection: "WorkOS（连接）",
    enterOrganization: "请输入组织 ID",
    enterConnection: "请输入连接 ID",
    privacyPrefix: "{action}即表示你同意我们的",
    signingIn: "登录",
    signingUp: "注册",
    terms: "ClickHouse 通用条款与条件",
    addendum: "Langfuse Cloud 附加条款",
    privacy: "Langfuse 隐私政策",
    and: "，以及",
    accurateData: "。同时，你确认所填写的信息准确无误。",

    unexpectedErrorOccurred: "发生了意外错误。",
    automaticSignInFailedForm: "预览环境自动登录失败。",
    ssoCheckFailedForm: "无法检查 SSO 配置，请重试。",

    authenticationError: "身份验证错误",
    authenticationErrorFallback: "发生身份验证错误，请联系支持团队。",

    enterpriseSsoRequiredTitle: "使用你的企业 SSO",
    enterpriseSsoRequiresProvider: "此域名需要使用你公司的自定义企业 SSO。",
    enterpriseSsoTriedProvider:
      "你尝试使用 {provider} 登录，但此域名需要使用你公司的自定义企业 SSO。",
    enterpriseSsoEnterCompanyEmail:
      "请输入你的公司邮箱，以便将你引导至正确的身份提供商。",
    enterpriseSsoEmail: "邮箱",
    enterpriseSsoSubmit: "继续使用企业 SSO",
    enterpriseSsoNoConfiguration:
      "未找到此域名的自定义企业 SSO 配置。请检查你的公司邮箱，或联系你的管理员。",
    enterpriseSsoStartFailed: "无法启动企业 SSO 登录流程，请重试。",
    enterpriseSsoCheckFailed: "检查企业 SSO 配置时出现问题，请重试。",
    enterpriseSsoBackToSignIn: "返回其他登录方式",
    enterpriseSsoNeedHelp: "需要帮助？请联系",
    enterpriseSsoPageTitle: "企业 SSO 必需 | Langfuse",

    ssoInitiateNoProvider: "未指定 SSO 提供商，请联系你的管理员。",
    ssoInitiateFailed: "无法发起 SSO 登录，请重试或联系支持团队。",
    ssoInitiateFailedTitle: "SSO 登录失败",
    ssoInitiateRedirecting: "正在跳转到你的身份提供商…",
    signingInPageTitle: "正在登录 | Langfuse",
  },
} satisfies Messages;
