import { Trash } from "@langfuse/icons";
import { formatDistanceToNowStrict } from "date-fns";

import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import type { PaginationBarProps } from "@/src/components/design-system/PaginationBar/PaginationBar";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import { createBadgeListTableColumn } from "@/src/components/design-system/table/columns/createBadgeListTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { createUserTableColumn } from "@/src/components/design-system/table/columns/createUserTableColumn";
import { createTableColumn } from "@/src/components/design-system/table/columns/utils/createTableColumn";
import { Skeleton } from "@/src/components/ui/skeleton";
import { buildLocalIsoDatePresentation } from "@/src/utils/dates";
import type {
  AsyncTableData,
  TableProps,
} from "@/src/components/design-system/table/Table";
import type { LangfuseColumnDef } from "@/src/components/table/types";
import { isApiKeyExpired } from "@/src/features/apiKey/helpers/isApiKeyExpired";
import { GATEWAY_API_KEY_LAST_USED_WINDOW_DAYS } from "@/src/features/ai-gateway/constants/gatewayApiKeyLastUsed";
import { GatewayApiKeysEmptyState } from "@/src/features/ai-gateway/components/GatewayApiKeysPage/components/GatewayApiKeysTable/components/GatewayApiKeysEmptyState/GatewayApiKeysEmptyState";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

type GatewayApiKey = {
  metadata: unknown;
  apiKey: {
    id: string;
    publicKey: string;
    displaySecretKey: string;
    note: string | null;
    createdAt: Date;
    expiresAt: Date | null;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
  };
  /** Absent until the last-used query resolves, and when the key had no gateway traffic in the window. */
  lastUsedAt?: Date;
};

const lastUsedSkeleton = <Skeleton className="h-4 w-1/2" />;

/** `isTracked` is false when gateway traffic is not recorded (ingestion mode `NONE` or no active ingestion project). */
type GatewayApiKeysLastUsedState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; isTracked: boolean };

export function GatewayApiKeysTable({
  data,
  lastUsed,
  onRevoke,
  pagination,
  search,
  orderBy,
  setOrderBy,
}: Pick<TableProps<GatewayApiKey>, "orderBy" | "setOrderBy"> & {
  data: AsyncTableData<GatewayApiKey[]>;
  lastUsed: GatewayApiKeysLastUsedState;
  onRevoke: (apiKeyId: string) => void;
  pagination: PaginationBarProps;
  search: { value: string; onChange: (value: string) => void };
}) {
  const t = useTranslation(gatewayMessages);
  const hasSearch = search.value.trim().length > 0;
  /** An out-of-range page is also empty; it keeps the table so its pagination can page back. */
  const hasNoKeys = !hasSearch && pagination.totalCount === 0;
  const columns: LangfuseColumnDef<GatewayApiKey>[] = [
    createDateTableColumn<GatewayApiKey>({
      accessorFn: (row) => row.apiKey.createdAt,
      id: "createdAt",
      header: t("tableCreated"),
      enableResizing: false,
      enableSorting: true,
    }),
    createTextTableColumn<GatewayApiKey>({
      accessorFn: (row) => row.apiKey.note,
      id: "description",
      header: t("tableName"),
      nullValue: "-",
      enableResizing: false,
      enableSorting: true,
    }),
    createTextTableColumn<GatewayApiKey>({
      accessorFn: (row) => row.apiKey.displaySecretKey,
      id: "key",
      header: t("tableKey"),
      sensitive: true,
      enableResizing: false,
    }),
    createUserTableColumn<GatewayApiKey>({
      accessorFn: (row) => row.apiKey.user,
      id: "user",
      header: t("tableUser"),
      variant: "avatar",
      nullValue: t("serviceAccount"),
      hideBelowMd: true,
      enableResizing: false,
    }),
    createDateTableColumn<GatewayApiKey>({
      accessorFn: (row) => row.apiKey.expiresAt,
      id: "expiresAt",
      header: t("tableExpiration"),
      hideBelowMd: true,
      enableResizing: false,
      enableSorting: true,
      emptyValue: t("noExpiration"),
      getPrefix: (expiresAt) =>
        isApiKeyExpired(expiresAt) ? t("expiredOn") : null,
    }),
    createTableColumn<GatewayApiKey, Date>({
      accessorFn: (row) => row.lastUsedAt,
      id: "lastUsedAt",
      header: t("tableLastUsed"),
      hideBelowMd: true,
      enableResizing: false,
      loadingCell: lastUsedSkeleton,
      renderCell: (lastUsedAt) => {
        if (lastUsed.status === "loading") return lastUsedSkeleton;
        if (!lastUsedAt) {
          return (
            <span className="text-muted-foreground">
              {lastUsed.status === "success" && lastUsed.isTracked
                ? t("notUsedInDays", {
                    days: String(GATEWAY_API_KEY_LAST_USED_WINDOW_DAYS),
                  })
                : t("unavailable")}
            </span>
          );
        }
        return (
          <span
            className="block w-full truncate"
            title={buildLocalIsoDatePresentation({ date: lastUsedAt })?.title}
          >
            {formatDistanceToNowStrict(lastUsedAt, { addSuffix: true })}
          </span>
        );
      },
    }),
    createBadgeListTableColumn<GatewayApiKey>({
      accessorFn: (row) => getMetadataEntries(row.metadata),
      id: "metadata",
      header: t("tableMetadata"),
      sensitive: true,
      enableResizing: false,
    }),
  ];

  return (
    <SettingsTable
      tableName="gatewayApiKeys"
      columns={columns}
      data={data}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      actions={(row) => [
        {
          id: "revoke",
          type: "item",
          title: t("revokeKey"),
          icon: Trash,
          variant: "destructive",
          onClick: () => onRevoke(row.apiKey.id),
        },
      ]}
      pagination={pagination}
      search={
        hasNoKeys
          ? undefined
          : { ...search, placeholder: t("searchByNameOrUser") }
      }
      noResultsMessage={hasSearch ? t("noKeysMatchSearch") : t("noKeysCreated")}
      emptyState={hasNoKeys ? <GatewayApiKeysEmptyState /> : undefined}
    />
  );
}

function getMetadataEntries(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, item]) =>
    item === null ||
    typeof item === "string" ||
    typeof item === "number" ||
    typeof item === "boolean"
      ? [`${key}: ${String(item)}`]
      : [],
  );
}
