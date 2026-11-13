import React, { useMemo } from "react";
import {
  useInterfaceLocale,
  useTranslation,
} from "@/src/features/i18n/I18nProvider";
import { widgetMessages } from "@/src/features/i18n/messages/widgets";
import { PieChart as DesignSystemPieChart } from "@/src/components/design-system/charts/PieChart/PieChart";
import { type ChartProps } from "@/src/features/widgets/chart-library/chart-props";
import {
  formatMetric,
  toFullMetricString,
} from "@/src/features/widgets/chart-library/utils";

/**
 * PieChart component
 * @param data - Data to be displayed. Expects an array of objects with dimension and metric properties.
 */
export const PieChart: React.FC<
  Pick<ChartProps, "data" | "metricFormatter">
> = ({
  data,
  metricFormatter = (value, options) => formatMetric(value, options),
}) => {
  const locale = useInterfaceLocale();
  const t = useTranslation(widgetMessages);
  const formatValue = (value: number) =>
    toFullMetricString(metricFormatter(value, { style: "compact", locale }));

  const chartData = useMemo(() => {
    return data.map((item) => ({
      label: item.dimension || t("unknownSeries"),
      value: typeof item.metric === "number" ? item.metric : 0,
    }));
  }, [data, t]);

  return <DesignSystemPieChart data={chartData} valueFormatter={formatValue} />;
};
