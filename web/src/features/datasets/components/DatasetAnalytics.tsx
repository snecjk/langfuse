import { DropdownMenuItem } from "@/src/components/ui/dropdown-menu";
import { RESOURCE_METRICS } from "@/src/features/dashboard/lib/score-analytics-utils";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { MultiSelectKeyValues } from "@/src/features/scores/components/MultiSelectKeyValues";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

export function DatasetAnalytics(props: {
  scoreOptions: { key: string; value: string }[];
  selectedMetrics: string[];
  setSelectedMetrics: (metrics: string[]) => void;
}) {
  const t = useTranslation(datasetsMessages);
  const capture = usePostHogClientCapture();
  return (
    <MultiSelectKeyValues
      className="max-w-fit focus:ring-0! focus:ring-offset-0!"
      placeholder={t("search")}
      title={t("charts")}
      variant="outline"
      hideClearButton
      showSelectedValueStrings={false}
      onValueChange={(values, changedValue, selectedKeys) => {
        if (values.length === 0) props.setSelectedMetrics([]);

        if (changedValue) {
          if (selectedKeys?.has(changedValue)) {
            props.setSelectedMetrics([...props.selectedMetrics, changedValue]);
            capture("dataset_run:charts_view_added");
          } else {
            capture("dataset_run:charts_view_removed");
            props.setSelectedMetrics(
              props.selectedMetrics.filter((key) => key !== changedValue),
            );
          }
        }
      }}
      values={props.selectedMetrics}
      options={RESOURCE_METRICS}
      groupedOptions={[
        { label: t("scoresGroup"), options: props.scoreOptions },
      ]}
      controlButtons={
        <DropdownMenuItem
          onSelect={() => {
            props.setSelectedMetrics([]);
          }}
        >
          {t("hideAllCharts")}
        </DropdownMenuItem>
      }
    />
  );
}
