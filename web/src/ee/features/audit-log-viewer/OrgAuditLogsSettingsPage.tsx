import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { AccessLoggingSwitch } from "@/src/ee/features/access-audit-log/components/AccessLoggingSwitch";
import { useShowAccessLoggingSetting } from "@/src/ee/features/access-audit-log/hooks/useShowAccessLoggingSetting";
import { ConnectedAuditLogsTable } from "@/src/ee/features/audit-log-viewer/AuditLogsTable/ConnectedAuditLogsTable";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function OrgAuditLogsSettingsPage(props: { orgId: string }) {
  const hasAccess = useHasOrganizationAccess({
    organizationId: props.orgId,
    scope: "orgAuditLogs:read",
  });
  const hasEntitlement = useHasEntitlement("audit-logs");
  const showAccessLogging = useShowAccessLoggingSetting();
  const t = useTranslation(enterpriseMessages);

  const body = (() => {
    if (!hasEntitlement) {
      return (
        <p className="text-muted-foreground text-sm">
          {t("auditLogsEnterpriseOrganization")}
        </p>
      );
    }
    if (!hasAccess) {
      return (
        <Alert>
          <Alert.Title>{t("accessDenied")}</Alert.Title>
          <Alert.Description>
            {t("auditLogsOrganizationAccessDenied")}
          </Alert.Description>
        </Alert>
      );
    }
    return <ConnectedAuditLogsTable scope="organization" orgId={props.orgId} />;
  })();

  return (
    <div className="flex flex-col gap-6">
      {showAccessLogging && (
        <div>
          <Header title={t("auditAccessLoggingTitle")} internal />
          <AccessLoggingSwitch orgId={props.orgId} />
        </div>
      )}
      <div>
        <Header title={t("auditLogsOrganizationTitle")} />
        <p className="text-muted-foreground mb-2 text-sm">
          {t("auditLogsOrganizationHelp")}
        </p>
        {body}
      </div>
    </div>
  );
}
