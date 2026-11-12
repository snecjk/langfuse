import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { catalogMessages } from "@/src/features/i18n/messages/catalog";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { api } from "@/src/utils/api";
import { type ReactNode } from "react";
import { useRouter } from "next/router";

export interface DeleteDatasetDialogDataProps {
  projectId: string;
  datasetId: string;
  datasetName: string;
  redirectUrl?: string;
}

export function DeleteDatasetDialog({
  children,
  projectId,
  datasetId,
  datasetName,
  redirectUrl,
}: DeleteDatasetDialogDataProps & {
  children: (control: { openDialog: () => void }) => ReactNode;
}) {
  const t = useTranslation(catalogMessages);
  const router = useRouter();
  const capture = usePostHogClientCapture();
  const utils = api.useUtils();
  const deleteMutation = api.datasets.deleteDataset.useMutation();

  const handleDelete = async () => {
    capture("datasets:delete_form_submit");

    await deleteMutation.mutateAsync({ projectId, datasetId });

    capture("datasets:delete_dataset_button_click");

    if (redirectUrl) {
      await router.push(redirectUrl);
    } else {
      await utils.datasets.invalidate();
    }
  };

  return (
    <ConfirmationDialogController
      title={t("confirm")}
      text={t("deleteDatasetWarning")}
      confirmationText={datasetName}
      confirmLabel={t("deleteDataset")}
      variant="destructive"
      loading={deleteMutation.isPending}
      onConfirm={handleDelete}
    >
      {children}
    </ConfirmationDialogController>
  );
}
