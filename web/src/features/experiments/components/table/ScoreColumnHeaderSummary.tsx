import { type ReactNode } from "react";
import { HoverCard } from "@/src/components/design-system/HoverCard/HoverCard";
import { DiffLabel } from "@/src/features/datasets/components/DiffLabel";
import { splitScoreDataTypeIcon } from "@/src/features/scores/lib/scoreColumns";
import {
  type ScoreColumnAggregate,
  type ScoreColumnDataType,
  type ScoreColumnSummary,
} from "@/src/features/experiments/fns/summariseScoreColumn";
import {
  formatScoreColumnAggregate,
  formatScoreValue,
} from "@/src/features/experiments/fns/formatScoreColumnAggregate";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";
import { type Locale } from "@/src/features/i18n/locale";

type ScoreHeaderT = ReturnType<
  typeof useTranslation<typeof experimentMessages>
>;

const SummaryRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const movementCountsTitle = (summary: ScoreColumnSummary, t: ScoreHeaderT) => {
  const { movement } = summary;
  if (!movement) return "";
  return [
    movement.improved
      ? t("improvedCountInline", { count: movement.improved })
      : null,
    movement.regressed
      ? t("regressedCountInline", { count: movement.regressed })
      : null,
    movement.changed
      ? t("changedCountInline", { count: movement.changed })
      : null,
  ]
    .filter(Boolean)
    .join(", ");
};

const hasMovementCounts = (summary: ScoreColumnSummary) => {
  const { movement } = summary;
  return Boolean(
    movement && (movement.improved || movement.regressed || movement.changed),
  );
};

const ComparisonHoverCard = ({
  dataType,
  summary,
  comparisonName,
  hasBaseline,
  children,
  t,
  locale,
}: {
  dataType: ScoreColumnDataType;
  summary: ScoreColumnSummary;
  comparisonName?: string;
  hasBaseline: boolean;
  children: ReactNode;
  t: ScoreHeaderT;
  locale: Locale;
}) => {
  const { baseline, comparison, movement } = summary;

  return (
    <HoverCard
      placement="bottom-start"
      content={
        <div className="flex w-64 flex-col gap-1 p-3 font-normal">
          <SummaryRow
            label={hasBaseline ? t("baseline") : t("thisExperiment")}
            value={
              baseline
                ? formatScoreColumnAggregate(baseline, locale)
                : t("noValues")
            }
          />
          {movement && (
            <>
              <SummaryRow
                label={comparisonName ?? t("comparison")}
                value={
                  comparison
                    ? formatScoreColumnAggregate(comparison, locale)
                    : t("noValues")
                }
              />
              {dataType === "CATEGORICAL" ? (
                <SummaryRow
                  label={t("changedValue")}
                  value={`↻${movement.changed}`}
                />
              ) : (
                <>
                  <SummaryRow
                    label={t("improved")}
                    value={
                      <span className="text-dark-green font-bold">
                        ↗{movement.improved}
                      </span>
                    }
                  />
                  <SummaryRow
                    label={t("regressed")}
                    value={
                      <span className="text-dark-red font-bold">
                        ↘{movement.regressed}
                      </span>
                    }
                  />
                </>
              )}
              <SummaryRow label={t("unchanged")} value={movement.unchanged} />
              <SummaryRow
                label={t("notScored")}
                value={movement.notComparable}
              />
            </>
          )}
        </div>
      }
    >
      {({ getTriggerProps }) => (
        <div
          className="flex min-w-0 cursor-default flex-col"
          tabIndex={0}
          {...getTriggerProps()}
        >
          {children}
        </div>
      )}
    </HoverCard>
  );
};

const BaselineHeaderLine = ({
  baseline,
  baselineText,
  t,
}: {
  baseline: ScoreColumnAggregate | null;
  baselineText: string;
  t: ScoreHeaderT;
}) => (
  <span className="text-muted-foreground flex flex-wrap items-center gap-x-1 text-[10px] leading-tight font-normal tabular-nums">
    {baseline ? (
      <>
        <span
          className="text-foreground min-w-0 truncate font-bold"
          title={baselineText}
        >
          {baselineText}
        </span>
        {baseline.kind === "average" && (
          <span className="text-muted-foreground">{t("avgLabel")}</span>
        )}
      </>
    ) : (
      <span>{t("noValues")}</span>
    )}
  </span>
);

const ComparisonHeaderLine = ({
  summary,
  dataType,
  t,
  locale,
}: {
  summary: ScoreColumnSummary;
  dataType: ScoreColumnDataType;
  t: ScoreHeaderT;
  locale: Locale;
}) => {
  const { comparison, delta } = summary;
  const deltaToShow = delta !== null && delta !== 0 ? delta : null;
  const comparisonText = comparison
    ? formatScoreColumnAggregate(comparison, locale)
    : t("noValues");

  return (
    <span className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-1 overflow-hidden text-[10px] leading-tight font-normal tabular-nums">
      <span className="min-w-0 truncate" title={comparisonText}>
        {comparisonText}
      </span>
      {deltaToShow !== null && (
        <DiffLabel
          plain
          diff={{
            type: "NUMERIC",
            absoluteDifference: Math.abs(deltaToShow),
            direction: deltaToShow > 0 ? "+" : "-",
          }}
          formatValue={formatScoreValue}
        />
      )}
      {hasMovementCounts(summary) && summary.movement && (
        <span
          className="min-w-0 truncate"
          title={movementCountsTitle(summary, t)}
        >
          {dataType === "CATEGORICAL" ? (
            summary.movement.changed > 0 && (
              <span className="pr-1">↻{summary.movement.changed}</span>
            )
          ) : (
            <>
              {summary.movement.improved > 0 && (
                <span className="text-dark-green pr-1 font-bold">
                  ↗{summary.movement.improved}
                </span>
              )}
              {summary.movement.regressed > 0 && (
                <span className="text-dark-red pr-1 font-bold">
                  ↘{summary.movement.regressed}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </span>
  );
};

/**
 * A score column's header, carrying the analysis instead of only the column's
 * name: the baseline experiment's aggregate, and — with comparisons selected —
 * one line per comparison with that run's aggregate, the signed delta, and how
 * many items moved which way.
 */
export const ScoreColumnHeaderSummary = ({
  label,
  dataType,
  summaries,
  comparisonNames,
  hasBaseline,
  expanded,
  filterMenu,
}: {
  label: string;
  dataType: ScoreColumnDataType;
  summaries: ScoreColumnSummary[];
  comparisonNames: string[];
  /**
   * Whether the run the aggregate belongs to is the selected baseline. With
   * comparisons but no baseline the first selected run stands in, and calling
   * that a baseline claims a selection the user has not made.
   */
  hasBaseline: boolean;
  expanded: boolean;
  /** The column's way into the score comparison filter, rendered beside the name. */
  filterMenu?: ReactNode;
}) => {
  const { icon, label: nameLabel } = splitScoreDataTypeIcon(label);
  const t = useTranslation(experimentMessages);
  const locale = useInterfaceLocale();
  const baseline = summaries[0]?.baseline ?? null;
  const comparisonSummaries = summaries.filter(
    (summary) => summary.movement !== null,
  );
  const baselineText = baseline
    ? formatScoreColumnAggregate(baseline, locale)
    : t("noValues");

  return (
    // The filter menu sits outside the hover-card trigger so its own popover is
    // not fighting the hover card for the pointer.
    <div className="flex min-w-0 flex-1 items-start gap-1">
      <div className="flex min-w-0 flex-1 cursor-default flex-col gap-0.5 py-0.5">
        <span className="flex min-w-0 items-baseline gap-1">
          {icon && (
            <span className="text-muted-foreground shrink-0">{icon}</span>
          )}
          <span className="truncate" title={label}>
            {nameLabel}
          </span>
        </span>
        {expanded &&
          summaries[0] &&
          (comparisonSummaries.length === 0 ? (
            <ComparisonHoverCard
              dataType={dataType}
              summary={summaries[0]}
              hasBaseline={hasBaseline}
              t={t}
              locale={locale}
            >
              <BaselineHeaderLine
                baseline={baseline}
                baselineText={baselineText}
                t={t}
              />
            </ComparisonHoverCard>
          ) : (
            <>
              <BaselineHeaderLine
                baseline={baseline}
                baselineText={baselineText}
                t={t}
              />
              {comparisonSummaries.map((summary, index) => (
                <ComparisonHoverCard
                  key={comparisonNames[index] ?? index}
                  dataType={dataType}
                  summary={summary}
                  comparisonName={comparisonNames[index]}
                  hasBaseline={hasBaseline}
                  t={t}
                  locale={locale}
                >
                  <ComparisonHeaderLine
                    summary={summary}
                    dataType={dataType}
                    t={t}
                    locale={locale}
                  />
                </ComparisonHoverCard>
              ))}
            </>
          ))}
      </div>
      {filterMenu}
    </div>
  );
};
