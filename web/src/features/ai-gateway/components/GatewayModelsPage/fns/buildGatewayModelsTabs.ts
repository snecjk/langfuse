import type { PageTabsProps } from "@/src/components/layouts/PageTabs";
import {
  GATEWAY_MODELS_TABS,
  type GatewayModelsTab,
} from "@/src/features/ai-gateway/constants/gatewayModelsTabs";
import { GATEWAY_PAGE_SLUGS } from "@/src/features/ai-gateway/constants/gatewayPageSlugs";
import { buildGatewayPagePath } from "@/src/features/ai-gateway/fns/gatewayUrls/buildGatewayPagePath";

export function buildGatewayModelsTabs({
  organizationId,
  activeTab,
  t,
}: {
  organizationId: string;
  activeTab: GatewayModelsTab;
  t: (key: "providersTab" | "modelsTab") => string;
}): PageTabsProps {
  const href = buildGatewayPagePath(organizationId, GATEWAY_PAGE_SLUGS.models);
  return {
    activeTab,
    tabs: [
      { value: GATEWAY_MODELS_TABS.providers, label: t("providersTab"), href },
      {
        value: GATEWAY_MODELS_TABS.models,
        label: t("modelsTab"),
        href,
        querySelector: () => ({ tab: GATEWAY_MODELS_TABS.models }),
      },
    ],
  };
}
