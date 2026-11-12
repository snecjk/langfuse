/* eslint-disable react/no-unstable-nested-components */
import { useMemo } from "react";
import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import { CustomTooltip } from "@/src/components/design-system/CustomTooltip/CustomTooltip";
import { type TableProps } from "@/src/components/design-system/table/Table";
import { type PaginationBarProps } from "@/src/components/design-system/PaginationBar/PaginationBar";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { createStatusTableColumn } from "@/src/components/design-system/table/columns/createStatusTableColumn";
import { InfoIcon } from "@langfuse/icons";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import { createUserTableColumn } from "@/src/components/design-system/table/columns/createUserTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { BatchActionStatus } from "@langfuse/shared";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { batchMessages } from "@/src/features/i18n/messages/batch";

export type BatchActionRow = {
  id: string;
  actionType: string;
  tableName: string;
  status: string;
  totalCount: number | null;
  processedCount: number | null;
  failedCount: number | null;
  createdAt: Date;
  finishedAt: Date | null;
  log: string | null;
  user: {
    name: string | null;
    image: string | null;
  } | null;
};

export function BatchActionsTable({
  data,
  pagination,
}: {
  data: TableProps<BatchActionRow>["data"];
  pagination: PaginationBarProps;
}) {
  const t = useTranslation(batchMessages);
  const columns = useMemo<LangfuseColumnDef<BatchActionRow>[]>(
    () => [
      createTextTableColumn<BatchActionRow>({
        accessorKey: "actionType",
        header: t("actionType"),
        size: 200,
        mapValue: (value) =>
          value
            ?.split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
      }),
      createTextTableColumn<BatchActionRow>({
        accessorKey: "tableName",
        header: t("table"),
        size: 120,
        mapValue: (value) =>
          value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined,
      }),
      createStatusTableColumn<BatchActionRow, string>({
        accessorKey: "status",
        getStatus: (status) => {
          if (status === BatchActionStatus.Queued) return "queued";
          if (status === BatchActionStatus.Processing) return "processing";
          if (status === BatchActionStatus.Completed) return "completed";
          if (status === BatchActionStatus.Failed) return "failed";
          if (status === BatchActionStatus.Partial) return "partial";
          if (!status) return undefined;

          return status.toLowerCase();
        },
        header: t("status"),
        size: 110,
      }),
      {
        accessorKey: "progress",
        id: "progress",
        header: t("progress"),
        size: 150,
        cell: ({ row }) => {
          const totalCount = row.original.totalCount;
          const processedCount = row.original.processedCount ?? 0;
          const failedCount = row.original.failedCount ?? 0;

          if (!totalCount)
            return <span className="text-muted-foreground">-</span>;

          return (
            <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
              <span className="text-sm">
                {processedCount} / {totalCount}
              </span>
              {failedCount > 0 && (
                <span
                  className="text-destructive truncate text-xs"
                  title={t("failedCount", { count: failedCount })}
                >
                  {t("failedCount", { count: failedCount })}
                </span>
              )}
            </div>
          );
        },
      },
      createDateTableColumn<BatchActionRow>({
        accessorKey: "createdAt",
        header: t("created"),
        size: 150,
      }),
      createDateTableColumn<BatchActionRow>({
        accessorKey: "finishedAt",
        header: t("finished"),
        size: 150,
      }),
      createUserTableColumn<BatchActionRow>({
        accessorKey: "user",
        header: t("createdBy"),
        size: 150,
        variant: "avatar",
        emptyValue: t("unknown"),
      }),
      {
        accessorKey: "log",
        id: "log",
        header: t("log"),
        size: 300,
        cell: ({ row }) => {
          const log = row.getValue("log") as string | null;
          return log ? (
            <CustomTooltip
              content={
                <pre className="max-h-60 overflow-auto text-xs whitespace-pre-wrap">
                  {log}
                </pre>
              }
            >
              {({ getTriggerProps }) => (
                <button
                  type="button"
                  {...getTriggerProps()}
                  className="flex items-center gap-1 text-left"
                >
                  <InfoIcon size="sm" color="muted" />
                  <span className="max-w-[250px] truncate text-xs" title={log}>
                    {log}
                  </span>
                </button>
              )}
            </CustomTooltip>
          ) : null;
        },
      },
    ],
    [t],
  );

  return (
    <SettingsTable
      tableName="batchActions"
      columns={columns}
      data={data}
      pagination={pagination}
      loadingRowCount={Math.max(1, Math.min(pagination.state.pageSize, 8))}
    />
  );
}
