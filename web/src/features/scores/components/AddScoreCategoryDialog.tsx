/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { useState } from "react";
import { isPresent, type ScoreConfigDomain } from "@langfuse/shared";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { api } from "@/src/utils/api";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { validateNewCategoryLabel } from "@/src/features/scores/lib/annotationFormHelpers";
import { type AnnotationAnalyticsContext } from "@/src/features/scores/lib/annotationAnalytics";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { evaluationsMessages } from "@/src/features/i18n/messages/evaluations";

export function AddScoreCategoryDialog({
  projectId,
  config,
  initialLabel,
  analyticsData,
  onClose,
  onCategoryAdded,
  isActive = true,
}: {
  projectId: string;
  config: ScoreConfigDomain;
  initialLabel: string;
  analyticsData: AnnotationAnalyticsContext;
  onClose: () => void;
  onCategoryAdded: (label: string, numericValue: number) => void;
  isActive?: boolean;
}) {
  const t = useTranslation(evaluationsMessages);
  const capture = usePostHogClientCapture();
  const utils = api.useUtils();
  const [label, setLabel] = useState(initialLabel);
  const existingCategories = config.categories ?? [];
  const validationError = validateNewCategoryLabel(label, existingCategories);

  const appendCategory = api.scoreConfigs.appendCategory.useMutation({
    onSuccess: async (data, variables) => {
      capture("score_configs:add_category_inline", analyticsData);
      await Promise.all([
        utils.scoreConfigs.invalidate(),
        utils.annotationQueues.invalidate(),
      ]);
      const added = data.categories?.find(
        (category) => category.label === variables.label,
      );
      if (isPresent(added?.value)) {
        onCategoryAdded(variables.label, added.value);
      }
      onClose();
    },
    onError: (error) => {
      showToast({
        type: "ERROR",
        title: error.message ?? t("failedToAddCategory"),
        analytics: classifyTrpcToastError(error, "score_category.create"),
      });
    },
  });

  const handleConfirm = () => {
    if (validationError) return;
    appendCategory.mutate({
      projectId,
      id: config.id,
      label: label.trim(),
    });
  };

  return (
    <Dialog
      open={isActive}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        closeOnInteractionOutside
        onCloseAutoFocus={(event) => {
          if (!isActive) event.preventDefault();
        }}
      >
        <DialogHeader variant="action">
          <DialogTitle>{t("addCategory")}</DialogTitle>
          <DialogDescription>
            {t("addCategoryToProject", { name: config.name })}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleConfirm();
          }}
        >
          <DialogBody>
            <div className="grid gap-2">
              <Label htmlFor="new-score-category-label">
                {t("categoryName")}
              </Label>
              <Input
                id="new-score-category-label"
                value={label}
                autoFocus
                onChange={(event) => setLabel(event.target.value)}
                placeholder={t("enterCategoryName")}
              />
              {label.trim() && validationError ? (
                <p className="text-destructive text-sm">{validationError}</p>
              ) : null}
            </div>
          </DialogBody>
          <DialogFooter variant="action">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={appendCategory.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!!validationError}
              loading={appendCategory.isPending}
            >
              {t("addCategory")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
