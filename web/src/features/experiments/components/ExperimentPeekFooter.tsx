import { ArrowLeft, ArrowRight } from "@langfuse/icons";
import { Button } from "@/src/components/ui/button";
import { ExperimentRunBadge } from "./ExperimentRunBadge";
import { useExperimentPeekNavigation } from "../hooks/useExperimentPeekNavigation";
import { useExperimentNames } from "../hooks/useExperimentNames";
import { getExperimentColorStyles } from "./table/types";
import { cn } from "@/src/utils/tailwind";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export function ExperimentPeekFooter({ projectId }: { projectId: string }) {
  const {
    currentExperimentId,
    currentIndex,
    total,
    allExperimentIds,
    hasPrev,
    hasNext,
    goToPrev,
    goToNext,
  } = useExperimentPeekNavigation();
  const t = useTranslation(experimentMessages);

  const { experimentNames } = useExperimentNames({ projectId });
  const currentName =
    experimentNames.find((e) => e.experimentId === currentExperimentId)
      ?.experimentName ??
    currentExperimentId?.slice(0, 8) ??
    t("unknown");
  const colorStyles = currentExperimentId
    ? getExperimentColorStyles(currentExperimentId, allExperimentIds)
    : undefined;

  return (
    <div className="flex h-7 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn("truncate text-xs font-bold", colorStyles?.textClass)}
          title={currentName}
        >
          {currentName}
        </span>
        <ExperimentRunBadge colorClass={colorStyles?.badgeClass} strong>
          {currentIndex === 0 ? t("baseline") : t("comp")}
        </ExperimentRunBadge>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="gap-1.5 px-2"
          disabled={!hasPrev}
          onClick={goToPrev}
          title={t("previousExperiment")}
        >
          <ArrowLeft size="base" color="default" />
        </Button>
        <span className="text-muted-foreground px-1 font-mono text-[10px] tabular-nums">
          {currentIndex + 1}/{total}
        </span>
        <Button
          variant="outline"
          className="gap-1.5 px-2"
          disabled={!hasNext}
          onClick={goToNext}
          title={t("nextExperiment")}
        >
          <ArrowRight size="base" color="default" />
        </Button>
      </div>
    </div>
  );
}
