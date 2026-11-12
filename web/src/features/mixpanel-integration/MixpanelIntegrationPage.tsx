/* eslint-disable @typescript-eslint/no-deprecated, @typescript-eslint/no-use-before-define -- Legacy UI usage retained during migration to design-system components. */
import { MixpanelLogo } from "@/src/components/MixpanelLogo";
import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { StatusBadge } from "@/src/components/ui/StatusBadge/StatusBadge";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import {
  mixpanelIntegrationFormSchema,
  MIXPANEL_REGIONS,
  type MixpanelRegion,
} from "@/src/features/mixpanel-integration/types";
import {
  LEGACY_ANALYTICS_EXPORTER_CUTOFF,
  validateExportSource,
  type V4WriteMode,
  type ExportSourceContext,
} from "@langfuse/shared";
import { Alert } from "@/src/components/design-system/Alert/Alert";

// Shared export-source UI adapters; policy in export-source-policy.ts.
import {
  buildExportSourceContext,
  getExportSourceFieldState,
  getExportSourceUnavailableMessage,
  isExportSourceSelectable,
} from "@/src/features/analytics-integrations/exportSource";
import { IntegrationSettingsSkeleton } from "@/src/features/analytics-integrations/components/IntegrationSettingsSkeleton";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import { useQueryProject } from "@/src/features/projects/hooks";
import { useMixpanelIntegration } from "@/src/features/mixpanel-integration/useMixpanelIntegration";
import { api } from "@/src/utils/api";
import { type RouterOutput } from "@/src/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/src/components/ui/card";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { Info, ExternalLink } from "@langfuse/icons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export default function MixpanelIntegrationPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const t = useTranslation(integrationMessages);

  const { hasAccess, query: state, status } = useMixpanelIntegration(projectId);

  const { project } = useQueryProject();

  return (
    <ContainerPage
      headerProps={{
        title: t("mixpanelTitle"),
        breadcrumb: [
          { name: t("settings"), href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: status && <StatusBadge type={status} />,
        actionButtonsRight: (
          <Button asChild variant="secondary">
            <a
              href="https://langfuse.com/integrations/analytics/mixpanel"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("integrationDocs")}
            </a>
          </Button>
        ),
      }}
    >
      <p className="text-primary mb-4 text-sm">
        {t("mixpanelHelp", { link: "Mixpanel" })}
      </p>
      {!hasAccess && <p className="text-sm">{t("noAccess")}</p>}
      {hasAccess && (
        <>
          <Header title={t("configuration")} />
          <Card className="p-3">
            <MixpanelLogo className="text-foreground mb-4 w-20" />
            {!state.data || !project ? (
              <IntegrationSettingsSkeleton />
            ) : (
              <MixpanelIntegrationSettingsForm
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
      {state.data?.config?.enabled && (
        <>
          <Header title={t("statusTitle")} className="mt-8" />
          <p className="text-primary text-sm">
            {t("dataSyncedUntil")}{" "}
            {state.data?.config?.lastSyncAt
              ? new Date(state.data.config.lastSyncAt).toLocaleString()
              : t("never")}
          </p>
        </>
      )}
    </ContainerPage>
  );
}

const MixpanelIntegrationSettingsForm = ({
  state,
  projectId,
  writeMode,
  projectCreatedAt,
}: {
  state?: NonNullable<RouterOutput["mixpanelIntegration"]["get"]["config"]>;
  projectId: string;
  writeMode: V4WriteMode;
  // Raw ISO string, not a Date: a Date built in the parent's JSX would be a new
  // reference on every render and would defeat the memo below.
  projectCreatedAt: string;
}) => {
  const t = useTranslation(integrationMessages);
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
  const {
    options: exportSourceOptions,
    showField: showExportSourceField,
    defaultValue: defaultExportSource,
  } = getExportSourceFieldState(state?.exportSource, exportSourceCtx);

  // Blocked-save validation instead of silent rewrite.
  const formSchema = useMemo(
    () =>
      mixpanelIntegrationFormSchema.superRefine((data, ctx) => {
        // The credential is write-only: blank keeps the saved token, so it is
        // only required when no integration exists yet.
        if (!state && !data.mixpanelProjectToken) {
          ctx.addIssue({
            code: "custom",
            path: ["mixpanelProjectToken"],
            message: t("mixpanelProjectTokenRequired"),
          });
        }
        if (!isExportSourceSelectable(data.exportSource, exportSourceCtx)) {
          ctx.addIssue({
            code: "custom",
            path: ["exportSource"],
            message: t("exportSourceNotAvailableGeneric"),
          });
        }
      }),
    [exportSourceCtx, state, t],
  );

  const mixpanelForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mixpanelRegion:
        (state?.mixpanelRegion as MixpanelRegion) ??
        MIXPANEL_REGIONS[0].subdomain,
      mixpanelProjectToken: "",
      enabled: state?.enabled ?? false,
      exportSource: defaultExportSource,
    },
  });

  const watchedExportSource = mixpanelForm.watch("exportSource");
  const watchedValidation =
    watchedExportSource != null
      ? validateExportSource(watchedExportSource, exportSourceCtx)
      : ({ ok: true } as const);

  const utils = api.useUtils();
  const mut = api.mixpanelIntegration.update.useMutation({
    onSuccess: () => {
      utils.mixpanelIntegration.invalidate();
    },
  });
  const mutDelete = api.mixpanelIntegration.delete.useMutation({
    onSuccess: () => {
      utils.mixpanelIntegration.invalidate();
    },
  });

  async function onSubmit(
    values: z.infer<typeof mixpanelIntegrationFormSchema>,
  ) {
    capture("integrations:mixpanel_form_submitted");
    mut.mutate({
      projectId,
      ...values,
    });
  }

  return (
    <Form {...mixpanelForm}>
      <form
        className="space-y-3"
        onSubmit={mixpanelForm.handleSubmit(onSubmit)}
      >
        <FormField
          control={mixpanelForm.control}
          name="mixpanelRegion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mixpanelRegion")}</FormLabel>
              <FormControl>
                <SelectInput
                  onValueChange={field.onChange}
                  value={field.value}
                  placeholder={t("selectRegion")}
                  options={MIXPANEL_REGIONS.map((region) => ({
                    value: region.subdomain,
                    label: region.description,
                  }))}
                />
              </FormControl>
              <FormDescription>{t("mixpanelRegionHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={mixpanelForm.control}
          name="mixpanelProjectToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mixpanelProjectToken")}</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder={state?.mixpanelProjectTokenDisplay}
                />
              </FormControl>
              <FormDescription>
                {state ? t("mixpanelTokenKeepBlank") : t("mixpanelTokenHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {showExportSourceField && (
          <FormField
            control={mixpanelForm.control}
            name="exportSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5 pt-2">
                  {t("exportSource")}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size="base" color="muted" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[350px] space-y-2 p-3"
                    >
                      {exportSourceOptions.map((option) => (
                        <div key={option.value} className="space-y-0.5">
                          <div className="font-bold">{option.label}</div>
                          <div className="text-muted-foreground text-xs">
                            {option.description}
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <a
                          href="https://langfuse.com/integrations/analytics/mixpanel#migrate-export-source"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs hover:underline"
                        >
                          {t("learnMoreProviders")}
                          <ExternalLink size="sm" />
                        </a>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <FormControl>
                  <SelectInput
                    onValueChange={field.onChange}
                    value={field.value}
                    placeholder={t("selectDataToExport")}
                    options={exportSourceOptions.map((option) => {
                      if (option.unavailable) {
                        return {
                          value: option.value,
                          label: t("exportSourceUnavailableLabel", {
                            label: option.label,
                          }),
                          disabled: true as const,
                          disabledReason: t("exportSourceUnavailableReason"),
                        };
                      }

                      return { value: option.value, label: option.label };
                    })}
                  />
                </FormControl>
                <FormDescription>
                  {t("mixpanelExportSourceHelp")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!watchedValidation.ok && (
          <Alert variant="destructive">
            <Alert.Title>{t("exportSourceUnavailableTitle")}</Alert.Title>
            <Alert.Description>
              {getExportSourceUnavailableMessage(watchedValidation.reason, t)}
            </Alert.Description>
          </Alert>
        )}
        <FormField
          control={mixpanelForm.control}
          name="enabled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("enabled")}</FormLabel>
              <FormControl>
                <div className="mt-1 ml-4">
                  <Switch
                    id="mixpanel-integration-enabled"
                    checked={field.value}
                    onCheckedChange={() => {
                      field.onChange(!field.value);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <div className="mt-8 flex gap-2">
        <Button
          loading={mut.isPending}
          onClick={mixpanelForm.handleSubmit(onSubmit)}
        >
          {t("save")}
        </Button>
        <Button
          variant="ghost"
          loading={mutDelete.isPending}
          disabled={!state}
          onClick={() => {
            if (confirm(t("mixpanelResetConfirm")))
              mutDelete.mutate({ projectId });
          }}
        >
          {t("reset")}
        </Button>
      </div>
    </Form>
  );
};
