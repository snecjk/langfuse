export type Locale = "zh-CN" | "en";

const COOKIE_NAME = "langfuse-ui-locale";

export function resolveLocale(value: unknown): Locale {
  return value === "en" ? "en" : "zh-CN";
}

export function localeFromCookie(cookie: string | undefined): Locale {
  const value = cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  try {
    return resolveLocale(
      value === undefined ? undefined : decodeURIComponent(value),
    );
  } catch {
    // Malformed browser preferences are equivalent to a missing preference.
    return "zh-CN";
  }
}

export function localeCookie(locale: Locale, secure: boolean): string {
  return `${COOKIE_NAME}=${locale}; Path=/; SameSite=Lax; Max-Age=31536000${secure ? "; Secure" : ""}`;
}
