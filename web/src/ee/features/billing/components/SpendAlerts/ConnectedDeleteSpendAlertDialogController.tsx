import { type ComponentProps } from "react";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { api, reportNonTrpcError } from "@/src/utils/api";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function ConnectedDeleteSpendAlertDialogController({
  orgId,
  onSuccess,
  children,
}: {
  orgId: string;
  onSuccess: () => void;
  children: ComponentProps<
    typeof ConfirmationDialogController<string>
  >["children"];
}) {
  const capture = usePostHogClientCapture();
  const t = useTranslation(enterpriseMessages);

  const deleteMutation = api.spendAlerts.deleteSpendAlert.useMutation();

  const handleDelete = async (alertId: string) => {
    try {
      await deleteMutation.mutateAsync({
        orgId,
        id: alertId,
      });
      capture("spend_alert:deleted", {
        orgId,
        alertId,
      });
      showSuccessToast({
        operation: "spend_alert.delete",
        title: t("spendAlertDeleted"),
        description: "",
      });
      onSuccess();
    } catch (error) {
      reportNonTrpcError(error, "billing");
      showToast({
        type: "ERROR",
        title: t("spendAlertDeleteFailed"),
        analytics: classifyTrpcToastError(error, "spend_alert.delete"),
      });
      throw error;
    }
  };

  return (
    <ConfirmationDialogController<string>
      title={t("spendAlertDeleteTitle")}
      text={t("spendAlertDeleteText")}
      confirmLabel={t("spendAlertDeleteAction")}
      variant="destructive"
      loading={deleteMutation.isPending}
      error={deleteMutation.error?.message}
      onAfterDismiss={deleteMutation.reset}
      onConfirm={handleDelete}
    >
      {children}
    </ConfirmationDialogController>
  );
}
