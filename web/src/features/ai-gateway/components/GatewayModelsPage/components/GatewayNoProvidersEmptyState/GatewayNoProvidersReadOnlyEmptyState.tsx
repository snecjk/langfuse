import { BookOpen } from "@langfuse/icons";

import { Button } from "@/src/components/design-system/Button/Button";
import { GatewayPlaceholder } from "@/src/features/ai-gateway/components/GatewayPlaceholder/GatewayPlaceholder";
import { GATEWAY_MODELS_DOCS_URL } from "@/src/features/ai-gateway/constants/gatewayDocsUrls";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import { NoProvidersDiagram } from "./components/NoProvidersDiagram";

/** Shown to members who cannot add provider credentials. */
export function GatewayNoProvidersReadOnlyEmptyState() {
  const t = useTranslation(gatewayMessages);
  return (
    <GatewayPlaceholder.Frame
      title={t("noProvidersYet")}
      description={t("noProvidersMemberDescription")}
    >
      <GatewayPlaceholder.Actions>
        <Button
          variant="outline"
          text={t("aboutGatewayModels")}
          icon={BookOpen}
          href={GATEWAY_MODELS_DOCS_URL}
        />
      </GatewayPlaceholder.Actions>
      <NoProvidersDiagram />
    </GatewayPlaceholder.Frame>
  );
}
