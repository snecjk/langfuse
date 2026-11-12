import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function DnsRecordTable({
  recordHost,
  recordValue,
}: {
  recordHost: string;
  recordValue: string;
}) {
  const t = useTranslation(enterpriseMessages);
  const columns: LangfuseColumnDef<{
    type: string;
    host: string;
    value: string;
  }>[] = [
    createTextTableColumn({
      accessorKey: "type",
      header: t("dnsTypeHeader"),
      size: 64,
      enableResizing: false,
    }),
    createTextTableColumn({
      accessorKey: "host",
      header: t("dnsHostHeader"),
      size: 216,
      enableResizing: false,
      trailingAction: { type: "copy-to-clipboard" },
    }),
    createTextTableColumn({
      accessorKey: "value",
      header: t("dnsValueHeader"),
      enableResizing: false,
      trailingAction: { type: "copy-to-clipboard" },
    }),
  ];
  return (
    <SettingsTable
      tableName="DNS record"
      columns={columns}
      data={{
        status: "success",
        data: [{ type: "TXT", host: recordHost, value: recordValue }],
      }}
    />
  );
}
