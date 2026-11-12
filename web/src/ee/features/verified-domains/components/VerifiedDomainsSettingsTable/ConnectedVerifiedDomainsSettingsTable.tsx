import { useMemo, useState } from "react";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { type AsyncTableData } from "@/src/components/design-system/table/Table";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import {
  VerifiedDomainsSettingsTable,
  type DomainRowData,
} from "./VerifiedDomainsSettingsTable";
import { VerifyDomainDialogController } from "../VerifyDomainDialogController/VerifyDomainDialogController";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function ConnectedVerifiedDomainsSettingsTable({
  orgId,
}: {
  orgId: string;
}) {
  const query = api.verifiedDomain.list.useQuery({ orgId });
  const utils = api.useUtils();
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(
    null,
  );
  const t = useTranslation(enterpriseMessages);

  const verifyMutation = api.verifiedDomain.verify.useMutation({
    onSuccess: (_, variables) => {
      utils.verifiedDomain.list.invalidate({ orgId });
      utils.ssoConfig.get.invalidate({ orgId });
      const domain = query.data?.find((row) => row.id === variables.id);
      showSuccessToast({
        operation: "verified_domain.verify",
        title: t("verifiedDomainVerifiedToast"),
        description: t("verifiedDomainVerifiedDescription", {
          domain: domain?.domain ?? t("verifiedDomainLabel"),
        }),
      });
    },
    onError: (err) =>
      showErrorToast(
        t("verifiedDomainVerifyFailed"),
        err.message,
        classifyTrpcToastError(err, "verified_domain.verify"),
      ),
    onSettled: () => setVerifyingDomainId(null),
  });

  const deleteMutation = api.verifiedDomain.delete.useMutation({
    onSuccess: (_, variables) => {
      utils.verifiedDomain.list.invalidate({ orgId });
      const domain = query.data?.find((row) => row.id === variables.id);
      showSuccessToast({
        operation: "verified_domain.remove",
        title: t("verifiedDomainRemovedToast"),
        description: t("verifiedDomainRemovedDescription", {
          domain: domain?.domain ?? t("verifiedDomainLabel"),
        }),
      });
    },
    onError: (err) =>
      showErrorToast(
        t("verifiedDomainRemoveFailed"),
        err.message,
        classifyTrpcToastError(err, "verified_domain.remove"),
      ),
  });

  const data = useMemo<AsyncTableData<DomainRowData[]>>(() => {
    if (query.isError) {
      return {
        status: "error",
        error: t("verifiedDomainsLoadFailed"),
      };
    }
    if (query.isLoading) return { status: "loading" };
    return { status: "success", data: query.data ?? [] };
  }, [query.isError, query.isLoading, query.data, t]);

  return (
    <ConfirmationDialogController<DomainRowData>
      title={(row) => t("verifiedDomainRemoveTitle", { domain: row.domain })}
      text={(row) =>
        row.verifiedAt
          ? t("verifiedDomainRemoveSsoFirst")
          : t("verifiedDomainRemovePending")
      }
      confirmLabel={t("verifiedDomainRemoveAction")}
      variant="destructive"
      loading={deleteMutation.isPending}
      onConfirm={async (row) => {
        await deleteMutation.mutateAsync({ orgId, id: row.id });
      }}
    >
      {({ openDialog: openDeleteDialog }) => (
        <VerifyDomainDialogController
          verifyingDomainId={verifyingDomainId}
          onVerify={async (row) => {
            setVerifyingDomainId(row.id);
            await verifyMutation.mutateAsync({ orgId, id: row.id });
          }}
        >
          {({ openDialog: openVerifyDialog }) => (
            <VerifiedDomainsSettingsTable
              data={data}
              verifyingDomainId={verifyingDomainId}
              onViewInstructions={openVerifyDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </VerifyDomainDialogController>
      )}
    </ConfirmationDialogController>
  );
}
