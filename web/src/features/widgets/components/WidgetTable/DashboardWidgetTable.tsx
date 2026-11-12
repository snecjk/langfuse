import { useCallback, useMemo } from "react";
import { Copy, CopyPlus, FileJson, Trash } from "@langfuse/icons";
import startCase from "lodash/startCase";
import { type DashboardWidgetChartType } from "@langfuse/shared/src/db";

import {
  Table,
  type TableProps,
} from "@/src/components/design-system/table/Table";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import { createBadgeTableColumn } from "@/src/components/design-system/table/columns/createBadgeTableColumn";
import { createLinkTableColumn } from "@/src/components/design-system/table/columns/createLinkTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { dashboardWidgetChartTypeIcons } from "@/src/features/widgets/chart-library/chartTypeIcons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { widgetMessages } from "@/src/features/i18n/messages/widgets";

const TYPE_COLUMN_SIZE = 140;

const chartTypeLabelKeys: Record<DashboardWidgetChartType, string> = {
  LINE_TIME_SERIES: "chartTypeLine",
  AREA_TIME_SERIES: "chartTypeArea",
  BAR_TIME_SERIES: "chartTypeBarTimeSeries",
  HORIZONTAL_BAR: "chartTypeHorizontalBar",
  VERTICAL_BAR: "chartTypeVerticalBar",
  PIE: "chartTypePie",
  NUMBER: "chartTypeBigNumber",
  HISTOGRAM: "chartTypeHistogram",
  PIVOT_TABLE: "chartTypePivotTable",
};

const chartDisplayModeKeys: Record<DashboardWidgetChartType, string> = {
  LINE_TIME_SERIES: "timeSeriesMode",
  AREA_TIME_SERIES: "timeSeriesMode",
  BAR_TIME_SERIES: "timeSeriesMode",
  HORIZONTAL_BAR: "totalValueMode",
  VERTICAL_BAR: "totalValueMode",
  PIE: "totalValueMode",
  NUMBER: "totalValueMode",
  HISTOGRAM: "totalValueMode",
  PIVOT_TABLE: "totalValueMode",
};

const viewBadgeVariants = {
  TRACES: "blue",
  OBSERVATIONS: "teal",
  SCORES_NUMERIC: "green",
  SCORES_BOOLEAN: "violet",
  SCORES_CATEGORICAL: "pink",
} as const;

const chartTypeBadgeVariants = {
  LINE_TIME_SERIES: "blue",
  AREA_TIME_SERIES: "emerald",
  BAR_TIME_SERIES: "violet",
  HORIZONTAL_BAR: "teal",
  VERTICAL_BAR: "orange",
  PIE: "pink",
  NUMBER: "green",
  HISTOGRAM: "purple",
  PIVOT_TABLE: "amber",
} as const;

export type WidgetTableRow = {
  id: string;
  name: string;
  description: string;
  view: string;
  chartType: string;
  createdAt: Date;
  updatedAt: Date;
  owner: "PROJECT" | "LANGFUSE";
};

export function DashboardWidgetTable({
  projectId,
  hasCUDAccess,
  onCopy,
  onDelete,
  onDownload,
  onDuplicate,
  ...tableProps
}: Pick<
  TableProps<WidgetTableRow>,
  | "data"
  | "loadingRowCount"
  | "noResultsMessage"
  | "onRowClick"
  | "orderBy"
  | "setOrderBy"
  | "topBorder"
> & {
  projectId: string | undefined;
  hasCUDAccess: boolean;
  onCopy: (widget: WidgetTableRow) => void;
  onDelete: (widget: WidgetTableRow) => void;
  onDownload: (widget: WidgetTableRow) => void;
  onDuplicate: (widget: WidgetTableRow) => void;
}) {
  const t = useTranslation(widgetMessages);
  const columns = useMemo<LangfuseColumnDef<WidgetTableRow>[]>(
    () => [
      createLinkTableColumn<WidgetTableRow>({
        accessorKey: "name",
        header: t("name"),
        enableSorting: true,
        size: 200,
        getCell: (name, { row }) =>
          name
            ? {
                type: "link",
                props: {
                  path: `/project/${projectId}/widgets/${encodeURIComponent(row.original.id)}`,
                  value: name,
                },
              }
            : undefined,
      }),
      createTextTableColumn<WidgetTableRow>({
        accessorKey: "description",
        header: t("description"),
        size: 300,
      }),
      createBadgeTableColumn<WidgetTableRow>({
        range: "decorative",
        accessorKey: "view",
        header: t("viewType"),
        enableSorting: true,
        size: TYPE_COLUMN_SIZE,
        getBadge: (view) => ({
          value: startCase(view.toLowerCase()),
          variant:
            viewBadgeVariants[view as keyof typeof viewBadgeVariants] ?? "blue",
        }),
      }),
      createBadgeTableColumn<WidgetTableRow>({
        range: "decorative",
        accessorKey: "chartType",
        header: t("chartType"),
        enableSorting: true,
        size: TYPE_COLUMN_SIZE,
        getBadge: (chartType) => ({
          value: t(
            chartTypeLabelKeys[
              chartType as DashboardWidgetChartType
            ] as Parameters<typeof t>[0],
          ),
          variant:
            chartTypeBadgeVariants[chartType as DashboardWidgetChartType],
          icon: dashboardWidgetChartTypeIcons[
            chartType as DashboardWidgetChartType
          ],
        }),
      }),
      createBadgeTableColumn<WidgetTableRow>({
        range: "decorative",
        accessorFn: (row) =>
          t(
            chartDisplayModeKeys[
              row.chartType as DashboardWidgetChartType
            ] as Parameters<typeof t>[0],
          ),
        id: "displayMode",
        header: t("displayMode"),
        enableSorting: true,
        size: TYPE_COLUMN_SIZE,
        getBadge: (displayMode) => ({
          value: displayMode,
          variant: displayMode === t("timeSeriesMode") ? "blue" : "teal",
          icon:
            displayMode === t("timeSeriesMode")
              ? dashboardWidgetChartTypeIcons.LINE_TIME_SERIES
              : dashboardWidgetChartTypeIcons.NUMBER,
        }),
      }),
      createDateTableColumn<WidgetTableRow>({
        accessorKey: "createdAt",
        header: t("createdAt"),
        enableSorting: true,
        mode: "relative",
        size: 100,
      }),
      createDateTableColumn<WidgetTableRow>({
        accessorKey: "updatedAt",
        header: t("updatedAt"),
        enableSorting: true,
        mode: "relative",
        size: 100,
      }),
    ],
    [projectId, t],
  );
  const actions = useCallback<
    NonNullable<TableProps<WidgetTableRow>["actions"]>
  >(
    (row) => [
      {
        id: "copy",
        type: "item",
        title: t("copyWidget"),
        icon: Copy,
        onClick: () => onCopy(row),
      },
      {
        id: "clone",
        type: "item",
        title: t("clone"),
        icon: CopyPlus,
        disabled: hasCUDAccess ? undefined : { reason: t("noClonePermission") },
        onClick: () => onDuplicate(row),
      },
      {
        id: "download",
        type: "item",
        title: t("downloadAsJson"),
        icon: FileJson,
        onClick: () => onDownload(row),
      },
      { id: "delete-separator", type: "separator" },
      {
        id: "delete",
        type: "item",
        title: t("delete"),
        icon: Trash,
        variant: "destructive",
        disabled:
          hasCUDAccess && row.owner !== "LANGFUSE"
            ? undefined
            : {
                reason: t("noDeletePermission"),
              },
        onClick: () => onDelete(row),
      },
    ],
    [hasCUDAccess, onCopy, onDelete, onDownload, onDuplicate, t],
  );

  return (
    <Table
      tableName="widgets"
      columns={columns}
      actions={actions}
      {...tableProps}
    />
  );
}
