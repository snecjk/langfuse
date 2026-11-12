/* eslint-disable @typescript-eslint/no-use-before-define */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import Header from "@/src/components/layouts/header";
import { ApiKeyList } from "@/src/features/public-api/components/ApiKeyList";
import { DeleteProjectDialogController } from "@/src/features/projects/components/DeleteProjectDialogController/DeleteProjectDialogController";
import { HostNameProject } from "@/src/features/projects/components/HostNameProject";
import RenameProject from "@/src/features/projects/components/RenameProject";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { LlmApiKeyList } from "@/src/features/public-api/components/LlmApiKeyList";
import { PagedSettingsContainer } from "@/src/components/PagedSettingsContainer";
import { useQueryProject } from "@/src/features/projects/hooks";
import { ConnectedMembershipInvitesSettingsTable } from "@/src/features/rbac/components/MembershipInvitesSettingsTable/ConnectedMembershipInvitesSettingsTable";
import { ConnectedMembersSettingsTable } from "@/src/features/rbac/components/MembersSettingsTable/ConnectedMembersSettingsTable";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { JSONView } from "@/src/components/ui/CodeJsonViewer";
import { PostHogLogo } from "@/src/components/PostHogLogo";
import { MixpanelLogo } from "@/src/components/MixpanelLogo";
import { Card } from "@/src/components/ui/card";
import { TransferProjectDialogController } from "@/src/features/projects/components/TransferProjectDialogController";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useRouter } from "next/router";
import { SettingsDangerZone } from "@/src/components/SettingsDangerZone";
import { ActionButton } from "@/src/components/ActionButton";
import { Webhook } from "@langfuse/icons";
import { BatchExportsSettingsPage } from "@/src/features/batch-exports/components/BatchExportsSettingsPage";
import { BatchActionsSettingsPage } from "@/src/features/batch-actions/components/BatchActionsSettingsPage";
import { AuditLogsSettingsPage } from "@/src/ee/features/audit-log-viewer/AuditLogsSettingsPage";
import { ModelsSettings } from "@/src/features/models/components/ModelsSettings";
import ConfigureRetention from "@/src/features/projects/components/ConfigureRetention";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { NoDataOrLoading } from "@/src/components/NoDataOrLoading";
import { default as ProtectedLabelsSettings } from "@/src/features/prompts/components/ProtectedLabelsSettings";
import { SiSlack } from "@langfuse/icons/si";
import { ScoreConfigSettings } from "@/src/features/score-configs/components/ScoreConfigSettings";
import { env } from "@/src/env.mjs";
import { PersonalNotificationSettings } from "@/src/features/notifications/components/PersonalNotificationSettings";
import { ProjectNotificationChannels } from "@/src/features/notifications/components/ProjectNotificationChannels";
import useSessionStorage from "@/src/components/useSessionStorage";
import { useWebCallouts } from "@/src/features/web-callouts/useWebCallouts";
import { DeveloperToolsSettings } from "@/src/features/developer-tools/components/DeveloperToolsSettings";
import { useV4UpgradeUiFlag } from "@/src/features/v4-migration/useV4UpgradeUiEnabled";
import { api } from "@/src/utils/api";
import { IntegrationCardHeader } from "@/src/features/projects/components/IntegrationCardHeader/IntegrationCardHeader";
import { usePostHogIntegration } from "@/src/features/posthog-integration/usePostHogIntegration";
import { useMixpanelIntegration } from "@/src/features/mixpanel-integration/useMixpanelIntegration";
import { useBlobStorageIntegration } from "@/src/features/blobstorage-integration/useBlobStorageIntegration";
import { useExternalMediaStorage } from "@/src/ee/features/external-media-storage/useExternalMediaStorage";
import { ExternalMediaStorageIntegrationCard } from "@/src/ee/features/external-media-storage/components/ExternalMediaStorageIntegrationCard/ExternalMediaStorageIntegrationCard";
import { useSlackIntegration } from "@/src/features/slack/hooks/useSlackIntegration";

type ProjectSettingsPageEntry = {
  title: string;
  slug: string;
  show?: boolean | (() => boolean);
  cmdKKeywords?: string[];
} & ({ content: React.ReactNode } | { href: string });

export function useProjectSettingsPages(): ProjectSettingsPageEntry[] {
  const t = useTranslation(settingsMessages);
  const router = useRouter();
  const { project, organization } = useQueryProject();
  const showBillingSettings = useHasEntitlement("cloud-billing");
  const showRetentionSettings = useHasEntitlement("data-retention");
  const showProtectedLabelsSettings = useHasEntitlement(
    "prompt-protected-labels",
  );
  const showProjectNotificationChannels = useHasProjectAccess({
    projectId: project?.id,
    scope: "automations:CUD",
  });
  const showScoreConfigSettings = useHasProjectAccess({
    projectId: project?.id,
    scope: "scoreConfigs:read",
  });
  const showV4Migration = useV4UpgradeUiFlag();
  if (!project || !organization || !router.query.projectId) {
    return [];
  }

  return getProjectSettingsPages({
    t,
    project,
    organization,
    showBillingSettings,
    showRetentionSettings,
    showLLMConnectionsSettings: true,
    showProtectedLabelsSettings,
    showProjectNotificationChannels,
    showScoreConfigSettings,
    showV4Migration,
  });
}

const getProjectSettingsPages = ({
  t,
  project,
  organization,
  showBillingSettings,
  showRetentionSettings,
  showLLMConnectionsSettings,
  showProtectedLabelsSettings,
  showProjectNotificationChannels,
  showScoreConfigSettings,
  showV4Migration,
}: {
  t: (
    key: keyof typeof settingsMessages.en,
    parameters?: Record<string, string | number>,
  ) => string;
  project: { id: string; name: string; metadata: Record<string, unknown> };
  organization: { id: string; name: string; metadata: Record<string, unknown> };
  showBillingSettings: boolean;
  showRetentionSettings: boolean;
  showLLMConnectionsSettings: boolean;
  showProtectedLabelsSettings: boolean;
  showProjectNotificationChannels: boolean;
  showScoreConfigSettings: boolean;
  showV4Migration: boolean;
}): ProjectSettingsPageEntry[] => [
  {
    title: t("general"),
    slug: "index",
    cmdKKeywords: ["name", "id", "delete", "transfer", "ownership"],
    content: (
      <div className="flex flex-col gap-6">
        <HostNameProject />
        <RenameProject />
        {showRetentionSettings && <ConfigureRetention />}
        <div>
          <Header title={t("debugInformation")} />
          <Card className="mb-4 p-3">
            <JSONView
              title={t("metadata")}
              json={{
                project: {
                  name: project.name,
                  id: project.id,
                  ...project.metadata,
                },
                org: {
                  name: organization.name,
                  id: organization.id,
                  ...organization.metadata,
                },
                ...(env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION && {
                  cloudRegion: env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION,
                }),
              }}
              borderless
            />
          </Card>
        </div>
        <SettingsDangerZone
          items={[
            {
              title: t("transferOwnership"),
              description: t("transferHelp"),
              button: (
                <TransferProjectDialogController
                  project={project}
                  organization={organization}
                >
                  {({ disabled, openDialog }) => (
                    <Button
                      variant="destructive-secondary"
                      disabled={disabled !== undefined}
                      onClick={openDialog}
                    >
                      {t("transferProject")}
                    </Button>
                  )}
                </TransferProjectDialogController>
              ),
            },
            {
              title: t("deleteThisProject"),
              description: t("deleteProjectWarning"),
              button: (
                <DeleteProjectDialogController>
                  {({ hasAccess, openDialog }) => (
                    <Button
                      variant="destructive-secondary"
                      disabled={!hasAccess}
                      onClick={openDialog}
                    >
                      {t("deleteProject")}
                    </Button>
                  )}
                </DeleteProjectDialogController>
              ),
            },
          ]}
        />
      </div>
    ),
  },
  {
    title: t("apiKeys"),
    slug: "api-keys",
    cmdKKeywords: ["auth", "public key", "secret key"],
    content: (
      <div className="flex flex-col gap-6">
        <ApiKeyList entityId={project.id} scope="project" />
      </div>
    ),
  },
  {
    title: t("developerTools"),
    slug: "developer-tools",
    cmdKKeywords: [
      "mcp",
      "cli",
      "skill",
      "agent",
      "model context protocol",
      "command line",
      "claude code",
      "cursor",
    ],
    content: <DeveloperToolsSettings projectId={project.id} />,
  },
  {
    title: t("llmConnections"),
    slug: "llm-connections",
    cmdKKeywords: [
      "llm",
      "provider",
      "openai",
      "anthropic",
      "azure",
      "playground",
      "evaluation",
      "endpoint",
      "api",
    ],
    content: (
      <div className="flex flex-col gap-6">
        <LlmApiKeyList
          projectId={project.id}
          projectName={project.name}
          organizationId={organization.id}
          organizationName={organization.name}
        />
      </div>
    ),
    show: showLLMConnectionsSettings,
  },
  {
    title: t("modelDefinitions"),
    slug: "models",
    cmdKKeywords: ["cost", "token"],
    content: <ModelsSettings projectId={project.id} />,
  },
  {
    title: t("protectedLabels"),
    slug: "protected-prompt-labels",
    cmdKKeywords: ["prompt", "skill", "label", "protect", "lock"],
    content: <ProtectedLabelsSettings projectId={project.id} />,
    show: showProtectedLabelsSettings,
  },
  {
    title: t("scoreConfigs"),
    slug: "scores",
    cmdKKeywords: ["config"],
    content: <ScoreConfigSettings projectId={project.id} />,
    show: showScoreConfigSettings,
  },
  {
    title: t("members"),
    slug: "members",
    cmdKKeywords: ["invite", "user"],
    content: (
      <ProjectMembersSettings
        orgId={organization.id}
        project={{ id: project.id, name: project.name }}
      />
    ),
  },
  {
    title: t("integrations"),
    slug: "integrations",
    cmdKKeywords: ["posthog", "mixpanel", "analytics", "callback", "webhook"],
    content: <Integrations projectId={project.id} />,
  },
  {
    title: t("exports"),
    slug: "exports",
    cmdKKeywords: ["csv", "download", "json", "batch"],
    content: <BatchExportsSettingsPage projectId={project.id} />,
  },
  {
    title: t("batchActions"),
    slug: "batch-actions",
    cmdKKeywords: ["bulk", "batch", "action", "dataset", "delete"],
    content: <BatchActionsSettingsPage projectId={project.id} />,
  },
  {
    title: t("auditLogs"),
    slug: "audit-logs",
    cmdKKeywords: ["trail"],
    content: <AuditLogsSettingsPage projectId={project.id} />,
  },
  {
    title: t("notifications"),
    slug: "notifications",
    cmdKKeywords: ["inbox", "email", "mention", "alert", "slack", "webhook"],
    content: (
      <div className="flex flex-col gap-6">
        <PersonalNotificationSettings />
        {showProjectNotificationChannels && (
          <ProjectNotificationChannels projectId={project.id} />
        )}
      </div>
    ),
  },
  {
    title: t("billing"),
    slug: "billing",
    href: `/organization/${organization.id}/settings/billing`,
    show: showBillingSettings,
  },
  {
    title: t("organizationSettings"),
    slug: "organization",
    href: `/organization/${organization.id}/settings`,
  },
  {
    title: t("v4Migration"),
    slug: "v4-migration",
    href: "/v4-migration",
    show: showV4Migration,
  },
];

export default function ProjectSettingsPage() {
  const t = useTranslation(settingsMessages);
  const { project, organization } = useQueryProject();
  const router = useRouter();
  const pages = useProjectSettingsPages();

  if (!project || !organization) {
    return (
      <ContainerPage
        headerProps={{
          title: t("projectSettings"),
        }}
      >
        <NoDataOrLoading isLoading />
      </ContainerPage>
    );
  }

  return (
    <ContainerPage
      headerProps={{
        title: t("projectSettings"),
      }}
    >
      <PagedSettingsContainer
        activeSlug={router.query.page as string | undefined}
        pages={pages}
      />
    </ContainerPage>
  );
}

function ProjectMembersSettings({
  orgId,
  project,
}: {
  orgId: string;
  project: { id: string; name: string };
}) {
  const t = useTranslation(settingsMessages);
  const [invitesPagination, setInvitesPagination] = useSessionStorage(
    `projectInvites_${project.id}_pagination`,
    { pageIndex: 0, pageSize: 10 },
  );

  const hasOrgViewAccess = useHasOrganizationAccess({
    organizationId: orgId,
    scope: "organizationMembers:read",
  });

  const hasProjectViewAccess =
    useHasProjectAccess({
      projectId: project.id,
      scope: "projectMembers:read",
    }) || hasOrgViewAccess;

  const membershipInvites = api.members.allInvitesFromProject.useQuery(
    {
      projectId: project.id,
      page: invitesPagination.pageIndex,
      limit: invitesPagination.pageSize,
    },
    { enabled: hasProjectViewAccess },
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Header title={t("projectMembers")} />
        <ConnectedMembersSettingsTable orgId={orgId} project={project} />
      </div>
      {hasProjectViewAccess && (
        <div
          className={
            membershipInvites.data?.totalCount === 0 ? "hidden" : undefined
          }
        >
          <Header title={t("membershipInvites")} />
          <ConnectedMembershipInvitesSettingsTable
            orgId={orgId}
            projectId={project.id}
            query={membershipInvites}
            paginationState={invitesPagination}
            setPaginationState={setInvitesPagination}
          />
        </div>
      )}
    </div>
  );
}

const Integrations = (props: { projectId: string }) => {
  const t = useTranslation(settingsMessages);
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "integrations:CRUD",
  });

  // Hide toast errors on integration screen. Error will appear inside integration
  const silentError = { silentAllErrors: true };
  const posthog = usePostHogIntegration(props.projectId, silentError);
  const mixpanel = useMixpanelIntegration(props.projectId, silentError);
  const blobStorage = useBlobStorageIntegration(props.projectId, silentError);
  const externalMediaStorage = useExternalMediaStorage(
    props.projectId,
    silentError,
  );
  const slack = useSlackIntegration(props.projectId, silentError);
  const webCallouts = useWebCallouts(props.projectId, silentError);

  return (
    <div>
      <Header title={t("integrations")} />
      <div className="space-y-6">
        <Card className="p-3">
          <IntegrationCardHeader
            status={posthog.isConfigured ? posthog.status : undefined}
            isLoading={posthog.query.isLoading}
            hasAccess={hasAccess}
          >
            <PostHogLogo className="text-foreground w-40" />
          </IntegrationCardHeader>
          <p className="text-primary mb-4 text-sm">{t("posthogHelp")}</p>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              hasAccess={hasAccess}
              href={`/project/${props.projectId}/settings/integrations/posthog`}
            >
              {t("configure")}
            </ActionButton>
            <Button asChild variant="ghost">
              <Link
                href="https://langfuse.com/integrations/analytics/posthog"
                target="_blank"
              >
                {t("integrationDocs")}
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-3">
          <IntegrationCardHeader
            status={mixpanel.isConfigured ? mixpanel.status : undefined}
            isLoading={mixpanel.query.isLoading}
            hasAccess={hasAccess}
          >
            <MixpanelLogo className="text-foreground w-20" />
          </IntegrationCardHeader>
          <p className="text-primary mb-4 text-sm">{t("mixpanelHelp")}</p>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              hasAccess={hasAccess}
              href={`/project/${props.projectId}/settings/integrations/mixpanel`}
            >
              {t("configure")}
            </ActionButton>
            <Button asChild variant="ghost">
              <Link
                href="https://langfuse.com/integrations/analytics/mixpanel"
                target="_blank"
              >
                {t("integrationDocs")}
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-3">
          <IntegrationCardHeader
            status={blobStorage.status}
            isLoading={blobStorage.query.isLoading}
            hasAccess={hasAccess}
          >
            <span className="font-bold">{t("blobStorage")}</span>
          </IntegrationCardHeader>
          <p className="text-primary mb-4 text-sm">{t("blobHelp")}</p>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              hasAccess={hasAccess}
              hasEntitlement={blobStorage.hasEntitlement}
              href={`/project/${props.projectId}/settings/integrations/blobstorage`}
            >
              {t("configure")}
            </ActionButton>
            <Button asChild variant="ghost">
              <Link
                href="https://langfuse.com/docs/query-traces#blob-storage"
                target="_blank"
              >
                {t("integrationDocs")}
              </Link>
            </Button>
          </div>
        </Card>

        <ExternalMediaStorageIntegrationCard
          projectId={props.projectId}
          hasAccess={hasAccess}
          hasEntitlement={
            externalMediaStorage.isFeatureEnabled ||
            externalMediaStorage.featureAvailability.isPending
          }
          isLoading={
            externalMediaStorage.featureAvailability.isPending ||
            externalMediaStorage.query.isLoading
          }
          status={externalMediaStorage.status}
        />

        <Card className="p-3">
          <IntegrationCardHeader
            status={slack.isConfigured ? slack.status : undefined}
            isLoading={slack.query.isLoading}
            hasAccess={hasAccess}
          >
            <SiSlack size="lg" color="foreground" />
            <span className="font-bold">Slack</span>
          </IntegrationCardHeader>
          <p className="text-primary mb-4 text-sm">{t("slackHelp")}</p>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              hasAccess={hasAccess}
              href={`/project/${props.projectId}/settings/integrations/slack`}
            >
              {t("configure")}
            </ActionButton>
          </div>
        </Card>

        <Card className="p-3">
          <IntegrationCardHeader
            status={webCallouts.status}
            isLoading={webCallouts.query.isLoading}
            hasAccess={hasAccess}
          >
            <Webhook size="lg" color="foreground" />
            <span className="font-bold">{t("webCallouts")}</span>
          </IntegrationCardHeader>
          <p className="text-primary mb-4 text-sm">{t("calloutsHelp")}</p>
          <ActionButton
            variant="secondary"
            hasAccess={hasAccess}
            href={`/project/${props.projectId}/settings/integrations/web-callouts`}
          >
            {t("configure")}
          </ActionButton>
        </Card>
      </div>
    </div>
  );
};
