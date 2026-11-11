import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { useLocale, useTranslation } from "./I18nProvider";
import { type Locale } from "./locale";
import { commonMessages } from "./messages/common";

const options = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
] satisfies { value: Locale; label: string }[];

export function LanguageSelect() {
  const { locale, setLocale } = useLocale();
  const t = useTranslation(commonMessages);
  return (
    <SelectInput
      aria-label={t("language")}
      value={locale}
      options={options}
      onValueChange={setLocale}
      placeholder={t("language")}
    />
  );
}
