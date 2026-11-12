import { useEffect, useState } from "react";
import { Button } from "@/src/components/design-system/Button/Button";
import { type TopicSetupStage } from "./topic-setup-flow";
import {
  type TopicPile,
  TopicPilesIllustration,
} from "./TopicPilesIllustration";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

type TopicSetupProgressFacet = {
  key: string;
  name: string;
  complete: number;
  requested: number;
};

const PILE_SLOTS = [
  { name: "Group 1", slots: 9, color: "violet" },
  { name: "Group 2", slots: 6, color: "blue" },
  { name: "Group 3", slots: 4, color: "amber" },
] as const;

const TICK_MS = 260;

function stageLabel(
  stage: TopicSetupStage,
  t: ReturnType<typeof useTranslation<typeof topicsMessages>>,
): string {
  switch (stage) {
    case "summarizing":
      return t("stageSummarizing");
    case "grouping":
      return t("stageGrouping");
    case "naming":
      return t("stageNaming");
    case "done":
    case "failed":
      return "";
  }
}

/** First analysis in progress: one illustration, one line of copy and one progress bar. */
export function TopicSetupProgressView({
  canRetry,
  facets,
  onViewDetails,
  onRetry,
  retrying,
  stage,
  waiting = false,
}: TopicSetupProgressViewProps) {
  const t = useTranslation(topicsMessages);
  const failed = stage === "failed";
  const animate = !failed && !waiting;
  const tick = usePileTick(animate);
  const requested = Math.max(0, ...facets.map((facet) => facet.requested));
  const complete = Math.min(
    requested,
    ...facets.map((facet) => facet.complete),
  );
  const summarizing = stage === "summarizing";
  const processed = summarizing ? complete : requested;
  const percent = requested === 0 ? 0 : (processed / requested) * 100;
  const copy = progressCopy(failed, waiting, t);
  const piles: TopicPile[] = PILE_SLOTS.map((pile, index) => ({
    ...pile,
    detail: "",
    filled: pileFill(pile.slots, index, tick),
  }));
  return (
    <div className="flex flex-1 flex-col items-center-safe justify-center-safe gap-6 overflow-y-auto px-4 pb-35">
      <TopicPilesIllustration piles={piles} bare />
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl leading-tight font-bold tracking-tight text-balance">
          {copy.title}
        </h2>
        <p className="text-muted-foreground text-sm text-pretty">
          {failed && !canRetry ? t("firstAnalysisNoRetry") : copy.detail}
        </p>
      </div>
      {failed ? (
        <div className="flex items-center gap-2">
          {canRetry && onRetry && (
            <Button text={t("retry")} loading={retrying} onClick={onRetry} />
          )}
          {onViewDetails && (
            <Button
              text={t("seeRunDetails")}
              variant="ghost"
              onClick={onViewDetails}
            />
          )}
        </div>
      ) : null}
      {!failed && !waiting && (
        <div className="flex w-90 max-w-full flex-col gap-2">
          <div
            role="progressbar"
            aria-label={t("analysisProgress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            className="bg-muted h-1.5 overflow-hidden rounded-sm"
          >
            <div
              className="bg-foreground h-full rounded-sm transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-muted-foreground flex justify-between gap-2 text-xs">
            <span>{stageLabel(stage, t)}</span>
            {requested > 0 && (
              <span className="text-foreground font-mono">
                {processed.toLocaleString("en-US")} /{" "}
                {requested.toLocaleString("en-US")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Animation tick for the piles; stays at 0 when animation is off or motion is reduced. */
function usePileTick(enabled: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(
      () => setTick((current) => current + 1),
      TICK_MS,
    );
    return () => window.clearInterval(interval);
  }, [enabled]);
  return enabled ? tick : 0;
}

/** Piles fill and drain out of step; at tick 0 they sit near half full. */
function pileFill(slots: number, pileIndex: number, tick: number) {
  if (tick === 0) return Math.max(1, Math.round(slots / 2));
  return Math.max(
    1,
    Math.round(slots * (0.5 + 0.5 * Math.sin(tick * 0.12 + pileIndex * 1.7))),
  );
}

function progressCopy(
  failed: boolean,
  waiting: boolean,
  t: ReturnType<typeof useTranslation<typeof topicsMessages>>,
) {
  if (failed)
    return {
      title: t("firstAnalysisFailedTitle"),
      detail: t("firstAnalysisFailedDetail"),
    };
  if (waiting)
    return {
      title: t("waitingForTracesTitle"),
      detail: t("waitingForTracesDetail"),
    };
  return {
    title: t("analyzingTitle"),
    detail: t("analyzingDetail"),
  };
}

type TopicSetupProgressViewProps = {
  facets: TopicSetupProgressFacet[];
  stage: TopicSetupStage;
  retrying: boolean;
  canRetry: boolean;
  /** Opens the failed run in History. */
  onViewDetails?: () => void;
  onRetry?: () => void;
  /** Automatic processing is on but no trace has been summarized yet. */
  waiting?: boolean;
};
