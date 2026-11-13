/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { Dialog } from "@/src/components/ui/dialog";
import {
  UpdateDatasetDialogContent,
  type UpdateDatasetDialogProps,
} from "@/src/features/datasets/components/UpdateDatasetDialogContent";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { type ReactNode, useState } from "react";

export type UpdateDatasetDialogSource = "dataset" | "table-single-row";

export function UpdateDatasetDialogController({
  children,
  source,
  ...props
}: UpdateDatasetDialogProps & {
  source: UpdateDatasetDialogSource;
  children: (control: {
    disabled: { reason: string } | undefined;
    openDialog: () => void;
  }) => ReactNode;
}) {
  const t = useTranslation(datasetsMessages);
  const capture = usePostHogClientCapture();
  const [open, setOpen] = useState(false);
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "datasets:CUD",
  });

  const disabled = hasAccess
    ? undefined
    : { reason: t("permissionEditDataset") };

  const openDialog = () => {
    if (!hasAccess) return;

    setOpen(true);
    capture("datasets:update_form_open", {
      source,
    });
  };

  return (
    <Dialog open={hasAccess && open} onOpenChange={setOpen}>
      {children({ disabled, openDialog })}
      <UpdateDatasetDialogContent
        {...props}
        onFormSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
}
