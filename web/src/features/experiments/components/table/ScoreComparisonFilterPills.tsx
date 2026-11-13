/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { BadgeShell } from "@/src/components/design-system/Badge/Badge";
import { Button } from "@/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { GitCompareArrows, X } from "@langfuse/icons";
import {
  describeScoreComparisonFilter,
  type ScoreComparisonFilter,
} from "@/src/features/experiments/fns/scoreComparisonFilter";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export type ScoreComparisonPill = {
  filter: ScoreComparisonFilter;
  scoreName: string;
  comparisonName: string;
};

/**
 * The active score comparisons, in plain English ("Worse groundedness than
 * judge-haiku-baseline") and removable — the same affordance the score filters
 * get, for the one predicate that is evaluated in the client.
 */
export const ScoreComparisonFilterPills = ({
  pills,
  onRemove,
}: {
  pills: ScoreComparisonPill[];
  onRemove: (filter: ScoreComparisonFilter) => void;
}) => {
  const t = useTranslation(experimentMessages);
  const locale = useInterfaceLocale();
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b px-2 py-2">
      {pills.map(({ filter, scoreName, comparisonName }) => {
        const label = describeScoreComparisonFilter({
          operator: filter.operator,
          scoreName,
          comparisonName,
          locale,
        });
        return (
          <BadgeShell key={`${filter.level}-${filter.scoreKey}`} color="filled">
            <GitCompareArrows size="sm" />
            <span className="truncate" title={label}>
              {label}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground shrink-0 cursor-default underline decoration-dotted">
                  {t("thisPage")}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                {t("thisPageTooltip")}
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 shrink-0 p-0 hover:bg-transparent"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(filter);
              }}
            >
              <X size="base" color="default" />
            </Button>
          </BadgeShell>
        );
      })}
    </div>
  );
};
