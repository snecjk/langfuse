import { useMemo } from "react";
import { TrashIcon } from "@langfuse/icons";
import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { createButtonTableColumn } from "@/src/components/design-system/table/columns/createButtonTableColumn";
import { createBadgeTableColumn } from "@/src/components/design-system/table/columns/createBadgeTableColumn";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import {
  type AsyncTableData,
  type TableProps,
} from "@/src/components/design-system/table/Table";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export type DomainRowData = {
  id: string;
  domain: string;
  verifiedAt: Date | null;
  createdAt: Date;
  recordHost: string;
  recordValue: string;
};

export function VerifiedDomainsSettingsTable({
  data,
  verifyingDomainId,
  onDelete,
  onViewInstructions,
}: {
  data: AsyncTableData<DomainRowData[]>;
  verifyingDomainId: string | null;
  onDelete: (row: DomainRowData) => void;
  onViewInstructions: (row: DomainRowData) => void;
}) {
  const t = useTranslation(enterpriseMessages);
  const columns = useMemo<LangfuseColumnDef<DomainRowData>[]>(
    () => [
      createTextTableColumn<DomainRowData>({
        accessorKey: "domain",
        header: t("verifiedDomainHeader"),
        enableResizing: false,
      }),
      createBadgeTableColumn<DomainRowData>({
        accessorFn: (row) =>
          row.verifiedAt
            ? t("verifiedDomainsVerified")
            : t("verifiedDomainsPending"),
        id: "status",
        header: t("verifiedDomainsStatusHeader"),
        enableResizing: false,
        range: "semantic",
        getBadge: (value) => ({
          value,
          variant:
            value === t("verifiedDomainsVerified") ? "success" : "warning",
        }),
      }),
      createDateTableColumn<DomainRowData>({
        accessorKey: "createdAt",
        header: t("verifiedDomainsAddedHeader"),
        hideBelowMd: true,
        enableResizing: false,
      }),
      createButtonTableColumn<DomainRowData, string>({
        accessorFn: (row) => row.id,
        id: "verify",
        header: "",
        getButton: ({ row }) => ({
          text: t("verifiedDomainsVerifyAction"),
          onClick: () => onViewInstructions(row.original),
          loading: verifyingDomainId === row.original.id,
          disabled: Boolean(row.original.verifiedAt),
        }),
      }),
    ],
    [onViewInstructions, verifyingDomainId, t],
  );

  const actions: NonNullable<TableProps<DomainRowData>["actions"]> = (row) => [
    {
      id: "delete",
      type: "item",
      title: t("verifiedDomainsDeleteAction"),
      icon: TrashIcon,
      variant: "destructive",
      onClick: () => onDelete(row),
    },
  ];

  return (
    <SettingsTable
      tableName="Verified domains"
      columns={columns}
      actions={actions}
      data={data}
      noResultsMessage={t("verifiedDomainsEmpty")}
    />
  );
}
