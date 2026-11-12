/* eslint-disable no-nested-ternary, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import React, { useState } from "react";
import { api, type RouterOutputs } from "@/src/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Table } from "@/src/components/design-system/table/Table";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboards";

type Dashboard =
  RouterOutputs["dashboard"]["allDashboards"]["dashboards"][number];

export interface SelectDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelectDashboard: (dashboardId: string) => void;
  onSkip: () => void;
}

export function SelectDashboardDialog({
  open,
  onOpenChange,
  projectId,
  onSelectDashboard,
  onSkip,
}: SelectDashboardDialogProps) {
  const t = useTranslation(dashboardMessages);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    null,
  );

  const columns: LangfuseColumnDef<Dashboard>[] = [
    createTextTableColumn<Dashboard>({
      accessorKey: "name",
      header: t("name"),
    }),
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ getValue }) => getValue<string>(),
    },
    {
      accessorKey: "updatedAt",
      header: t("updatedLabel"),
      cell: ({ getValue }) => getValue<Date>().toLocaleString(),
    },
  ];

  const dashboards = api.dashboard.allDashboards.useQuery(
    {
      projectId,
      orderBy: {
        column: "updatedAt",
        order: "DESC",
      },
      page: 0,
      limit: 100,
    },
    {
      enabled: Boolean(projectId) && open,
    },
  );

  const handleAdd = () => {
    if (selectedDashboardId) {
      onSelectDashboard(selectedDashboardId);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("selectDashboardToAdd")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {dashboards.isLoading ? (
              <div className="py-8 text-center">{t("loadingDashboards")}</div>
            ) : dashboards.isError ? (
              <div className="text-destructive py-8 text-center">
                {t("errorPrefix", { message: dashboards.error.message })}
              </div>
            ) : dashboards.data?.dashboards.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                {t("noDashboardsFound")}
              </div>
            ) : (
              <Table
                tableName="Dashboards"
                columns={columns}
                data={{
                  status: "success",
                  data:
                    dashboards.data?.dashboards.filter(
                      (dashboard: Dashboard) => dashboard.owner === "PROJECT",
                    ) ?? [],
                }}
                noResultsMessage={null}
                selectedRowId={selectedDashboardId}
                onRowClick={(dashboard) => setSelectedDashboardId(dashboard.id)}
                getRowLabel={(dashboard) =>
                  t("selectDashboardRow", { name: dashboard.name })
                }
              />
            )}
          </div>
        </DialogBody>
        <DialogFooter className="mt-4 flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            {t("skip")}
          </Button>
          <Button onClick={handleAdd} disabled={!selectedDashboardId}>
            {t("addToDashboard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
