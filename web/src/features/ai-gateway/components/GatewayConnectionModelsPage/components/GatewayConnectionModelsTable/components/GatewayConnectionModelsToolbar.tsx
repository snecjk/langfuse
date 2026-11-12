import type { ReactNode } from "react";
import { useStore } from "zustand";

import { Button } from "@/src/components/ui/button";
import { DataTableToolbar } from "@/src/components/table/data-table-toolbar";
import type { TableSelectionStore } from "@/src/components/table/table-selection-store";
import type { LangfuseColumnDef } from "@/src/components/table/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import type { GatewayConnectionModelRow } from "../types/gatewayConnectionModelRow";

export type GatewayConnectionModelsToolbarProps = {
  columns: LangfuseColumnDef<GatewayConnectionModelRow>[];
  filteredModelIds: string[];
  isSaving: boolean;
  pageIndex: number;
  pageModelIds: string[];
  pageSize: number;
  search: string;
  selectionStore: TableSelectionStore;
  filters?: ReactNode;
  toolbarActions?: ReactNode;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onSearchChange: (value: string) => void;
};

export function GatewayConnectionModelsToolbar({
  columns,
  filteredModelIds,
  isSaving,
  pageIndex,
  pageModelIds,
  pageSize,
  search,
  selectionStore,
  filters,
  toolbarActions,
  onEnableAll,
  onDisableAll,
  onSearchChange,
}: GatewayConnectionModelsToolbarProps) {
  const t = useTranslation(gatewayMessages);
  const rowSelection = useStore(selectionStore, (state) => state.rowSelection);
  const selectAll = useStore(selectionStore, (state) => state.selectAll);
  const actions = selectionStore.getState().actions;
  const selectedPageRowIds = pageModelIds.filter((id) => rowSelection[id]);

  return (
    <DataTableToolbar
      tableName="gateway-connection-models"
      columns={columns}
      className="px-0"
      rowClassName="mt-0 mb-3"
      searchConfig={{
        metadataSearchFields: [t("modelColumn")],
        updateQuery: onSearchChange,
        currentQuery: search,
        tableAllowsFullTextSearch: false,
      }}
      viewModeToggle={filters}
      actionButtons={
        <>
          {toolbarActions}
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onEnableAll}
          >
            {t("enableAll")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onDisableAll}
          >
            {t("disableAll")}
          </Button>
        </>
      }
      multiSelect={{
        selectAll,
        setSelectAll: actions.setSelectAll,
        selectedRowIds: selectedPageRowIds,
        setRowSelection: actions.setRowSelection,
        pageSize,
        pageIndex,
        totalCount: filteredModelIds.length,
      }}
    />
  );
}
