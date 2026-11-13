import { useRouter } from "next/router";
import { type ReactNode } from "react";

import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { api } from "@/src/utils/api";

export function DuplicateDatasetDialogController({
  children,
  datasetId,
  projectId,
}: {
  children: (control: {
    disabled: { reason: string } | undefined;
    openDialog: () => void;
  }) => ReactNode;
  datasetId: string;
  projectId: string;
}) {
  const t = useTranslation(datasetsMessages);
  const router = useRouter();
  const hasAccess = useHasProjectAccess({
    projectId,
    scope: "datasets:CUD",
  });
  const duplicateDataset = api.datasets.duplicateDataset.useMutation();

  const disabled = hasAccess
    ? undefined
    : { reason: t("permissionDuplicateDataset") };

  return (
    <ConfirmationDialogController
      title={t("duplicateDatasetTitle")}
      text={t("duplicateDatasetText")}
      confirmLabel={t("duplicateDatasetAction")}
      variant="default"
      disabled={!hasAccess}
      loading={duplicateDataset.isPending}
      onConfirm={async () => {
        const { id } = await duplicateDataset.mutateAsync({
          projectId,
          datasetId,
        });
        router.push(`/project/${projectId}/datasets/${id}/items`);
      }}
    >
      {({ openDialog }) =>
        children({
          disabled,
          openDialog: () => {
            if (hasAccess) openDialog();
          },
        })
      }
    </ConfirmationDialogController>
  );
}
