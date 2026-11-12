import { Edit, Trash2 } from "@langfuse/icons";
import { type RouterOutputs } from "@/src/utils/api";
import { formatDistanceToNow } from "date-fns";
import { zhCN as dateFnsZhCN } from "date-fns/locale";
import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import { type AsyncTableData } from "@/src/components/design-system/table/Table";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { createNumberTableColumn } from "@/src/components/design-system/table/columns/createNumberTableColumn";
import { createStatusTableColumn } from "@/src/components/design-system/table/columns/createStatusTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { costFormatter } from "@/src/utils/numbers";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export type SpendAlertRow = Pick<
  RouterOutputs["spendAlerts"]["getSpendAlerts"][number],
  "id" | "title" | "triggeredAt"
> & {
  threshold: number; // USD
};

export function SpendAlertsTable({
  data,
  onEdit,
  onDelete,
}: {
  data: AsyncTableData<SpendAlertRow[]>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslation(enterpriseMessages);
  const locale = useInterfaceLocale();
  const columns: LangfuseColumnDef<SpendAlertRow>[] = [
    createTextTableColumn<SpendAlertRow>({
      accessorKey: "title",
      header: t("spendAlertsTitleHeader"),
      size: 160,
    }),
    createNumberTableColumn<SpendAlertRow>({
      accessorFn: (row) => row.threshold,
      id: "limit",
      header: t("spendAlertsLimitHeader"),
      size: 140,
      formatter: costFormatter,
    }),
    createStatusTableColumn<SpendAlertRow, Date>({
      id: "status",
      accessorFn: (row) => row.triggeredAt,
      header: t("spendAlertsStatusHeader"),
      size: 110,
      isLive: false,
      getStatus: (triggeredAt) => (triggeredAt ? "triggered" : "active"),
    }),
    {
      accessorKey: "lastTriggered",
      id: "lastTriggered",
      header: t("spendAlertsLastTriggeredHeader"),
      size: 160,
      cell: ({ row }) =>
        row.original.triggeredAt
          ? formatDistanceToNow(new Date(row.original.triggeredAt), {
              addSuffix: true,
              locale: locale === "zh-CN" ? dateFnsZhCN : undefined,
            })
          : t("spendAlertsNever"),
    },
  ];

  return (
    <SettingsTable
      tableName="spend-alerts"
      columnVisibilityKey="spend-alertsColumnVisibility"
      columns={columns}
      data={data}
      actions={(row) => [
        {
          id: "edit",
          type: "item",
          title: t("spendAlertEditTitle"),
          icon: Edit,
          onClick: () => onEdit(row.id),
        },
        {
          id: "delete",
          type: "item",
          title: t("spendAlertDeleteAction"),
          icon: Trash2,
          variant: "destructive",
          onClick: () => onDelete(row.id),
        },
      ]}
    />
  );
}
