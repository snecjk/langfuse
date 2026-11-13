import { useMemo } from "react";
import { useFormState, useWatch, type UseFormReturn } from "react-hook-form";
import { useStore } from "zustand";
import { Check } from "@langfuse/icons";
import { Spinner } from "@/src/components/design-system/Spinner/Spinner";
import type { AnnotationFormActions } from "@/src/features/scores/actions/annotationFormActions";
import type { AnnotateFormSchemaType } from "@/src/features/scores/types";
import { annotationFieldKey } from "@/src/features/scores/lib/annotationConfigSelection";
import { hasChangedAnnotationValue } from "@/src/features/scores/state/annotationSaveStore";
import { cn } from "@/src/utils/tailwind";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { evaluationsMessages } from "@/src/features/i18n/messages/evaluations";

const SAVE_STATUS_LABEL_KEYS = {
  saving: "saving",
  saved: "saved",
  error: "couldNotSave",
} as const;

export function AnnotationSaveStatus({
  form,
  actions,
}: {
  form: UseFormReturn<AnnotateFormSchemaType>;
  actions: AnnotationFormActions;
}) {
  const t = useTranslation(evaluationsMessages);
  const fields = useWatch({ control: form.control, name: "scoreData" });
  const { errors } = useFormState({ control: form.control, name: "scoreData" });
  const state = useStore(actions.saveStore);
  const dirty = fields.some((field) =>
    hasChangedAnnotationValue(
      { ...field, id: field.id ?? null },
      state.confirmedFields.get(annotationFieldKey(field))?.field,
    ),
  );
  const status = useMemo(() => {
    if (state.pending) return "saving";
    if (state.failed) return "error";
    if (state.saved && !dirty && !errors.scoreData) return "saved";
    return "idle";
  }, [state.pending, state.failed, state.saved, dirty, errors.scoreData]);

  return (
    <div className="grid items-center justify-items-end">
      {(["saving", "saved", "error"] as const).map((itemStatus) => {
        const active = status === itemStatus;
        return (
          <div
            key={itemStatus}
            role={active ? "status" : undefined}
            aria-label={active ? t("scoreSaveStatus") : undefined}
            aria-hidden={!active}
            className={cn(
              "col-start-1 row-start-1 flex items-center justify-end gap-1 text-xs transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
              active
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-0.5 opacity-0",
            )}
          >
            <span className="flex size-3 items-center justify-center">
              {itemStatus === "saving" && active ? (
                <Spinner size="xxs" />
              ) : null}
              {itemStatus === "saved" ? <Check size="sm" /> : null}
            </span>
            <span className="text-muted-foreground">
              {t(SAVE_STATUS_LABEL_KEYS[itemStatus])}
            </span>
          </div>
        );
      })}
    </div>
  );
}
