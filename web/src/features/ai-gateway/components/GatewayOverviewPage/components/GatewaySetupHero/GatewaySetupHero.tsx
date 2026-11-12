import { useId } from "react";

import { Button } from "@/src/components/design-system/Button/Button";
import styles from "@/src/features/ai-gateway/components/GatewayLaunch/gatewayLaunch.module.css";
import {
  GatewaySetupSwitchboard,
  type GatewaySetupSwitchboardProps,
} from "@/src/features/ai-gateway/components/GatewayOverviewPage/components/GatewaySetupHero/GatewaySetupSwitchboard";
import { GATEWAY_SETUP } from "@/src/features/ai-gateway/components/GatewaySetupPage/constants/gatewaySetup";
import { providerLabels } from "@/src/features/ai-gateway/constants/providerLabels";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import { cn } from "@/src/utils/tailwind";

export type GatewaySetupHeroProps = GatewaySetupSwitchboardProps;

/** Overview banner while the gateway is not set up; provider switches turn on as credentials are added. */
export function GatewaySetupHero({ providers }: GatewaySetupHeroProps) {
  const t = useTranslation(gatewayMessages);
  const titleId = useId();
  const connectedLabels = providers
    .filter(({ isConnected }) => isConnected)
    .map(({ provider }) => providerLabels[provider]);

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "bg-surface-section overflow-hidden border-b",
        styles.dotGrid,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-8 px-6 py-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id={titleId} className="text-2xl font-bold">
            {t("setupHeroTitle")}
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            {t("setupHeroLead")}
          </p>
          <div className="mt-2">
            <Button
              variant="text"
              text={t("setupHeroDocsLink")}
              href={GATEWAY_SETUP.docsUrl}
            />
          </div>
          <p className="sr-only">
            {connectedLabels.length > 0
              ? t("connectedProviders", { names: connectedLabels.join(", ") })
              : t("noProvidersConnected")}
          </p>
        </div>
        <div className="hidden h-52 w-112 shrink-0 lg:block">
          <GatewaySetupSwitchboard providers={providers} />
        </div>
      </div>
    </section>
  );
}
