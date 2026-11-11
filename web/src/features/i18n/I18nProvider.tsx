import { createContext, use, useState, type ReactNode } from "react";
import { localeCookie, type Locale } from "./locale";
import { translate, type Messages, type MessageParameters } from "./messages";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);

  function setLocale(nextLocale: Locale) {
    updateLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    try {
      document.cookie = localeCookie(
        nextLocale,
        window.location.protocol === "https:",
      );
    } catch {
      // Blocked browser storage must not prevent an in-memory language switch.
    }
  }

  return (
    <LocaleContext value={{ locale, setLocale }}>{children}</LocaleContext>
  );
}

export function useLocale() {
  const context = use(LocaleContext);
  if (context === null) {
    throw new Error("useLocale requires I18nProvider");
  }
  return context;
}

/** Import the namespace at its feature boundary, rather than a global catalog. */
export function useTranslation<T extends Messages>(messages: T) {
  // Isolated components (e.g. Storybook) keep their English baseline. The app
  // always supplies a request-resolved locale through I18nProvider.
  const locale = useInterfaceLocale();
  return (
    key: Extract<keyof T["en"], string>,
    parameters?: MessageParameters,
  ) => translate(locale, messages, key, parameters);
}

/** Read-only locale for display helpers that also render outside the app. */
export function useInterfaceLocale(): Locale {
  return use(LocaleContext)?.locale ?? "en";
}
