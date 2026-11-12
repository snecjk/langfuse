/* eslint-disable no-nested-ternary, @typescript-eslint/no-use-before-define */
import { PostHogLogo } from "@/src/components/PostHogLogo";
import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { StatusBadge } from "@/src/components/ui/StatusBadge/StatusBadge";
import { Button } from "@/src/components/design-system/Button/Button";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { PostHogStatusSection } from "@/src/features/posthog-integration/components/PostHogStatusSection";
import {
  PostHogIntegrationForm,
  type PostHogIntegrationFormValues,
} from "@/src/features/posthog-integration/components/PostHogIntegrationForm";
import {
  LEGACY_ANALYTICS_EXPORTER_CUTOFF,
  type V4WriteMode,
  type ExportSourceContext,
} from "@langfuse/shared";
// Shared export-source UI adapters; policy in export-source-policy.ts.
import {
  buildExportSourceContext,
  getExportSourceFormValue,
} from "@/src/features/analytics-integrations/exportSource";
import { IntegrationSettingsSkeleton } from "@/src/features/analytics-integrations/components/IntegrationSettingsSkeleton";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import { useQueryProject } from "@/src/features/projects/hooks";
import { usePostHogIntegration } from "@/src/features/posthog-integration/usePostHogIntegration";
import { api } from "@/src/utils/api";
import { type RouterOutput } from "@/src/utils/types";
import { Card } from "@/src/components/ui/card";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export default function PostHogIntegrationPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const t = useTranslation(integrationMessages);

  const { hasAccess, query: state, status } = usePostHogIntegration(projectId);

  const { project } = useQueryProject();

  return (
    <ContainerPage
      headerProps={{
        title: t("posthogTitle"),
        breadcrumb: [
          { name: t("settings"), href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: status && <StatusBadge type={status} />,
        actionButtonsRight: (
          <Button
            href="https://langfuse.com/integrations/analytics/posthog"
            text={t("integrationDocsShort")}
            variant="secondary"
          />
        ),
      }}
    >
      <p className="text-primary mb-4 text-sm">
        {t("posthogHelp", {
          link: "PostHog",
        })}
      </p>
      {!hasAccess && <p className="text-sm">{t("noAccess")}</p>}
      {hasAccess && (
        <>
          <Header title={t("configuration")} />
          <Card className="p-3">
            <PostHogLogo className="text-foreground mb-4 w-36" />
            {!state.data || !project ? (
              <IntegrationSettingsSkeleton />
            ) : (
              <ConnectedPostHogIntegrationForm
                // Draft lifetime = entity identity, so background refetches
                // cannot reset a draft in progress.
                key={`${projectId}:${state.data.config ? "configured" : "new"}`}
                state={state.data.config ?? undefined}
                projectId={projectId}
                writeMode={state.data.writeMode}
                projectCreatedAt={project.createdAt}
              />
            )}
          </Card>
        </>
      )}
      {state.data?.config && (
        <PostHogStatusSection config={state.data.config} />
      )}
    </ContainerPage>
  );
}

const ConnectedPostHogIntegrationForm = ({
  state,
  projectId,
  writeMode,
  projectCreatedAt,
}: {
  state?: NonNullable<RouterOutput["posthogIntegration"]["get"]["config"]>;
  projectId: string;
  writeMode: V4WriteMode;
  // Raw ISO string, not a Date: a Date built in the parent's JSX would be a new
  // reference on every render and would defeat the memo below.
  projectCreatedAt: string;
}) => {
  const capture = usePostHogClientCapture();
  const { isLangfuseCloud } = useLangfuseCloudRegion();
  const integrationCreatedAt = state?.createdAt;
  const exportSourceCtx: ExportSourceContext = useMemo(
    () =>
      buildExportSourceContext({
        writeMode,
        isCloud: isLangfuseCloud,
        projectCreatedAt: new Date(projectCreatedAt),
        integrationCreatedAt: integrationCreatedAt
          ? new Date(integrationCreatedAt)
          : null,
        exporterCutoff: LEGACY_ANALYTICS_EXPORTER_CUTOFF,
      }),
    [writeMode, isLangfuseCloud, projectCreatedAt, integrationCreatedAt],
  );
  const defaultExportSource = getExportSourceFormValue(
    state?.exportSource,
    exportSourceCtx,
  );

  const utils = api.useUtils();
  const mut = api.posthogIntegration.update.useMutation({
    onSuccess: () => {
      utils.posthogIntegration.invalidate();
    },
  });
  const mutDelete = api.posthogIntegration.delete.useMutation({
    onSuccess: () => {
      utils.posthogIntegration.invalidate();
    },
  });

  function onSubmit(values: PostHogIntegrationFormValues) {
    capture("integrations:posthog_form_submitted");
    mut.mutate({
      projectId,
      ...values,
    });
  }

  return (
    <PostHogIntegrationForm
      actionState={
        mut.isPending ? "saving" : mutDelete.isPending ? "resetting" : "idle"
      }
      configurationState={state ? "configured" : "new"}
      defaultValues={{
        posthogHostname: state?.posthogHostName ?? "",
        posthogProjectApiKey: "",
        enabled: state?.enabled ?? false,
        exportSource: defaultExportSource,
      }}
      exportSourceContext={exportSourceCtx}
      projectApiKeyDisplay={state?.posthogApiKeyDisplay}
      resetError={mutDelete.error?.message}
      onSubmit={onSubmit}
      onReset={() => mutDelete.mutateAsync({ projectId })}
    />
  );
};
