/* eslint-disable @typescript-eslint/no-use-before-define */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import Header from "@/src/components/layouts/header";
import { Button } from "@/src/components/ui/button";
import { InfoTooltip } from "@/src/components/ui/InfoTooltip/InfoTooltip";
import { ConnectedMembershipInvitesSettingsTable } from "@/src/features/rbac/components/MembershipInvitesSettingsTable/ConnectedMembershipInvitesSettingsTable";
import { ConnectedMembersSettingsTable } from "@/src/features/rbac/components/MembersSettingsTable/ConnectedMembersSettingsTable";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { JSONView } from "@/src/components/ui/CodeJsonViewer";
import { Card } from "@/src/components/ui/card";
import RenameOrganization from "@/src/features/organizations/components/RenameOrganization";
import { DeleteOrganizationDialogController } from "@/src/features/organizations/components/DeleteOrganizationDialogController";
import { SettingsDangerZone } from "@/src/components/SettingsDangerZone";
import { BillingSettings } from "@/src/ee/features/billing/components/BillingSettings";
import { OrganizationUsageBreakdown } from "@/src/features/organization-usage/components/OrganizationUsageBreakdown";
import { useHasEntitlement, usePlan } from "@/src/features/entitlements/hooks";
import { SSOSettings } from "@/src/ee/features/sso-settings/components/SSOSettings";
import { type CloudConfigSchema, isCloudPlan } from "@langfuse/shared";
import { Building2 } from "@langfuse/icons";
import { useQueryProjectOrOrganization } from "@/src/features/projects/hooks";
import { LlmConnectionEmptyState } from "@/src/features/public-api/components/LlmConnectionEmptyState/LlmConnectionEmptyState";
import { ApiKeyList } from "@/src/features/public-api/components/ApiKeyList";
import AIFeatureSwitch from "@/src/features/organizations/components/AIFeatureSwitch";
import { useIsCloudBillingAvailable } from "@/src/ee/features/billing/utils/isCloudBilling";
import { env } from "@/src/env.mjs";
import { OrgAuditLogsSettingsPage } from "@/src/ee/features/audit-log-viewer/OrgAuditLogsSettingsPage";
import { useV4UpgradeUiFlag } from "@/src/features/v4-migration/useV4UpgradeUiEnabled";
import { OrganizationFeaturePreviewsSettings } from "@/src/features/feature-flags/components/OrganizationFeaturePreviewsSettings";
import useSessionStorage from "@/src/components/useSessionStorage";
import { api } from "@/src/utils/api";
import { ConnectedLLMApiKeySettingsTable } from "@/src/features/public-api/components/LLMApiKeySettingsTable/ConnectedLLMApiKeySettingsTable";

type OrganizationSettingsPage = {
  title: string;
  slug: string;
  section?: string;
  show?: boolean | (() => boolean);
  cmdKKeywords?: string[];
} & ({ content: React.ReactNode } | { href: string });

export function useOrganizationSettingsPages(): OrganizationSettingsPage[] {
  const t = useTranslation(settingsMessages);
  const { organization } = useQueryProjectOrOrganization();
  const showBillingSettings = useHasEntitlement("cloud-billing");
  const hasAdminApiEntitlement = useHasEntitlement("admin-api");
  const hasOrgApiKeyAccess = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "organization:CRUD_apiKeys",
  });
  const showOrgApiKeySettings = hasAdminApiEntitlement && hasOrgApiKeyAccess;
  const hasAuditLogsEntitlement = useHasEntitlement("audit-logs");
  const canReadSettings = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "organizationSettings:read",
  });
  const canUpdateOrganization = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "organization:update",
  });
  const canReadOrganizationLlmConnections = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "organizationLlmApiKeys:read",
  });
  const canReadUsage = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "organizationUsage:read",
  });
  const plan = usePlan();
  const isLangfuseCloud = isCloudPlan(plan) ?? false;
  const isCloudBillingAvailable = useIsCloudBillingAvailable();
  const showV4Migration = useV4UpgradeUiFlag();

  if (!organization) return [];

  const showBillingPage =
    showBillingSettings && isCloudBillingAvailable && canReadSettings;

  return getOrganizationSettingsPages({
    t,
    organization,
    showBillingSettings: showBillingPage,
    // The billing page embeds the usage breakdown, so the usage page only
    // covers deployments without one (self-hosted).
    showUsageSettings: canReadUsage && !showBillingPage,
    showOrgApiKeySettings,
    showAuditLogs: hasAuditLogsEntitlement && canReadSettings,
    showSsoSettings: isLangfuseCloud && canReadSettings,
    showV4Migration: showV4Migration && canReadSettings,
    showGeneralSettings: canReadSettings,
    showMembers: canReadSettings,
    showProjects: canReadSettings || organization.projects.length > 0,
    showOrganizationLlmConnections: canReadOrganizationLlmConnections,
    showFeaturePreviews:
      canUpdateOrganization && organization.id !== env.NEXT_PUBLIC_DEMO_ORG_ID,
  });
}

const getOrganizationSettingsPages = ({
  t,
  organization,
  showBillingSettings,
  showUsageSettings,
  showOrgApiKeySettings,
  showAuditLogs,
  showSsoSettings,
  showV4Migration,
  showGeneralSettings,
  showMembers,
  showProjects,
  showOrganizationLlmConnections,
  showFeaturePreviews,
}: {
  t: (
    key: keyof typeof settingsMessages.en,
    parameters?: Record<string, string | number>,
  ) => string;
  organization: {
    id: string;
    name: string;
    metadata: Record<string, unknown>;
    cloudConfig?: CloudConfigSchema | null;
    projects: Array<{
      id: string;
      name: string;
      deletedAt?: Date | string | null;
    }>;
  };
  showBillingSettings: boolean;
  showUsageSettings: boolean;
  showOrgApiKeySettings: boolean;
  showAuditLogs: boolean;
  showSsoSettings: boolean;
  showV4Migration: boolean;
  showGeneralSettings: boolean;
  showMembers: boolean;
  showProjects: boolean;
  showOrganizationLlmConnections: boolean;
  showFeaturePreviews: boolean;
}): OrganizationSettingsPage[] => [
  {
    title: t("general"),
    slug: "index",
    section: "Organization",
    cmdKKeywords: ["name", "id", "delete"],
    content: (
      <div className="flex flex-col gap-6">
        <RenameOrganization />
        <div>
          <Header title={t("debugInformation")} />
          <Card className="mb-4 p-3">
            <JSONView
              title={t("metadata")}
              json={{
                name: organization.name,
                id: organization.id,
                ...organization.metadata,
                ...(env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION && {
                  cloudRegion: env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION,
                }),
                ...(organization.cloudConfig?.clickhouse?.organizationId && {
                  clickhouseOrganizationId:
                    organization.cloudConfig.clickhouse.organizationId,
                }),
              }}
              borderless
            />
          </Card>
        </div>
        <AIFeatureSwitch />
        <SettingsDangerZone
          items={[
            {
              title: t("deleteOrganization"),
              description: t("deleteWarning"),
              button: (
                <DeleteOrganizationDialogController>
                  {({ disabled, openDialog }) => (
                    <Button
                      variant="destructive-secondary"
                      disabled={disabled !== undefined}
                      onClick={openDialog}
                    >
                      {t("deleteOrganizationButton")}
                    </Button>
                  )}
                </DeleteOrganizationDialogController>
              ),
            },
          ]}
        />
      </div>
    ),
    show: showGeneralSettings,
  },
  {
    title: t("featurePreviews"),
    slug: "feature-previews",
    section: "Organization",
    cmdKKeywords: ["feature", "preview", "flags", "beta"],
    content: <OrganizationFeaturePreviewsSettings orgId={organization.id} />,
    show: showFeaturePreviews,
  },
  {
    title: t("apiKeys"),
    slug: "api-keys",
    section: "Organization",
    content: (
      <div className="flex flex-col gap-6">
        <ApiKeyList entityId={organization.id} scope="organization" />
      </div>
    ),
    show: showOrgApiKeySettings,
  },
  {
    title: t("llmConnections"),
    slug: "llm-connections",
    section: "Organization",
    cmdKKeywords: ["llm", "models", "providers", "credentials"],
    content: (
      <div>
        <ConnectedLLMApiKeySettingsTable
          owner={{
            scope: "organization",
            organizationId: organization.id,
          }}
          toolbarContent={
            <div className="flex items-center gap-1">
              <Header title={t("organizationConnections")} className="mb-0!" />
              <InfoTooltip label={t("aboutConnections")}>
                {t("connectionHelp")}
              </InfoTooltip>
            </div>
          }
          emptyState={
            <LlmConnectionEmptyState
              icon={Building2}
              title={t("noConnections")}
              description={t("sharedConnections", {
                organization: organization.name,
              })}
            />
          }
        />
      </div>
    ),
    show: showOrganizationLlmConnections,
  },
  {
    title: t("members"),
    slug: "members",
    section: "Organization",
    cmdKKeywords: ["invite", "user", "rbac"],
    content: <OrganizationMembersSettings orgId={organization.id} />,
    show: showMembers,
  },
  {
    title: t("auditLogs"),
    slug: "audit-logs",
    section: "Organization",
    cmdKKeywords: ["audit", "logs", "history", "changes"],
    content: <OrgAuditLogsSettingsPage orgId={organization.id} />,
    show: showAuditLogs,
  },
  {
    title: t("usage"),
    slug: "usage",
    section: "Organization",
    cmdKKeywords: ["usage", "units", "traces", "observations", "scores"],
    content: (
      <div>
        <Header title={t("usage")} />
        <OrganizationUsageBreakdown orgId={organization.id} />
      </div>
    ),
    show: showUsageSettings,
  },
  {
    title: t("billing"),
    slug: "billing",
    section: "Organization",
    cmdKKeywords: ["payment", "subscription", "plan", "invoice"],
    content: <BillingSettings />,
    show: showBillingSettings,
  },
  {
    title: t("sso"),
    slug: "sso",
    section: "Organization",
    cmdKKeywords: [
      "sso",
      "login",
      "auth",
      "okta",
      "saml",
      "azure",
      "domain",
      "dns",
      "txt",
      "verify",
    ],
    content: <SSOSettings orgId={organization.id} />,
    show: showSsoSettings,
  },
  {
    title: t("projects"),
    slug: "projects",
    section: "Organization",
    href: `/organization/${organization.id}`,
    show: showProjects,
  },
  {
    title: t("v4Migration"),
    slug: "v4-migration",
    section: "Organization",
    href: "/v4-migration",
    show: showV4Migration,
  },
];

function OrganizationMembersSettings({ orgId }: { orgId: string }) {
  const t = useTranslation(settingsMessages);
  const [invitesPagination, setInvitesPagination] = useSessionStorage(
    `orgInvites_${orgId}_pagination`,
    { pageIndex: 0, pageSize: 10 },
  );

  const hasViewAccess = useHasOrganizationAccess({
    organizationId: orgId,
    scope: "organizationMembers:read",
  });

  const membershipInvites = api.members.allInvitesFromOrg.useQuery(
    {
      orgId,
      page: invitesPagination.pageIndex,
      limit: invitesPagination.pageSize,
    },
    { enabled: hasViewAccess },
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Header title={t("organizationMembers")} />
        <ConnectedMembersSettingsTable orgId={orgId} />
      </div>
      {hasViewAccess && (
        <div
          className={
            membershipInvites.data?.totalCount === 0 ? "hidden" : undefined
          }
        >
          <Header title={t("membershipInvites")} />
          <ConnectedMembershipInvitesSettingsTable
            orgId={orgId}
            query={membershipInvites}
            paginationState={invitesPagination}
            setPaginationState={setInvitesPagination}
          />
        </div>
      )}
    </div>
  );
}
