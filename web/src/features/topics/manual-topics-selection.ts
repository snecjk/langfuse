import { type TopicOperation } from "@langfuse/shared/topics";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

export function manualTopicsSelection({
  operation,
  summaryCounts,
  traceCount,
  smallSample,
  t,
}: {
  operation: TopicOperation;
  summaryCounts: number[];
  traceCount: number;
  smallSample: boolean;
  t: T;
}): { ready: boolean; disabledReason: string | null } {
  if (summaryCounts.length === 0)
    return {
      ready: false,
      disabledReason: t("selectAtLeastOneFacet"),
    };
  if (operation === "process")
    return { ready: traceCount > 0, disabledReason: null };
  if (!summaryCounts.some((count) => count > 0))
    return {
      ready: false,
      disabledReason: t("noSummariesAvailable"),
    };
  const minimum = smallSample ? 10 : 100;
  if (!summaryCounts.some((count) => count >= minimum))
    return {
      ready: false,
      disabledReason: smallSample
        ? t("fewerThan10Summaries")
        : t("fewerThan100Summaries"),
    };
  return { ready: true, disabledReason: null };
}
