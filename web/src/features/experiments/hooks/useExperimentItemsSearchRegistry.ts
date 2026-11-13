import { useMemo } from "react";
import { EXPERIMENT_ITEMS_FIELD_REGISTRY } from "@/src/features/experiments/constants/experimentItemsSearchRegistry";
import { experimentItemsFilterTargeting } from "@/src/features/experiments/lib/experimentItemsFilterTargeting";
import type { FieldRegistry } from "@/src/features/search-bar/lib/fields";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export function useExperimentItemsSearchRegistry({
  baselineId,
  experimentIds,
  selectedExperiments,
  colorExperimentIds,
  optionsError,
}: {
  baselineId?: string;
  experimentIds: readonly string[];
  selectedExperiments: readonly {
    experimentId: string;
    experimentName: string;
    datasetName?: string | null;
  }[];
  colorExperimentIds: string[];
  optionsError: string | null;
}): FieldRegistry {
  const t = useTranslation(experimentMessages);
  return useMemo(
    () => ({
      ...EXPERIMENT_ITEMS_FIELD_REGISTRY,
      targeting: experimentItemsFilterTargeting({
        baselineId,
        experimentIds,
        experiments: selectedExperiments,
        colorExperimentIds,
        scoreTypesError: optionsError ?? undefined,
        t,
      }),
    }),
    [
      baselineId,
      experimentIds,
      selectedExperiments,
      colorExperimentIds,
      optionsError,
      t,
    ],
  );
}
