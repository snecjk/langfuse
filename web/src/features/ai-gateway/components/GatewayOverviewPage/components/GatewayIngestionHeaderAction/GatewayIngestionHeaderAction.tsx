import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { IngestionDialogController } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/IngestionDialogController/IngestionDialogController";
import { useGatewayConfig } from "@/src/features/ai-gateway/components/GatewaySetupPage/hooks/useGatewayConfig";
import type { GatewayProject } from "@/src/features/ai-gateway/components/GatewaySetupPage/types/gatewaySetup";
import { GATEWAY_INGESTION_MODES } from "@/src/features/ai-gateway/constants/gatewayIngestionModes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type GatewayIngestionHeaderActionProps = {
  organizationId: string;
  projects: Array<GatewayProject & { deletedAt?: Date | string | null }>;
};

/** Ingestion settings in the page header of Overview; managers only. */
export function GatewayIngestionHeaderAction({
  organizationId,
  projects,
}: GatewayIngestionHeaderActionProps) {
  const t = useTranslation(gatewayMessages);
  const gatewayConfig = useGatewayConfig(organizationId);
  if (gatewayConfig.status !== "success") {
    return <Skeleton className="h-8 w-36" />;
  }

  const ingestionMode = GATEWAY_INGESTION_MODES.find(
    (mode) => mode.value === gatewayConfig.config?.ingestionMode,
  );

  return (
    <IngestionDialogController
      organizationId={organizationId}
      config={gatewayConfig.config}
      projects={projects.filter((project) => !project.deletedAt)}
    >
      {({ openDialog }) => {
        let modeKey:
          | "ingestionModeFull"
          | "ingestionModeUsage"
          | "ingestionModeNone" = "ingestionModeNone";
        if (ingestionMode?.value === "FULL") {
          modeKey = "ingestionModeFull";
        } else if (ingestionMode?.value === "USAGE") {
          modeKey = "ingestionModeUsage";
        }
        return (
          <Button variant="outline" onClick={openDialog}>
            {ingestionMode ? (
              <>
                <ingestionMode.icon size="base" __rawClassName="mr-1.5" />
                {t("ingestionModeLabel", {
                  mode: t(modeKey),
                })}
              </>
            ) : (
              t("ingestionSetupButton")
            )}
          </Button>
        );
      }}
    </IngestionDialogController>
  );
}
