/* eslint-disable no-nested-ternary, react/no-unstable-nested-components */
import { DataTable } from "@/src/components/table/data-table";
import { DataTableToolbar } from "@/src/components/table/data-table-toolbar";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { api } from "@/src/utils/api";
import { type BackgroundMigration } from "@langfuse/shared";
import { RetryBackgroundMigrationPopoverController } from "@/src/features/background-migrations/components/RetryBackgroundMigrationPopoverController";
import { createStatusTableColumn } from "@/src/components/design-system/table/columns/createStatusTableColumn";
import Page from "@/src/components/layouts/Page";
import { Button } from "@/src/components/ui/button";
import { RotateCcw } from "@langfuse/icons";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export default function BackgroundMigrationsTable() {
  const backgroundMigrations = api.backgroundMigrations.all.useQuery();
  const t = useTranslation(enterpriseMessages);

  const columns = [
    createTextTableColumn<BackgroundMigration>({
      accessorKey: "name",
      enableColumnFilter: false,
      header: t("backgroundMigrationsNameHeader"),
    }),
    createTextTableColumn<BackgroundMigration>({
      accessorKey: "script",
      enableColumnFilter: false,
      header: t("backgroundMigrationsScriptHeader"),
    }),
    {
      accessorKey: "args",
      id: "args",
      enableColumnFilter: false,
      header: t("backgroundMigrationsArgsHeader"),
      size: 80,
      cell: (row) => JSON.stringify(row.getValue()),
    },
    createStatusTableColumn<BackgroundMigration, BackgroundMigration>({
      id: "status",
      accessorFn: (row) => row,
      getStatus: (migration) => {
        if (!migration) return undefined;
        if (migration.failedAt) return "failed";
        if (migration.finishedAt) return "finished";
        if (migration.workerId) return "active";

        return "queued";
      },
      header: t("backgroundMigrationsStatusHeader"),
      size: 80,
      enableSorting: false,
    }),
    createTextTableColumn<BackgroundMigration>({
      accessorKey: "failedReason",
      enableColumnFilter: false,
      header: t("backgroundMigrationsFailedReasonHeader"),
    }),
    createTextTableColumn<BackgroundMigration, BackgroundMigration["state"]>({
      accessorKey: "state",
      enableColumnFilter: false,
      header: t("backgroundMigrationsStateHeader"),
      mapValue: (value) => JSON.stringify(value),
    }),
    {
      id: "actions",
      header: t("backgroundMigrationsActionsHeader"),
      size: 65,
      cell: (row) => {
        const name = row.row.original.name;
        const isRetryable = row.row.original.failedAt !== null;
        return (
          <RetryBackgroundMigrationPopoverController
            backgroundMigrationName={name}
            isRetryable={isRetryable}
          >
            {({ disabled, Trigger }) => (
              <Trigger asChild>
                <Button variant="ghost" size="xs" disabled={disabled}>
                  <RotateCcw size="sm" color="default" />
                </Button>
              </Trigger>
            )}
          </RetryBackgroundMigrationPopoverController>
        );
      },
    },
  ] as LangfuseColumnDef<BackgroundMigration>[];

  return (
    <Page
      headerProps={{
        title: t("backgroundMigrationsTitle"),
      }}
    >
      <DataTableToolbar columns={columns} tableName="background-migrations" />
      <DataTable
        tableName="backgroundMigrations"
        columns={columns}
        data={
          backgroundMigrations.isPending
            ? { isLoading: true, isError: false }
            : backgroundMigrations.isError
              ? {
                  isLoading: false,
                  isError: true,
                  error: backgroundMigrations.error.message,
                }
              : {
                  isLoading: false,
                  isError: false,
                  data: backgroundMigrations.data?.migrations ?? [],
                }
        }
      />
    </Page>
  );
}
