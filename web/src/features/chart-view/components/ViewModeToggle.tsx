import React from "react";
import { BarChart3, Table } from "@langfuse/icons";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { type ViewMode } from "../types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { widgetMessages } from "@/src/features/i18n/messages/widgets";

/**
 * The toolbar affordance that flips the v4 events view between table and chart.
 * "Any view is a chart". View-only.
 */
export const ViewModeToggle = React.memo(function ViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}) {
  const t = useTranslation(widgetMessages);
  return (
    // Offset from the filter-preset cluster to its left.
    <div className="ml-1">
      <Tabs
        activationMode="manual"
        value={mode}
        onValueChange={(v) => onModeChange(v as ViewMode)}
      >
        <Tabs.List variant="inset" size="md" aria-label={t("viewMode")}>
          <Tabs.Trigger value="table" icon={Table} label={t("tableView")} />
          <Tabs.Trigger value="chart" icon={BarChart3} label={t("chartView")} />
        </Tabs.List>
      </Tabs>
    </div>
  );
});
