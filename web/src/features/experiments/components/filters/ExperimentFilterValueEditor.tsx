import { type ChangeEvent } from "react";
import { Input } from "@/src/components/design-system/Input/Input";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { MultiSelectInput } from "@/src/components/design-system/MultiSelectInput/MultiSelectInput";
import { type ExperimentFilterDraft } from "./experimentFilterEditing";
import { type ExperimentFilterOptions } from "./experimentFilterTypes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export function ExperimentFilterValueEditor({
  draft,
  options,
  onChange,
}: ExperimentFilterValueEditorProps) {
  const t = useTranslation(experimentMessages);
  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  if (draft.type === "stringOptions" || draft.type === "categoryOptions") {
    const values = Array.isArray(draft.value) ? draft.value : [];
    const offered =
      draft.type === "stringOptions"
        ? (options?.level ?? ["DEBUG", "DEFAULT", "WARNING", "ERROR"])
        : (options?.score_categories?.[draft.key] ?? []);
    return (
      <MultiSelectInput
        aria-label={t("filterValuesAria")}
        value={values}
        options={[...new Set([...offered, ...values])].map((value) => ({
          value,
          label: value,
        }))}
        onValueChange={onChange}
        placeholder={t("selectValues")}
        selectedLabel={values.join(", ")}
        searchPlaceholder={t("searchValues")}
        emptyMessage={options ? t("noValuesForScore") : t("loadingValues")}
      />
    );
  }
  if (draft.type === "booleanObject" || draft.type === "boolean")
    return (
      <SelectInput
        aria-label={t("filterValueAria")}
        value={String(draft.value)}
        options={[
          { value: "true", label: "true" },
          { value: "false", label: "false" },
        ]}
        onValueChange={onChange}
        placeholder={t("selectValue")}
      />
    );
  return (
    <Input
      aria-label={t("filterValueAria")}
      value={String(draft.value)}
      onChange={handleTextChange}
      placeholder={t("filterValueLabel")}
      inputMode={draft.type === "numberObject" ? "decimal" : "text"}
    />
  );
}

type ExperimentFilterValueEditorProps = {
  draft: ExperimentFilterDraft;
  options: ExperimentFilterOptions | undefined;
  onChange: (value: ExperimentFilterDraft["value"]) => void;
};
