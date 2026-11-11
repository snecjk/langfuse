import { type Locale } from "./locale";

type PluralMessage = { other: string } & Partial<
  Record<Intl.LDMLPluralRule, string>
>;
type Message = string | PluralMessage;
export type Messages = {
  en: Record<string, Message>;
  "zh-CN": Partial<Record<string, Message>>;
};
export type MessageParameters = Readonly<Record<string, string | number>>;

/** Returns plain text only; callers must render it as text, never as HTML. */
export function translate<T extends Messages>(
  locale: Locale,
  messages: T,
  key: Extract<keyof T["en"], string>,
  parameters: MessageParameters = {},
): string {
  const localized = messages[locale];
  const english = Object.hasOwn(messages.en, key)
    ? messages.en[key]
    : undefined;
  const message =
    (Object.hasOwn(localized, key) ? localized[key] : undefined) ?? english;
  if (message === undefined) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`Unknown interface translation: ${key}`);
    }
    console.warn("Unknown interface translation", { key });
    return locale === "en" ? "Something went wrong" : "出现了一些问题";
  }
  // English fallback must use English plural rules, not the requested locale's.
  const messageLocale = localized[key] === undefined ? "en" : locale;
  const template =
    typeof message === "string"
      ? message
      : (message[
          new Intl.PluralRules(messageLocale).select(Number(parameters.count))
        ] ?? message.other);
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(parameters, name) ? String(parameters[name]) : placeholder,
  );
}
