import { type ReactNode } from "react";
import { Info } from "@langfuse/icons";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import { cn } from "@/src/utils/tailwind";
import { compactNumberFormatter } from "@/src/utils/numbers";
import { type TopicOperation } from "@langfuse/shared/topics";
import { type TimeRange } from "@/src/utils/date-range-utils";
import { TimeRangePicker } from "@/src/components/date-picker";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Button } from "@/src/components/design-system/Button/Button";
import { Checkbox } from "@/src/components/design-system/Checkbox/Checkbox";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { Stepper } from "@/src/components/design-system/Stepper/Stepper";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

export function ManualTopicsDialog({
  operation,
  onOperationChange,
  facets,
  selectedFacetIds,
  onToggleFacet,
  traceControls,
  count,
  generationTimeRange,
  onGenerationTimeRangeChange,
  models,
  reuse,
  onReuseChange,
  smallSample,
  onSmallSampleChange,
  canSubmit,
  isSubmitting,
  isCountingSummaries = false,
  disabledReason,
  error,
  onSubmit,
  onConfigure,
}: ManualTopicsDialogProps) {
  const t = useTranslation(topicsMessages);
  const minimum = smallSample ? 10 : 100;
  const selectedUpdates = facets.filter((facet) =>
    selectedFacetIds.includes(facet.id),
  );
  const noSummaries =
    selectedUpdates.length > 0 &&
    selectedUpdates.every((facet) => facet.summaries === 0);
  const belowMinimum = selectedUpdates.filter(
    (facet) => facet.summaries !== null && facet.summaries < minimum,
  );
  const facetLabel = selectedUpdates.length === 1 ? t("facet") : t("facets");
  const processingSummary =
    count > 0 ? (
      t("runOnFacets", {
        facets: `${selectedUpdates.length} ${facetLabel}`,
        traces: count.toLocaleString(),
      })
    ) : (
      <>{t("runToPreview")}</>
    );
  const storedSummaryCount = selectedUpdates.every(
    (facet) => facet.summaries !== null,
  )
    ? selectedUpdates.reduce(
        (total, facet) => total + (facet.summaries ?? 0),
        0,
      )
    : null;
  const generationSummary = (
    <>
      {selectedUpdates.length === 1
        ? t("facetSelected", { count: selectedUpdates.length })
        : t("facetsSelected", { count: selectedUpdates.length })}
      {storedSummaryCount !== null ? (
        <> · {t("summariesLabel", { count: storedSummaryCount })}</>
      ) : null}
    </>
  );
  function handleOperationChange(value: string) {
    onOperationChange(value as TopicOperation);
  }
  function handleReuseChange(value: boolean | "indeterminate") {
    onReuseChange(value === true);
  }
  function handleChooseSummarization() {
    onOperationChange("process");
  }
  return (
    <Dialog
      title={t("manualProcessing")}
      size="lg"
      actions={[
        {
          label:
            operation === "process"
              ? t("summarizeAndEmbed")
              : t("generateTopics"),
          disabled: !canSubmit,
          loading: isSubmitting,
          onClick: onSubmit,
        },
      ]}
    >
      <Dialog.Body>
        <div className="ph-no-capture flex flex-col gap-5 text-sm">
          <Tabs value={operation} onValueChange={handleOperationChange}>
            <Tabs.List
              variant="inset"
              size="md"
              layout="full"
              aria-label={t("manualProcessingOperation")}
            >
              <Tabs.Trigger
                value="process"
                label={t("summarizeTracesAndEmbed")}
              />
              <Tabs.Trigger value="update" label={t("generateTopics")} />
            </Tabs.List>
          </Tabs>
          <p className="text-muted-foreground">
            {operation === "process"
              ? t("manualProcessDescription")
              : t("manualUpdateDescription")}
          </p>
          <div className="flex flex-col">
            <Stepper
              number={1}
              title={t("chooseFacets")}
              description={
                operation === "process"
                  ? t("chooseFacetsProcess")
                  : t("chooseFacetsUpdate")
              }
            >
              <fieldset className="flex min-w-0 flex-col gap-3">
                <legend className="sr-only">{t("chooseFacets")}</legend>
                <div className="flex flex-wrap gap-2">
                  {facets.map((facet) => (
                    <FacetToggle
                      key={facet.id}
                      facet={facet}
                      selected={selectedFacetIds.includes(facet.id)}
                      operation={operation}
                      onToggleFacet={onToggleFacet}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  {t("selected", { count: selectedUpdates.length })}
                </p>
              </fieldset>
            </Stepper>
            <Stepper
              number={2}
              title={
                operation === "process"
                  ? t("selectTraces")
                  : t("selectTraceSummaries")
              }
              description={
                operation === "process"
                  ? t("selectTracesDescription")
                  : t("selectTraceSummariesDescription")
              }
            >
              <section hidden={operation !== "process"}>
                <div className="flex flex-col gap-4">{traceControls}</div>
              </section>
              {operation === "update" ? (
                <section className="self-start">
                  <TimeRangePicker
                    timeRange={generationTimeRange}
                    onTimeRangeChange={onGenerationTimeRangeChange}
                    timeRangePresets={[
                      "last1Day",
                      "last7Days",
                      "last30Days",
                      "last90Days",
                    ]}
                    maxRangeMs={90 * 86_400_000}
                    className="my-0"
                  />
                </section>
              ) : null}
            </Stepper>
            <Stepper number={3} title={t("reviewAndRun")}>
              <p role="status" className="ph-no-capture text-muted-foreground">
                {operation === "process"
                  ? processingSummary
                  : generationSummary}
              </p>
              {operation === "process" ? (
                <p>{t("manualProcessRunNote")}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-bold">{t("modelsStepTitle")}</span>
                <dl className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <dt className="text-muted-foreground">
                      {operation === "process"
                        ? t("summaryNoun")
                        : t("topicNaming")}
                    </dt>
                    <dd
                      title={
                        operation === "process"
                          ? models.summary.connection
                          : models.clustering.connection
                      }
                    >
                      {operation === "process"
                        ? models.summary.model
                        : models.clustering.model}
                    </dd>
                  </div>
                  {operation === "process" ? (
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <dt className="text-muted-foreground">
                        {t("embeddingModel")}:
                      </dt>
                      <dd title={models.embedding.connection}>
                        {models.embedding.model}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <div className="ml-auto">
                  <Button
                    text={t("configureTopics")}
                    variant="ghost"
                    size="sm"
                    onClick={onConfigure}
                  />
                </div>
              </div>
              {operation === "process" ? (
                <>
                  <div className="flex items-center gap-1 p-1">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        aria-label={t("reuseExisting")}
                        checked={reuse}
                        onCheckedChange={handleReuseChange}
                      />
                      {t("reuseExistingLabel")}
                    </label>
                    <Tooltip label={t("reuseExistingHelp")}>
                      {({ getTriggerProps }) => (
                        <IconButton
                          {...getTriggerProps()}
                          icon={Info}
                          label={t("reuseExisting")}
                          size="sm"
                        />
                      )}
                    </Tooltip>
                  </div>
                  <p>
                    <span className="font-bold">{t("modelCosts")}: </span>
                    <span className="text-muted-foreground">
                      {reuse ? t("modelCostsFree") : t("modelCostsIncurred")}
                    </span>
                  </p>
                </>
              ) : null}
              {operation === "update" ? (
                <>
                  <p className="text-muted-foreground text-xs">
                    {t("topicNamingHelp")}
                  </p>
                  <label className="flex items-start justify-between gap-4 rounded-md border p-3">
                    <span className="flex flex-col gap-1">
                      <span className="font-bold">{t("smallSampleMode")}</span>
                      <span className="text-muted-foreground text-xs">
                        {t("smallSampleModeHelp")}
                      </span>
                    </span>
                    <Switch
                      aria-label={t("smallSampleMode")}
                      checked={smallSample}
                      onCheckedChange={onSmallSampleChange}
                    />
                  </label>
                  {!isSubmitting &&
                  !isCountingSummaries &&
                  !disabledReason &&
                  !noSummaries &&
                  belowMinimum.length > 0 ? (
                    <Alert variant="warning" size="sm">
                      <Alert.Description>
                        <p>
                          {t("belowMinimumSkipped", {
                            facets: belowMinimum
                              .map((facet) => facet.name)
                              .join(", "),
                            minimum,
                          })}
                        </p>
                      </Alert.Description>
                    </Alert>
                  ) : null}
                </>
              ) : null}
              {!isSubmitting && disabledReason ? (
                <Alert variant="warning" size="sm">
                  <Alert.Description>
                    <div className="flex flex-col items-start gap-2">
                      <p>{disabledReason}</p>
                      {operation === "update" && noSummaries ? (
                        <Button
                          text={t("goToSummarize")}
                          variant="secondary"
                          size="sm"
                          onClick={handleChooseSummarization}
                        />
                      ) : null}
                    </div>
                  </Alert.Description>
                </Alert>
              ) : null}
              {error ? (
                <Alert variant="destructive" size="sm">
                  <Alert.Description>
                    <p>{error}</p>
                  </Alert.Description>
                </Alert>
              ) : null}
            </Stepper>
          </div>
        </div>
      </Dialog.Body>
    </Dialog>
  );
}

function FacetToggle({
  facet,
  selected,
  operation,
  onToggleFacet,
}: FacetToggleProps) {
  const t = useTranslation(topicsMessages);
  function handleCheckedChange(checked: boolean | "indeterminate") {
    onToggleFacet(facet.id, checked === true);
  }
  return (
    <label
      title={`${facet.description} (${facet.kind}, v${facet.version})`}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-2 transition-colors",
        selected
          ? "border-border-contrast bg-secondary"
          : "border-input text-muted-foreground hover:bg-accent",
      )}
    >
      <Checkbox
        aria-label={facet.name}
        checked={selected}
        onCheckedChange={handleCheckedChange}
      />
      <span className="self-baseline font-bold">{facet.name}</span>
      {operation === "update" ? (
        <span
          className="text-muted-foreground w-25 shrink-0 self-baseline truncate text-right text-xs tabular-nums"
          title={
            facet.summaries === null
              ? undefined
              : t("summariesLabel", { count: facet.summaries })
          }
        >
          {summaryLabel(facet.summaries, t)}
        </span>
      ) : null}
    </label>
  );
}

function summaryLabel(summaries: number | null, t: T) {
  if (summaries === null) return t("notCounted");
  if (summaries === 0) return t("noSummaries");
  const count =
    summaries > 1_000
      ? compactNumberFormatter(
          summaries,
          summaries < 10_000 ? 1 : 0,
        ).toLowerCase()
      : summaries.toLocaleString();
  return t("summariesCount", { count });
}

type Model = { model: string; connection: string };
export type ManualTopicsDialogProps = {
  operation: TopicOperation;
  onOperationChange: (operation: TopicOperation) => void;
  facets: {
    id: string;
    name: string;
    summaries: number | null;
    kind: string;
    version: number;
    description: string;
  }[];
  selectedFacetIds: string[];
  onToggleFacet: (id: string, selected: boolean) => void;
  traceControls: ReactNode;
  count: number;
  generationTimeRange: TimeRange;
  onGenerationTimeRangeChange: (range: TimeRange) => void;
  models: { summary: Model; embedding: Model; clustering: Model };
  reuse: boolean;
  onReuseChange: (reuse: boolean) => void;
  smallSample: boolean;
  onSmallSampleChange: (value: boolean) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  isCountingSummaries?: boolean;
  disabledReason: string | null;
  error: string | null;
  onSubmit: () => void;
  onConfigure: () => void;
};

type FacetToggleProps = Pick<
  ManualTopicsDialogProps,
  "operation" | "onToggleFacet"
> & {
  facet: ManualTopicsDialogProps["facets"][number];
  selected: boolean;
};
