import { HorizontalBarChart } from "@/src/components/design-system/charts/HorizontalBarChart/HorizontalBarChart";
import { useInterfaceLocale } from "@/src/features/i18n/I18nProvider";
import { type ChartProps } from "@/src/features/widgets/chart-library/chart-props";
import {
  formatMetric,
  toFullMetricString,
} from "@/src/features/widgets/chart-library/utils";

export function TopListChart({
  data,
  config,
  metricFormatter = formatMetric,
}: ChartProps) {
  const locale = useInterfaceLocale();
  return (
    <HorizontalBarChart
      data={(data ?? []).map((row) => ({
        label: row.dimension ?? "n/a",
        value:
          typeof row.metric === "number" ? row.metric : Number(row.metric ?? 0),
      }))}
      valueFormatter={(value) =>
        toFullMetricString(metricFormatter(value, { style: "compact", locale }))
      }
      color={config?.metric?.color ?? "hsl(var(--chart-fill-1))"}
    />
  );
}
