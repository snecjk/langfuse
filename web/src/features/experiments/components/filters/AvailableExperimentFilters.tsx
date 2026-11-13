import { type FilterState } from "@langfuse/shared";
import { ExperimentFilterAvailableChoice } from "./ExperimentFilterAvailableChoice";
import { experimentFilterCreationChoices } from "./experimentFilterCreationChoices";
import { type ExperimentFilterOptions } from "./experimentFilterTypes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export function AvailableExperimentFilters({
  options,
  optionsError,
  onAdd,
  portalContainer,
}: AvailableExperimentFiltersProps) {
  const t = useTranslation(experimentMessages);
  return (
    <div
      className="ph-no-capture flex flex-col gap-1"
      aria-label={t("availableFiltersAria")}
    >
      <p className="text-muted-foreground px-2 text-xs">
        {t("availableFilters")}
      </p>
      {experimentFilterCreationChoices(options, optionsError, t).map(
        (choice) => (
          <ExperimentFilterAvailableChoice
            key={choice.column}
            choice={choice}
            onAdd={onAdd}
            portalContainer={portalContainer}
          />
        ),
      )}
    </div>
  );
}

type AvailableExperimentFiltersProps = {
  options: ExperimentFilterOptions | undefined;
  optionsError: string | null;
  onAdd: (filter: FilterState[number]) => void;
  portalContainer: HTMLElement | null;
};
