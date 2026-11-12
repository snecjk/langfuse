import { zodResolver } from "@hookform/resolvers/zod";
import {
  validateExportSource,
  type ExportSourceContext,
} from "@langfuse/shared";
import { ExternalLink } from "@langfuse/icons";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { type z } from "zod";

import { Alert } from "@/src/components/design-system/Alert/Alert";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { CustomTooltip } from "@/src/components/design-system/CustomTooltip/CustomTooltip";
import { createForm } from "@/src/components/design-system/factories/createForm";
import { Input } from "@/src/components/design-system/Input/Input";
import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { SwitchInput } from "@/src/components/design-system/SwitchInput/SwitchInput";
import {
  getExportSourceFieldState,
  getExportSourceUnavailableMessage,
  isExportSourceSelectable,
} from "@/src/features/analytics-integrations/exportSource";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";
import { posthogIntegrationFormSchema } from "@/src/features/posthog-integration/types";
import { areDestinationUrlsEquivalent } from "@/src/features/automations/destinationUrl";

type PostHogIntegrationFormInput = z.input<typeof posthogIntegrationFormSchema>;

export type PostHogIntegrationFormValues = z.output<
  typeof posthogIntegrationFormSchema
>;

const PostHogForm = createForm<
  PostHogIntegrationFormInput,
  PostHogIntegrationFormValues
>();
const { useForm } = PostHogForm;

type PostHogIntegrationFormProps = {
  actionState: "idle" | "saving" | "resetting";
  configurationState: "new" | "configured";
  defaultValues: Required<PostHogIntegrationFormValues>;
  // Required to validate the selected export source against deployment policy.
  exportSourceContext: ExportSourceContext;
  onReset: () => void | Promise<void>;
  onSubmit: (values: PostHogIntegrationFormValues) => void;
  projectApiKeyDisplay?: string;
  resetError?: string;
};

function getApiKeyDescription(
  t: (
    key: "posthogApiKeyReenter" | "posthogApiKeyKeepBlank",
    params?: Record<string, string | number>,
  ) => string,
  configurationState: PostHogIntegrationFormProps["configurationState"],
  isHostnameChanged: boolean,
): string | undefined {
  if (isHostnameChanged) {
    return t("posthogApiKeyReenter");
  }
  if (configurationState === "configured") {
    return t("posthogApiKeyKeepBlank");
  }
  return undefined;
}

export function PostHogIntegrationForm({
  actionState,
  configurationState,
  defaultValues,
  exportSourceContext,
  onReset,
  onSubmit,
  projectApiKeyDisplay,
  resetError,
}: PostHogIntegrationFormProps) {
  const t = useTranslation(integrationMessages);
  const { options: exportSourceOptions, showField: showExportSourceField } =
    getExportSourceFieldState(defaultValues.exportSource, exportSourceContext);
  const formSchema = useMemo(
    () =>
      posthogIntegrationFormSchema.superRefine((data, ctx) => {
        if (configurationState === "new" && !data.posthogProjectApiKey) {
          ctx.addIssue({
            code: "custom",
            path: ["posthogProjectApiKey"],
            message: t("posthogApiKeyRequired"),
          });
        }
        if (
          configurationState === "configured" &&
          !data.posthogProjectApiKey &&
          !areDestinationUrlsEquivalent(
            data.posthogHostname,
            defaultValues.posthogHostname,
          )
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["posthogProjectApiKey"],
            message: t("posthogApiKeyRequiredHostname"),
          });
        }
        if (!isExportSourceSelectable(data.exportSource, exportSourceContext)) {
          ctx.addIssue({
            code: "custom",
            path: ["exportSource"],
            message: t("exportSourceNotAvailableGeneric"),
          });
        }
      }),
    [configurationState, defaultValues.posthogHostname, exportSourceContext, t],
  );
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const exportSource = useWatch({
    control: form.control,
    name: "exportSource",
  });
  const posthogHostname = useWatch({
    control: form.control,
    name: "posthogHostname",
  });
  const isHostnameChanged =
    configurationState === "configured" &&
    !areDestinationUrlsEquivalent(
      posthogHostname,
      defaultValues.posthogHostname,
    );
  const apiKeyDescription = getApiKeyDescription(
    t,
    configurationState,
    isHostnameChanged,
  );
  const exportSourceValidation = exportSource
    ? validateExportSource(exportSource, exportSourceContext)
    : ({ ok: true } as const);

  return (
    <ConfirmationDialogController
      title={t("posthogResetTitle")}
      text={t("posthogResetText")}
      confirmLabel={t("posthogResetConfirm")}
      variant="destructive"
      disabled={configurationState === "new"}
      loading={actionState === "resetting"}
      error={resetError}
      onConfirm={onReset}
    >
      {({ openDialog }) => (
        <PostHogForm
          form={form}
          onSubmit={onSubmit}
          actions={[
            {
              id: "save",
              type: "submit",
              text: t("save"),
              loading: actionState === "saving",
            },
            {
              id: "reset",
              type: "button",
              text: t("reset"),
              variant: "ghost",
              disabled: configurationState === "new",
              onClick: openDialog,
            },
          ]}
        >
          <PostHogForm.Field
            name="posthogHostname"
            label={t("posthogHostname")}
            description={t("posthogHostnameHelp")}
          >
            {(field) => (
              <Input
                id={field.id}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                ref={field.ref}
                aria-describedby={field.inputDescribedById}
                aria-invalid={Boolean(field.error)}
                error={Boolean(field.error)}
              />
            )}
          </PostHogForm.Field>
          <PostHogForm.Field
            name="posthogProjectApiKey"
            label={t("posthogApiKey")}
            description={apiKeyDescription}
          >
            {(field) => (
              <PasswordInput
                id={field.id}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                ref={field.ref}
                aria-describedby={field.inputDescribedById}
                aria-invalid={Boolean(field.error)}
                error={Boolean(field.error)}
                placeholder={
                  configurationState === "configured"
                    ? projectApiKeyDisplay
                    : undefined
                }
              />
            )}
          </PostHogForm.Field>
          {showExportSourceField ? (
            <CustomTooltip
              placement="bottom"
              content={
                <div className="space-y-2 py-1.5">
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
                      href="https://langfuse.com/integrations/analytics/posthog#migrate-export-source"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs hover:underline"
                    >
                      {t("learnMoreProviders")}
                      <ExternalLink size="sm" />
                    </a>
                  </div>
                </div>
              }
            >
              {({ getTriggerProps }) => (
                <PostHogForm.Field
                  name="exportSource"
                  label={t("exportSource")}
                  description={t("posthogExportSourceHelp")}
                  registerLabelTooltip={getTriggerProps}
                >
                  {(field) => (
                    <SelectInput
                      id={field.id}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-describedby={field.inputDescribedById}
                      aria-invalid={Boolean(field.error)}
                      error={Boolean(field.error)}
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
                  )}
                </PostHogForm.Field>
              )}
            </CustomTooltip>
          ) : null}
          {!exportSourceValidation.ok ? (
            <Alert variant="destructive">
              <Alert.Title>{t("exportSourceUnavailableTitle")}</Alert.Title>
              <Alert.Description>
                {getExportSourceUnavailableMessage(
                  exportSourceValidation.reason,
                  t,
                )}
              </Alert.Description>
            </Alert>
          ) : null}
          <PostHogForm.Field name="enabled" label={t("enabled")}>
            {(field) => (
              <SwitchInput
                id={field.id}
                description={t("posthogEnabledHelp")}
                name={field.name}
                checked={field.value}
                onBlur={field.onBlur}
                onCheckedChange={field.onChange}
                ref={field.ref}
                aria-describedby={field.inputDescribedById}
                aria-invalid={Boolean(field.error)}
              />
            )}
          </PostHogForm.Field>
        </PostHogForm>
      )}
    </ConfirmationDialogController>
  );
}
