import { useMemo } from "react";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import { decomposeAggregateScoreKey } from "@/src/features/scores/lib/aggregateScores";
import { summariseScoreColumn } from "../../fns/summariseScoreColumn";
import {
  formatScoreColumnAggregate,
  formatScoreValue,
} from "../../fns/formatScoreColumnAggregate";
import { DiffLabel } from "@/src/features/datasets/components/DiffLabel";
import { type ExperimentItemsTableRow } from "./types";
import { type VisibilityState } from "@tanstack/react-table";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

type ExperimentGridSummaryT = ReturnType<
  typeof useTranslation<typeof experimentMessages>
>;

export function ExperimentGridSummaryValues({
  rows,
  experimentId,
  baselineExperimentId,
  observationScoreOrder,
  traceScoreOrder,
  columnVisibility,
  showScoreLevelLabels,
  isLoading,
  expanded,
  showScoreNames,
  onToggle,
  t: tProp,
}: {
  rows: ExperimentItemsTableRow[];
  experimentId: string;
  baselineExperimentId?: string;
  observationScoreOrder: string[];
  traceScoreOrder: string[];
  columnVisibility: VisibilityState;
  showScoreLevelLabels: boolean;
  isLoading: boolean;
  expanded: boolean;
  showScoreNames: boolean;
  onToggle: () => void;
  /** Injected by ExperimentGridView so the whole cell shares one translator. */
  t?: ExperimentGridSummaryT;
}) {
  const tOwn = useTranslation(experimentMessages);
  const t = tProp ?? tOwn;
  const locale = useInterfaceLocale();
  const hasComparison =
    !!baselineExperimentId && experimentId !== baselineExperimentId;
  const scores = useMemo(
    () =>
      [
        ...observationScoreOrder.map((key) => ({
          key,
          field: "observationScores" as const,
          level: "observation" as const,
          columnId: key,
        })),
        ...traceScoreOrder.map((key) => ({
          key,
          field: "traceScores" as const,
          level: "trace" as const,
          columnId: `Trace-${key}`,
        })),
      ]
        .filter((score) => columnVisibility[score.columnId] !== false)
        .flatMap((score) => {
          const { name, dataType, source } = decomposeAggregateScoreKey(
            score.key,
          );
          if (
            dataType !== "NUMERIC" &&
            dataType !== "BOOLEAN" &&
            dataType !== "CATEGORICAL"
          )
            return [];
          const summary = summariseScoreColumn({
            pairs: rows.map((row) => ({
              baseline:
                row.experiments.find(
                  (exp) => exp.experimentId === experimentId,
                )?.[score.field]?.[score.key] ?? null,
              comparison:
                row.experiments.find(
                  (exp) => exp.experimentId === baselineExperimentId,
                )?.[score.field]?.[score.key] ?? null,
            })),
            dataType,
            hasComparison,
          });
          return [{ ...score, name, dataType, source, summary }];
        }),
    [
      observationScoreOrder,
      traceScoreOrder,
      columnVisibility,
      rows,
      experimentId,
      baselineExperimentId,
      hasComparison,
    ],
  );

  return (
    <div className="border-t py-1">
      <div className="h-6">
        {showScoreNames && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex h-6 items-center gap-1 rounded text-left text-[10px] font-normal focus-visible:ring-2 focus-visible:outline-none"
          >
            {expanded ? (
              <DropdownIndicator size="sm" nudge />
            ) : (
              <DropdownIndicator direction="right" size="sm" nudge />
            )}
            {t("summaryThisPage", { count: rows.length })}
          </button>
        )}
      </div>
      {expanded &&
        scores.map((score) => {
          const { name, dataType, source, summary } = score;
          const { baseline: aggregate, delta, movement } = summary;
          let aggregateLabel = t("notScored");
          if (aggregate) {
            aggregateLabel =
              aggregate.kind === "average"
                ? formatScoreValue(aggregate.value)
                : formatScoreColumnAggregate(aggregate, locale);
          }
          const value = isLoading ? t("loadingAriaLabel") : aggregateLabel;
          const label = showScoreLevelLabels
            ? `${score.level === "trace" ? t("trace") : t("observation")}: ${name}`
            : name;
          return (
            <div
              key={score.columnId}
              className="flex h-7 min-w-0 items-center gap-4 px-1 font-normal tabular-nums"
              aria-label={`${label}: ${value}`}
            >
              {showScoreNames && (
                <span
                  className="min-w-0 flex-1 truncate text-xs"
                  title={`${label} (${source.toLowerCase()}, ${dataType.toLowerCase()})`}
                >
                  {label}
                </span>
              )}
              <div className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
                <span
                  className="text-foreground min-w-0 truncate text-xs font-bold"
                  title={value}
                >
                  {value}
                </span>
                {!isLoading &&
                  !hasComparison &&
                  aggregate?.kind === "average" && (
                    <span className="text-muted-foreground text-xs">
                      {t("avgLabel")}
                    </span>
                  )}
                {!isLoading && delta !== null && delta !== 0 && (
                  <DiffLabel
                    plain
                    diff={{
                      type: "NUMERIC",
                      absoluteDifference: Math.abs(delta),
                      direction: delta < 0 ? "-" : "+",
                    }}
                    formatValue={formatScoreValue}
                  />
                )}
              </div>
              {!isLoading && movement && (
                <div
                  className="flex shrink-0 items-center gap-2 text-xs font-normal"
                  title={t("itemsChangedTitle", {
                    changed: movement.changed,
                    unchanged: movement.unchanged,
                    uncomparable: movement.notComparable,
                  })}
                >
                  {dataType === "CATEGORICAL" ? (
                    <span
                      aria-label={t("changedItemsCount", {
                        count: movement.changed,
                      })}
                    >
                      ↻ {movement.changed}
                    </span>
                  ) : (
                    <>
                      <span
                        className="text-dark-green"
                        title={t("improvedItems")}
                        aria-label={t("improvedItemsCount", {
                          count: movement.improved,
                        })}
                      >
                        ↗ {movement.improved}
                      </span>
                      <span
                        className="text-dark-red"
                        title={t("regressedItems")}
                        aria-label={t("regressedItemsCount", {
                          count: movement.regressed,
                        })}
                      >
                        ↘ {movement.regressed}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      {expanded && scores.length === 0 && showScoreNames && (
        <span className="text-muted-foreground text-xs">
          {isLoading ? t("loadingScores") : t("noScoresSelected")}
        </span>
      )}
    </div>
  );
}
