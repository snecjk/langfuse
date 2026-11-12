import { useGatewaySettingsAccess } from "@/src/features/ai-gateway/hooks/useGatewaySettingsAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

/**
 * Why gateway managers cannot open Models and Gateway keys yet; undefined once
 * the gateway is set up. Other members see a notice on those pages instead.
 */
export function useGatewaySetupRequiredReason(
  organizationId: string | undefined,
) {
  const t = useTranslation(gatewayMessages);
  const access = useGatewaySettingsAccess(organizationId);
  const needsSetup =
    access.showNotDeployedNotice ||
    (access.showManagement && access.isIngestionConfigured === false);
  return needsSetup ? t("setupRequiredReason") : undefined;
}
