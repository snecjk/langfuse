import { Alert } from "@/src/components/design-system/Alert/Alert";
import Header from "@/src/components/layouts/header";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { VerifiedDomainsSettings } from "@/src/ee/features/verified-domains/components/VerifiedDomainsSettings";
import { AlertCircle } from "@langfuse/icons";
import { ConnectedSsoConfigsTable } from "./SsoConfigsTable/ConnectedSsoConfigsTable";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const SSOSettings = ({ orgId }: { orgId: string }) => {
  const hasEntitlement = useHasEntitlement("cloud-multi-tenant-sso");
  const hasAccess = useHasOrganizationAccess({
    organizationId: orgId,
    scope: "organization:update",
  });
  const t = useTranslation(enterpriseMessages);

  const heading = (
    <>
      <Header title={t("ssoTitle")} />
      <p className="text-muted-foreground mb-4 text-sm">
        {t("ssoDescription")}
      </p>
    </>
  );

  if (!hasEntitlement) {
    return (
      <div className="space-y-8">
        <VerifiedDomainsSettings orgId={orgId} />
        <div>
          {heading}
          <Alert icon={AlertCircle}>
            <Alert.Title>{t("notAvailable")}</Alert.Title>
            <Alert.Description>{t("notAvailablePlan")}</Alert.Description>
          </Alert>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-8">
        <VerifiedDomainsSettings orgId={orgId} />
        <div>
          {heading}
          <Alert>
            <Alert.Title>{t("accessDenied")}</Alert.Title>
            <Alert.Description>{t("noPermissionSso")}</Alert.Description>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <VerifiedDomainsSettings orgId={orgId} />
      <div className="space-y-6">
        {heading}
        <ConnectedSsoConfigsTable orgId={orgId} />
      </div>
    </div>
  );
};
