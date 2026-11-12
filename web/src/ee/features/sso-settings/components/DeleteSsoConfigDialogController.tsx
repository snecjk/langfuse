import { useState } from "react";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function DeleteSsoConfigDialogController({
  orgId,
  children,
}: {
  orgId: string;
  children: (control: {
    openDialog: (domain: string) => void;
  }) => React.ReactNode;
}) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const utils = api.useUtils();
  const t = useTranslation(enterpriseMessages);

  const deleteMutation = api.ssoConfig.delete.useMutation({
    onSuccess: () => {
      utils.ssoConfig.get.invalidate({ orgId });
      showSuccessToast({
        operation: "sso.disable",
        title: t("ssoDisabled"),
        description: t("ssoDisabledDescription", {
          domain: selectedDomain ?? "",
        }),
      });
    },
    onError: (err) => {
      showErrorToast(
        t("ssoRemoveFailed"),
        err.message,
        classifyTrpcToastError(err, "sso.disable"),
      );
    },
  });

  return (
    <ConfirmationDialogController
      title={
        selectedDomain
          ? t("ssoRemoveConfirmTitle", { domain: selectedDomain })
          : t("ssoRemoveConfirmDefault")
      }
      text={t("ssoRemoveConfirmText")}
      confirmLabel={t("ssoRemoveAction")}
      variant="destructive"
      loading={deleteMutation.isPending}
      onConfirm={async () => {
        if (!selectedDomain) return;
        await deleteMutation.mutateAsync({ orgId, domain: selectedDomain });
      }}
    >
      {({ openDialog }) =>
        children({
          openDialog: (domain) => {
            setSelectedDomain(domain);
            openDialog();
          },
        })
      }
    </ConfirmationDialogController>
  );
}
