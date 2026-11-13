import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

type NotRecordedMetricProps = {
  metric: "cost" | "latency";
  /** Injected by callers that already hold a translator. */
  t?: ReturnType<typeof useTranslation<typeof experimentMessages>>;
};

/**
 * A bare `0` or `-` for cost or latency reads as broken instrumentation, so name
 * what is missing instead.
 */
export const NotRecordedMetric = ({
  metric,
  t: tProp,
}: NotRecordedMetricProps) => {
  const tOwn = useTranslation(experimentMessages);
  const t = tProp ?? tOwn;
  return (
    <Tooltip
      label={metric === "cost" ? t("notRecordedCost") : t("notRecordedLatency")}
    >
      {({ getTriggerProps }) => (
        <span
          {...getTriggerProps()}
          className="text-muted-foreground/70 cursor-default"
        >
          {t("notRecorded")}
        </span>
      )}
    </Tooltip>
  );
};
