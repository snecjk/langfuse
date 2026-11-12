import { AlertTriangle } from "@langfuse/icons";
import type { GatewayIngestionMode } from "@langfuse/shared";

import { Alert } from "@/src/components/design-system/Alert/Alert";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type IngestionProjectAccessAlertProps = {
  ingestionMode: Exclude<GatewayIngestionMode, "NONE">;
};

/** Org members and viewers get implicit access to every project through their org role. */
export function IngestionProjectAccessAlert({
  ingestionMode,
}: IngestionProjectAccessAlertProps) {
  const t = useTranslation(gatewayMessages);
  return (
    <Alert variant="warning" size="sm" icon={AlertTriangle}>
      <Alert.Title>{t("projectAccessAlertTitle")}</Alert.Title>
      <Alert.Description>
        <p>
          {t("projectAccessAlertDescription", {
            extra:
              ingestionMode === "FULL" ? t("projectAccessAlertFullExtra") : "",
          })}
        </p>
      </Alert.Description>
    </Alert>
  );
}
