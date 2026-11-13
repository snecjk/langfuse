import { Clock, Info } from "@langfuse/icons";
import { assertUnreachable } from "@/src/utils/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { notificationMessages } from "@/src/features/i18n/messages/notifications";
import type { ScoreAnalyticsContextValue } from "./ScoreAnalyticsProvider";
import { SamplingDetailsHoverCard } from "./SamplingDetailsHoverCard";

type ScoreAnalyticsNoticeBannerProps =
  | {
      variant: "loading";
      estimate: ScoreAnalyticsContextValue["estimate"];
    }
  | {
      variant: "sampled";
      data: NonNullable<ScoreAnalyticsContextValue["data"]>;
    };

export function ScoreAnalyticsNoticeBanner(
  props: ScoreAnalyticsNoticeBannerProps,
) {
  const t = useTranslation(notificationMessages);
  if (props.variant === "loading") {
    const { estimate } = props;
    const showLargeDataset = Boolean(
      estimate && estimate.estimatedMatchedCount > 100_000,
    );

    return (
      <div className="bg-muted mb-4 rounded-md px-4 py-3">
        <div className="flex items-start gap-3">
          <Clock size="base" color="muted" __rawClassName="mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="text-sm font-bold">
              {showLargeDataset
                ? t("scoreAnalyticsProcessingLarge")
                : t("scoreAnalyticsLoading")}
            </div>
            {estimate && (
              <div className="text-muted-foreground text-sm">
                {estimate.mode === "single"
                  ? t("scoreAnalyticsAnalyzingOne", {
                      count: Math.round(estimate.score1Count).toLocaleString(),
                    })
                  : t("scoreAnalyticsAnalyzingTwo", {
                      count1: Math.round(estimate.score1Count).toLocaleString(),
                      count2: Math.round(estimate.score2Count).toLocaleString(),
                    })}
                {estimate.willSample &&
                  ` • ${t("scoreAnalyticsSamplingApplied")}`}
                {estimate.estimatedQueryTime && (
                  <>
                    {" • "}
                    {t("scoreAnalyticsEstimatedTime", {
                      time: estimate.estimatedQueryTime,
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (props.variant === "sampled") {
    const { data } = props;
    const samplingRate = (data.samplingMetadata.samplingRate * 100).toFixed(2);
    const score1Count =
      data.samplingMetadata.preflightEstimates?.score1Count.toLocaleString();

    return (
      <div className="bg-muted mb-4 rounded-md px-4 py-3">
        <div className="flex items-start gap-3">
          <Info size="base" color="muted" __rawClassName="mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold">
              {t("scoreAnalyticsSampledTitle")}
              <SamplingDetailsHoverCard
                samplingMetadata={data.samplingMetadata}
                mode={data.metadata.mode}
              />
            </div>
            <div className="text-muted-foreground text-sm">
              {data.metadata.mode === "single"
                ? t("scoreAnalyticsSampledOne", {
                    rate: samplingRate,
                    count: score1Count ?? "",
                  })
                : t("scoreAnalyticsSampledTwo", {
                    rate: samplingRate,
                    count1: score1Count ?? "",
                    count2:
                      data.samplingMetadata.preflightEstimates?.score2Count.toLocaleString() ??
                      "",
                  })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return assertUnreachable(props);
}
