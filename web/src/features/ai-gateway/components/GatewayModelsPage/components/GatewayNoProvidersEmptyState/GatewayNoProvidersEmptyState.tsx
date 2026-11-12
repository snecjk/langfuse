import { ArrowRight, BookOpen, Plus } from "@langfuse/icons";

import { Button } from "@/src/components/design-system/Button/Button";
import { GatewayProviderMark } from "@/src/features/ai-gateway/components/GatewayProviderMark";
import { getGatewaySetupHeroProviders } from "@/src/features/ai-gateway/components/GatewayOverviewPage/fns/getGatewaySetupHeroProviders";
import { GatewayPlaceholder } from "@/src/features/ai-gateway/components/GatewayPlaceholder/GatewayPlaceholder";
import { GATEWAY_SETUP_DOCS_URL } from "@/src/features/ai-gateway/constants/gatewayDocsUrls";
import { providerLabels } from "@/src/features/ai-gateway/constants/providerLabels";
import { formatAvailableGatewayProviderNames } from "@/src/features/ai-gateway/fns/formatAvailableGatewayProviderNames";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import { NoProvidersDiagram } from "./components/NoProvidersDiagram";
import type { GatewayProvider } from "@/src/features/ai-gateway/types/gatewayProvider";

const CREDENTIAL_SOURCES = {
  ANTHROPIC: "API key from console.anthropic.com",
  OPENAI: "API key from platform.openai.com",
  BEDROCK: "AWS credentials and region",
} satisfies Record<GatewayProvider, string>;

export type GatewayNoProvidersEmptyStateProps = {
  onAddProvider: () => void;
  onConnectProvider: (provider: GatewayProvider) => void;
};

/** Shown to gateway managers until the organization has a provider credential. */
export function GatewayNoProvidersEmptyState({
  onAddProvider,
  onConnectProvider,
}: GatewayNoProvidersEmptyStateProps) {
  const t = useTranslation(gatewayMessages);
  const providerNames = formatAvailableGatewayProviderNames();
  return (
    <GatewayPlaceholder.Frame
      title={t("noProvidersYet")}
      description={t("noProvidersManagerDescription", {
        providers: providerNames,
      })}
    >
      <GatewayPlaceholder.Actions>
        <Button text={t("addProvider")} icon={Plus} onClick={onAddProvider} />
        <Button
          variant="outline"
          text={t("howToSetupGateway")}
          icon={BookOpen}
          href={GATEWAY_SETUP_DOCS_URL}
        />
      </GatewayPlaceholder.Actions>
      <NoProvidersDiagram addLabel={t("addProviderLabel")} />
      <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {getGatewaySetupHeroProviders(new Set()).map(({ provider }) => (
          <li key={provider}>
            <button
              type="button"
              onClick={() => onConnectProvider(provider)}
              className="hover:bg-accent/50 focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
            >
              <GatewayProviderMark provider={provider} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-bold">
                  {providerLabels[provider]}
                </span>
                <span className="text-muted-foreground text-xs">
                  {CREDENTIAL_SOURCES[provider]}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm">
                {t("connectProvider")}
                <ArrowRight size="sm" color="inherit" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </GatewayPlaceholder.Frame>
  );
}
