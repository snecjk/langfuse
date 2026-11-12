import { useMemo } from "react";

import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { type AsyncTableData } from "@/src/components/design-system/table/Table";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";
import {
  WebCalloutSettingsTable,
  type WebCalloutEndpoint,
} from "./WebCalloutSettingsTable";

export function ConnectedWebCalloutSettingsTable({
  projectId,
  onCreate,
  onEdit,
}: {
  projectId: string;
  onCreate: () => void;
  onEdit: (endpoint: WebCalloutEndpoint) => void;
}) {
  const t = useTranslation(integrationMessages);
  const utils = api.useUtils();
  const endpoints = api.webCallouts.all.useQuery({ projectId });
  const deleteMutation = api.webCallouts.delete.useMutation({
    onSuccess: async () => {
      await utils.webCallouts.invalidate();
      showSuccessToast({
        operation: "web_callout_endpoint.delete",
        title: t("webCalloutDeleteSuccess"),
        description: t("webCalloutDeleteSuccessDesc"),
      });
    },
    onError: (error) => {
      showErrorToast(
        t("webCalloutDeleteFailed"),
        error.message,
        classifyTrpcToastError(error, "web_callout_endpoint.delete"),
      );
    },
  });

  const data = useMemo<AsyncTableData<WebCalloutEndpoint[]>>(() => {
    if (endpoints.isLoading) return { status: "loading" };
    if (endpoints.isError) {
      return {
        status: "error",
        error: t("webCalloutLoadFailed"),
      };
    }
    return { status: "success", data: endpoints.data ?? [] };
  }, [endpoints.data, endpoints.isError, endpoints.isLoading, t]);

  const disabledReason = useMemo(() => {
    if (endpoints.isLoading) {
      return t("webCalloutLoadConfigLoading");
    }
    if (endpoints.isError) {
      return t("webCalloutLoadConfigFailed");
    }
    if (endpoints.data?.length) {
      return t("webCalloutSingleOnly");
    }
    return undefined;
  }, [endpoints.data, endpoints.isError, endpoints.isLoading, t]);

  return (
    <ConfirmationDialogController<WebCalloutEndpoint>
      title={t("webCalloutDeleteTitle")}
      text={t("webCalloutDeleteText")}
      confirmLabel={t("webCalloutDeleteConfirm")}
      variant="destructive"
      loading={deleteMutation.isPending}
      onConfirm={(endpoint) =>
        deleteMutation.mutateAsync({ projectId, id: endpoint.id })
      }
    >
      {({ openDialog }) => (
        <WebCalloutSettingsTable
          data={data}
          noResultsMessage={t("webCalloutNoResults")}
          createAction={{ disabledReason, onClick: onCreate }}
          onEdit={onEdit}
          onDelete={openDialog}
        />
      )}
    </ConfirmationDialogController>
  );
}
