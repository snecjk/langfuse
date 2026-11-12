import { Bot, UserRound } from "@langfuse/icons";

import { GatewayPlaceholder } from "@/src/features/ai-gateway/components/GatewayPlaceholder/GatewayPlaceholder";
import { GatewayKeySwitchboard } from "./GatewayKeySwitchboard";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

/** The page header holds the actions, so the placeholder only explains keys. */
export function GatewayApiKeysEmptyState() {
  const t = useTranslation(gatewayMessages);
  return (
    <GatewayPlaceholder.Frame
      title={t("noGatewayKeysYet")}
      description={t("noGatewayKeysDescription")}
    >
      <GatewayPlaceholder.Diagram>
        <div className="mx-auto aspect-[470/160] w-full max-w-lg">
          <GatewayKeySwitchboard />
        </div>
      </GatewayPlaceholder.Diagram>
      <GatewayPlaceholder.Benefits>
        <GatewayPlaceholder.Benefit
          icon={UserRound}
          title={t("userKeyTitle")}
          description={t("userKeyDescription")}
        />
        <GatewayPlaceholder.Benefit
          icon={Bot}
          title={t("serviceAccountKeyTitle")}
          description={t("serviceAccountKeyDescription")}
        />
      </GatewayPlaceholder.Benefits>
    </GatewayPlaceholder.Frame>
  );
}
