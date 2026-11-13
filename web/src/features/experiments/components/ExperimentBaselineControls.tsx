import { useMemo } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Combobox,
  type ComboboxOptionGroup,
} from "@/src/components/ui/Combobox";
import { X } from "@langfuse/icons";
import { useExperimentNames } from "@/src/features/experiments/hooks/useExperimentNames";
import { formatRunRecency } from "@/src/features/experiments/fns/formatRunRecency";
import { NO_DATASET_KEY } from "@/src/features/experiments/constants/comparison";
import { cn } from "@/src/utils/tailwind";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { baselineChangedProps } from "@/src/features/experiments/lib/analytics";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

type ExperimentBaselineControlsProps = {
  projectId: string;
  baselineId?: string;
  baselineName?: string;
  onBaselineChange: (id: string) => void;
  onBaselineClear: () => void;
};

export function ExperimentBaselineControls({
  projectId,
  baselineId,
  baselineName,
  onBaselineChange,
  onBaselineClear,
}: ExperimentBaselineControlsProps) {
  const { experimentNames, isLoading } = useExperimentNames({
    projectId,
  });
  const capture = usePostHogClientCapture();
  const locale = useInterfaceLocale();
  const t = useTranslation(experimentMessages);

  // `baseline_changed` fires from the two paths through this control — picking a
  // run and clearing it. Arriving on the page with a baseline already set (a row
  // click on the list, a shared link) is navigation rather than use of this
  // control, and is deliberately not counted; the results pageview is that
  // denominator.

  // Grouped by dataset and dated, so two runs sharing a name are two readable
  // options rather than the same label twice.
  const baselineOptionGroups = useMemo<ComboboxOptionGroup<string>[]>(() => {
    const byDataset = new Map<string, ComboboxOptionGroup<string>>();

    for (const experiment of experimentNames) {
      const datasetKey = experiment.datasetId ?? NO_DATASET_KEY;
      const group = byDataset.get(datasetKey) ?? {
        heading:
          experiment.datasetId === null
            ? t("noDataset")
            : (experiment.datasetName ?? t("deletedDataset")),
        options: [],
      };
      group.options.push({
        value: experiment.experimentId,
        label: experiment.experimentName,
        badge: formatRunRecency(experiment.startTime, locale),
      });
      byDataset.set(datasetKey, group);
    }

    return [...byDataset.values()];
  }, [experimentNames, locale, t]);

  return (
    <div className="flex min-w-0 items-center">
      <div className="min-w-0 flex-1">
        <Combobox
          options={baselineOptionGroups}
          value={baselineId}
          onValueChange={(id) => {
            if (id === baselineId) return;
            capture(
              "experiment:baseline_changed",
              baselineChangedProps({
                tableName: "experiment-items",
                source: "picker",
              }),
            );
            onBaselineChange(id);
          }}
          placeholder={
            baselineName ?? baselineId ?? t("selectBaselinePlaceholder")
          }
          emptyText={t("noExperimentsFound")}
          searchPlaceholder={t("searchExperiments")}
          disabled={isLoading}
          className={cn(
            "rounded-l-none border-l-0",
            baselineId && "rounded-r-none",
          )}
        />
      </div>

      {baselineId && (
        <Button
          variant="outline"
          size="icon"
          className="-ml-px shrink-0 rounded-l-none"
          onClick={() => {
            capture(
              "experiment:baseline_changed",
              baselineChangedProps({
                tableName: "experiment-items",
                source: "clear",
              }),
            );
            onBaselineClear();
          }}
          disabled={isLoading}
          title={t("clearBaseline")}
          aria-label={t("clearBaseline")}
        >
          <X size="base" color="default" />
        </Button>
      )}
    </div>
  );
}
