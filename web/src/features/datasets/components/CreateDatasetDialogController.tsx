/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { Dialog } from "@/src/components/ui/dialog";
import {
  CreateDatasetDialogContent,
  type CreateDatasetDialogProps,
} from "@/src/features/datasets/components/CreateDatasetDialogContent";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { type ReactNode, useState } from "react";

export function CreateDatasetDialogController({
  children,
  ...props
}: CreateDatasetDialogProps & {
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
    : { reason: t("permissionCreateDataset") };

  const openDialog = () => {
    if (!hasAccess) return;

    setOpen(true);
    capture("datasets:new_form_open");
  };

  return (
    <Dialog open={hasAccess && open} onOpenChange={setOpen}>
      {children({ disabled, openDialog })}
      <CreateDatasetDialogContent
        {...props}
        onFormSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
}
