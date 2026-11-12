import { useCallback, useMemo } from "react";
import { Pencil, Plus, Trash2 } from "@langfuse/icons";

import {
  SettingsTable,
  type SettingsTableProps,
} from "@/src/components/SettingsTable/SettingsTable";
import { type TableProps } from "@/src/components/design-system/table/Table";
import { createStatusTableColumn } from "@/src/components/design-system/table/columns/createStatusTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { type RouterOutputs } from "@/src/utils/api";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export type WebCalloutEndpoint = RouterOutputs["webCallouts"]["all"][number];

export function WebCalloutSettingsTable({
  createAction,
  onEdit,
  onDelete,
  ...tableProps
}: Pick<TableProps<WebCalloutEndpoint>, "data" | "noResultsMessage"> & {
  createAction: { disabledReason?: string; onClick: () => void };
  onEdit: (endpoint: WebCalloutEndpoint) => void;
  onDelete: (endpoint: WebCalloutEndpoint) => void;
}) {
  const t = useTranslation(integrationMessages);
  const columns = useMemo<LangfuseColumnDef<WebCalloutEndpoint>[]>(
    () => [
      createTextTableColumn<WebCalloutEndpoint>({
        accessorKey: "name",
        header: t("webCalloutEndpointName"),
      }),
      createTextTableColumn<WebCalloutEndpoint>({
        accessorKey: "url",
        header: t("webCalloutEndpoint"),
        size: 576,
      }),
      createTextTableColumn<WebCalloutEndpoint>({
        accessorKey: "toastMessage",
        header: t("webCalloutToastMessage"),
      }),
      createTextTableColumn<WebCalloutEndpoint, string[]>({
        accessorKey: "requestHeaderKeys",
        header: t("webCalloutHeaders"),
        mapValue: (headers) =>
          headers?.length ? headers.join(", ") : t("webCalloutNone"),
      }),
      createStatusTableColumn<WebCalloutEndpoint, boolean>({
        accessorKey: "enabled",
        header: t("webCalloutStatus"),
        getStatus: (enabled) =>
          enabled ? t("webCalloutActive") : t("webCalloutDisabled"),
      }),
    ],
    [t],
  );

  const actions = useCallback<
    NonNullable<TableProps<WebCalloutEndpoint>["actions"]>
  >(
    (endpoint) => [
      {
        id: "edit",
        type: "item",
        title: t("webCalloutEdit"),
        icon: Pencil,
        onClick: () => onEdit(endpoint),
      },
      {
        id: "delete",
        type: "item",
        title: t("webCalloutDelete"),
        icon: Trash2,
        variant: "destructive",
        onClick: () => onDelete(endpoint),
      },
    ],
    [onEdit, onDelete, t],
  );

  const toolbarActions: SettingsTableProps<WebCalloutEndpoint>["toolbarActions"] =
    [
      {
        id: "add-endpoint",
        label: t("webCalloutAdd"),
        variant: "secondary",
        icon: <Plus size="base" aria-hidden="true" />,
        disabled: Boolean(createAction.disabledReason),
        title: createAction.disabledReason,
        onClick: createAction.onClick,
      },
    ];

  return (
    <SettingsTable
      tableName={t("webCalloutTableName")}
      columns={columns}
      actions={actions}
      toolbarActions={toolbarActions}
      {...tableProps}
    />
  );
}
