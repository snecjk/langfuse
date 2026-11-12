import type { GatewayModelCount } from "@/src/features/ai-gateway/components/GatewayModelsPage/types/gatewayModelCount";
import type { GatewayConnection } from "@/src/features/ai-gateway/types/gatewayProvider";

export function describeGatewayModelCount(
  modelCount: GatewayModelCount | "loading" | undefined,
  status: GatewayConnection["status"] | undefined,
  t: (
    key:
      | "credentialRejected"
      | "loadingEllipsis"
      | "allModelsEnabled"
      | "modelsEnabledCount"
      | "modelsEnabledOfTotal",
    params?: Record<string, string | number>,
  ) => string,
) {
  if (status === "ERROR") return t("credentialRejected");
  if (modelCount === "loading") return t("loadingEllipsis");
  if (modelCount === undefined) return "—";
  if (modelCount.enabled === "all") return t("allModelsEnabled");
  if (modelCount.total === undefined)
    return t("modelsEnabledCount", { count: String(modelCount.enabled) });
  return t("modelsEnabledOfTotal", {
    enabled: String(modelCount.enabled),
    total: String(modelCount.total),
  });
}
