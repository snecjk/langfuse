import { useMemo } from "react";
import { TrashIcon } from "@langfuse/icons";
import { SettingsTable } from "@/src/components/SettingsTable/SettingsTable";
import { createBadgeTableColumn } from "@/src/components/design-system/table/columns/createBadgeTableColumn";
import { createButtonTableColumn } from "@/src/components/design-system/table/columns/createButtonTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export type SsoConfigRow = {
  domain: string;
  authProvider: string;
  authConfig: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SsoConfigTableRow = {
  domain: string;
  config: SsoConfigRow | null;
};

const providerLabels: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  "github-enterprise": "GitHub Enterprise",
  gitlab: "GitLab",
  auth0: "Auth0",
  okta: "Okta",
  authentik: "Authentik",
  onelogin: "OneLogin",
  "azure-ad": "Azure AD / Entra ID",
  cognito: "AWS Cognito",
  keycloak: "Keycloak",
  jumpcloud: "JumpCloud",
  custom: "Custom OIDC",
};

export function SsoConfigsTable({
  data,
  onConfigure,
  onDelete,
}: {
  data: SsoConfigTableRow[];
  onConfigure: (row: SsoConfigTableRow) => void;
  onDelete: (domain: string) => void;
}) {
  const t = useTranslation(enterpriseMessages);
  const locale = useInterfaceLocale();
  const columns = useMemo<LangfuseColumnDef<SsoConfigTableRow>[]>(
    () => [
      createTextTableColumn<SsoConfigTableRow>({
        accessorKey: "domain",
        header: t("ssoDomainHeader"),
      }),
      createBadgeTableColumn<SsoConfigTableRow>({
        id: "provider",
        accessorFn: (row) => row.config?.authProvider ?? t("ssoNotConfigured"),
        header: t("ssoProviderHeader"),
        getBadge: (provider) =>
          provider === t("ssoNotConfigured")
            ? { value: provider, variant: "secondary" }
            : {
                value: providerLabels[provider] ?? provider,
                variant: "default",
              },
      }),
      createTextTableColumn<SsoConfigTableRow, Date>({
        accessorFn: (row) => row.config?.updatedAt,
        id: "updatedAt",
        header: t("ssoUpdatedHeader"),
        hideBelowMd: true,
        mapValue: (date) =>
          date?.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US"),
        nullValue: "—",
      }),
      createButtonTableColumn<SsoConfigTableRow, string>({
        accessorFn: (row) => row.domain,
        id: "configure",
        header: "",
        getButton: ({ row }) => ({
          text: row.original.config
            ? t("ssoUpdateAction")
            : t("ssoConfigureAction"),
          onClick: () => onConfigure(row.original),
        }),
      }),
    ],
    [onConfigure, t, locale],
  );

  return (
    <SettingsTable
      tableName="SSO configurations"
      columns={columns}
      actions={(row) =>
        row.config
          ? [
              {
                id: "delete",
                type: "item",
                title: t("ssoDeleteAction", { domain: row.domain }),
                icon: TrashIcon,
                variant: "destructive",
                onClick: () => onDelete(row.domain),
              },
            ]
          : []
      }
      data={{ status: "success", data }}
    />
  );
}
