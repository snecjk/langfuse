import { useForm } from "react-hook-form";
import { type FilterState } from "@langfuse/shared";
import { Input } from "@/src/components/design-system/Input/Input";
import { Button } from "@/src/components/design-system/Button/Button";
import {
  completeExperimentFilter,
  newExperimentFilterDraft,
} from "./experimentFilterEditing";
import { type MetadataFilterColumn } from "./experimentFilterTypes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export function ExperimentFilterMetadataForm({
  column,
  onAdd,
  onCancel,
}: ExperimentFilterMetadataFormProps) {
  const form = useForm<{ key: string }>({ defaultValues: { key: "" } });
  const key = form.watch("key");
  const filter = completeMetadataFilter(column, key);
  const t = useTranslation(experimentMessages);

  function handleAdd(values: { key: string }) {
    const completed = completeMetadataFilter(column, values.key);
    if (!completed) return;
    form.reset({ key: "" });
    onAdd(completed);
  }

  function handleCancel() {
    form.reset({ key: "" });
    onCancel();
  }

  const handleSubmit = form.handleSubmit(handleAdd);

  return (
    <form
      className="ph-no-capture flex flex-col gap-3"
      aria-label={t("addMetadataFilter")}
      onSubmit={handleSubmit}
    >
      <span className="text-sm font-bold">
        {column === "itemMetadata"
          ? t("itemMetadataLabel")
          : t("metadataLabel2")}
      </span>
      <p className="text-muted-foreground text-xs">{t("keyIsSetAll")}</p>
      <Input
        aria-label={t("metadataKeyLabel")}
        placeholder={t("metadataKeyLabel")}
        {...form.register("key")}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button
          text={t("cancel")}
          variant="ghost"
          size="sm"
          onClick={handleCancel}
        />
        <Button
          text={t("addFilter")}
          type="submit"
          size="sm"
          disabled={!filter}
        />
      </div>
    </form>
  );
}

function completeMetadataFilter(column: MetadataFilterColumn, key: string) {
  return completeExperimentFilter({
    ...newExperimentFilterDraft(column),
    operator: "is set",
    key,
  });
}

type ExperimentFilterMetadataFormProps = {
  column: MetadataFilterColumn;
  onAdd: (filter: FilterState[number]) => void;
  onCancel: () => void;
};
