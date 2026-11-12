import { useCallback, useMemo } from "react";
import { Copy, Edit, Trash2 } from "@langfuse/icons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboards";

import {
  Table,
  type TableProps,
} from "@/src/components/design-system/table/Table";
import { createBadgeTableColumn } from "@/src/components/design-system/table/columns/createBadgeTableColumn";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import { createLinkTableColumn } from "@/src/components/design-system/table/columns/createLinkTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { type LangfuseColumnDef } from "@/src/components/table/types";

export type DashboardTableRow = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  owner: "PROJECT" | "LANGFUSE";
};

export function DashboardTable({
  hasAccess,
  onClone,
  onDelete,
  onEdit,
  projectId,
  ...tableProps
}: Pick<
  TableProps<DashboardTableRow>,
  | "data"
  | "loadingRowCount"
  | "noResultsMessage"
  | "onRowClick"
  | "orderBy"
  | "setOrderBy"
  | "topBorder"
> & {
  hasAccess: boolean;
  onClone: (dashboard: DashboardTableRow) => void;
  onDelete: (dashboard: DashboardTableRow) => void;
  onEdit: (dashboard: DashboardTableRow) => void;
  projectId: string;
}) {
  const t = useTranslation(dashboardMessages);
  const columns = useMemo<LangfuseColumnDef<DashboardTableRow>[]>(
    () => [
      createLinkTableColumn<DashboardTableRow>({
        accessorKey: "name",
        header: t("name"),
        enableSorting: true,
        size: 200,
        getCell: (name, { row }) => {
          if (!name) return undefined;

          return {
            type: "link",
            props: {
              path: `/project/${projectId}/dashboards/${encodeURIComponent(row.original.id)}`,
              value: name,
            },
          };
        },
      }),
      createTextTableColumn<DashboardTableRow>({
        accessorKey: "description",
        header: t("description"),
        size: 300,
      }),
      createBadgeTableColumn<DashboardTableRow>({
        range: "decorative",
        id: "ownerTag",
        accessorFn: (row) =>
          row.owner === "LANGFUSE" ? "Langfuse" : "Project",
        header: t("owner"),
        size: 80,
        getBadge: (owner) => ({
          value: owner,
          variant: owner === "Langfuse" ? "teal" : "blue",
        }),
      }),
      createDateTableColumn<DashboardTableRow>({
        accessorKey: "createdAt",
        header: t("createdAt"),
        enableSorting: true,
        mode: "relative",
        size: 80,
      }),
      createDateTableColumn<DashboardTableRow>({
        accessorKey: "updatedAt",
        header: t("updatedAt"),
        enableSorting: true,
        mode: "relative",
        size: 80,
      }),
    ],
    [projectId, t],
  );
  const actions = useCallback<
    NonNullable<TableProps<DashboardTableRow>["actions"]>
  >(
    (dashboard) => [
      {
        id: "edit",
        type: "item",
        title: "Edit",
        icon: Edit,
        disabled: hasAccess ? undefined : { reason: t("noPermissionEdit") },
        onClick: () => onEdit(dashboard),
      },
      {
        id: "clone",
        type: "item",
        title: t("clone"),
        icon: Copy,
        disabled: hasAccess ? undefined : { reason: t("noPermissionClone") },
        onClick: () => onClone(dashboard),
      },
      ...(dashboard.owner === "PROJECT"
        ? [
            { id: "delete-separator", type: "separator" as const },
            {
              id: "delete",
              type: "item" as const,
              title: t("delete"),
              icon: Trash2,
              variant: "destructive" as const,
              disabled: hasAccess
                ? undefined
                : {
                    reason: t("noPermissionDelete"),
                  },
              onClick: () => onDelete(dashboard),
            },
          ]
        : []),
    ],
    [hasAccess, onClone, onDelete, onEdit, t],
  );

  return (
    <Table
      tableName="dashboards"
      columns={columns}
      actions={actions}
      {...tableProps}
    />
  );
}
