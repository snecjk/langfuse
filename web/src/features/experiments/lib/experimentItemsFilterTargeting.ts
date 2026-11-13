import {
  type FieldRef,
  type FilterTargeting,
} from "@/src/features/search-bar/lib/fields";
import { getExperimentColorStyles } from "@/src/features/experiments/components/table/types";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type experimentMessages } from "@/src/features/i18n/messages/experiments";

type TargetingT = ReturnType<typeof useTranslation<typeof experimentMessages>>;

/**
 * The canonical name the "all" pseudo-experiment carries in persisted filter
 * payloads (URLs, saved views). Stable across languages — it identifies the
 * target in stored state, not a UI label.
 */
export const ALL_EXPERIMENTS_TARGET_NAME = "All experiments";

export function experimentItemsFilterTargeting({
  baselineId,
  experimentIds,
  experiments,
  colorExperimentIds,
  scoreTypesError,
  t,
}: {
  baselineId?: string;
  experimentIds: readonly string[];
  experiments: readonly {
    experimentId: string;
    experimentName: string;
    datasetName?: string | null;
  }[];
  colorExperimentIds: string[];
  scoreTypesError?: string;
  t: TargetingT;
}): FilterTargeting {
  const experimentsById = new Map(
    experiments.map((experiment) => [experiment.experimentId, experiment]),
  );
  const selectedExperiments = experimentIds.map(
    (experimentId) =>
      experimentsById.get(experimentId) ?? {
        experimentId,
        experimentName: experimentId,
        datasetName: null,
      },
  );
  const names = selectedExperiments.map(
    (experiment) => experiment.experimentName,
  );
  const labels = selectedExperiments.map((experiment) =>
    names.filter((name) => name === experiment.experimentName).length > 1 ||
    experiment.experimentName === ALL_EXPERIMENTS_TARGET_NAME
      ? `${experiment.experimentName} (${experiment.datasetName ?? t("dataset")})`
      : experiment.experimentName,
  );
  return {
    defaultTarget: "all",
    scoreTypesError,
    legacyDefaultTarget: baselineId ? "baseline" : experimentIds[0],
    targets: [
      {
        id: "all",
        // Canonical keyword token; display label carries the translation.
        label: ALL_EXPERIMENTS_TARGET_NAME,
        displayLabel: t("allExperiments"),
        keyword: true,
      },
      ...(baselineId
        ? [
            {
              id: "baseline",
              // The keyword `label` is the canonical, machine-readable token
              // that appears in persisted query text; the display label is
              // what the sidebar renders.
              label: "baseline",
              displayLabel: t("baseline"),
              keyword: true,
              textClassName: getExperimentColorStyles(
                baselineId,
                colorExperimentIds,
              ).textClass,
            },
          ]
        : []),
      ...selectedExperiments.map((experiment, index) => ({
        id: experiment.experimentId,
        label:
          labels.filter((label) => label === labels[index]).length > 1
            ? `${labels[index]} [${experiment.experimentId}]`
            : labels[index],
        textClassName: getExperimentColorStyles(
          experiment.experimentId,
          colorExperimentIds,
        ).textClass,
      })),
    ],
    supports: supportsExperimentItemFilterTarget,
  };
}

function supportsExperimentItemFilterTarget(field: FieldRef): boolean {
  return (
    field.type === "scores" ||
    field.type === "metadata" ||
    (field.type === "field" && field.field.id === "level")
  );
}
