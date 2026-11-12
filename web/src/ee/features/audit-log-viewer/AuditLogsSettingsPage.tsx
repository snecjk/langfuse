import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { ConnectedAuditLogsTable } from "@/src/ee/features/audit-log-viewer/AuditLogsTable/ConnectedAuditLogsTable";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function AuditLogsSettingsPage(props: { projectId: string }) {
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "projectAuditLogs:read",
  });
  const hasEntitlement = useHasEntitlement("audit-logs");
  const t = useTranslation(enterpriseMessages);

  const body = (() => {
    if (!hasEntitlement) {
      return (
        <p className="text-muted-foreground text-sm">
          {t("auditLogsEnterpriseProject")}
        </p>
      );
    }
    if (!hasAccess) {
      return (
        <Alert>
          <Alert.Title>{t("accessDenied")}</Alert.Title>
          <Alert.Description>
            {t("auditLogsProjectAccessDenied")}
          </Alert.Description>
        </Alert>
      );
    }
    return (
      <ConnectedAuditLogsTable scope="project" projectId={props.projectId} />
    );
  })();

  return (
    <>
      <Header title={t("auditLogsTitle")} />
      <p className="text-muted-foreground mb-2 text-sm">
        {t("auditLogsProjectHelp")}
      </p>
      {body}
    </>
  );
}
