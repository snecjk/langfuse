/* eslint-disable no-nested-ternary, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
/* eslint-disable @repo/no-null-render */
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import React, { useState } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, LockOpen, Plus, X } from "@langfuse/icons";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import { Button } from "@/src/components/ui/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { CodeMirrorEditor } from "@/src/components/editor/CodeMirrorEditor";
import { CodeSection } from "@/src/components/design-system/CodeSection/CodeSection";
import { type Prisma, WebhookProtectedHeaders } from "@langfuse/shared";
import { Skeleton } from "@/src/components/ui/skeleton";
import { getFormattedPayload } from "@/src/features/experiments/utils/format";
import { Spinner } from "@/src/components/design-system/Spinner/Spinner";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

const RemoteExperimentSetupSchema = z.object({
  url: z.url(),
  defaultPayload: z.string(),
  enabled: z.boolean(),
  signingEnabled: z.boolean(),
  headers: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      isSecret: z.boolean(),
      displayValue: z.string().optional(),
    }),
  ),
});

type RemoteExperimentSetupForm = z.infer<typeof RemoteExperimentSetupSchema>;

export const RemoteExperimentUpsertForm = ({
  projectId,
  datasetId,
  existingRemoteExperiment,
  setShowRemoteExperimentUpsertForm,
  onBack,
}: {
  projectId: string;
  datasetId: string;
  existingRemoteExperiment?: {
    url: string;
    payload: Prisma.JsonValue;
    enabled?: boolean;
    displaySecretKey?: string | null;
    displayHeaders?: Record<string, { secret: boolean; value: string }>;
  } | null;
  setShowRemoteExperimentUpsertForm: (show: boolean) => void;
  onBack?: () => void;
}) => {
  const hasDatasetAccess = useHasProjectAccess({
    projectId,
    scope: "datasets:CUD",
  });
  const t = useTranslation(experimentMessages);

  const dataset = api.datasets.byId.useQuery({
    projectId,
    datasetId,
  });
  const utils = api.useUtils();

  // Set when the mutation generated a new signing secret; shown exactly once.
  const [oneTimeSecret, setOneTimeSecret] = useState<string | null>(null);

  const form = useForm<RemoteExperimentSetupForm>({
    resolver: zodResolver(RemoteExperimentSetupSchema),
    defaultValues: {
      url: existingRemoteExperiment?.url || "",
      defaultPayload: getFormattedPayload(existingRemoteExperiment?.payload),
      enabled: existingRemoteExperiment?.enabled ?? true,
      signingEnabled: Boolean(existingRemoteExperiment?.displaySecretKey),
      headers: Object.entries(
        existingRemoteExperiment?.displayHeaders ?? {},
      ).map(([name, header]) => ({
        name,
        value: "",
        isSecret: header.secret,
        displayValue: header.value,
      })),
    },
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  const upsertRemoteExperimentMutation =
    api.datasets.upsertRemoteExperiment.useMutation({
      onSuccess: (data) => {
        showSuccessToast({
          operation: "remote_experiment.configure",
          title: t("setupSuccess"),
          description: t("setupSuccessHelp"),
        });
        utils.datasets.getRemoteExperiment.invalidate({
          projectId,
          datasetId,
        });
        if (data.unencryptedSecretKey) {
          setOneTimeSecret(data.unencryptedSecretKey);
        } else {
          setShowRemoteExperimentUpsertForm(false);
        }
      },
      onError: (error) => {
        showErrorToast(
          error.message || t("setupFailed"),
          t("setupFailedHelp"),
          classifyTrpcToastError(error, "remote_experiment.update"),
        );
      },
    });

  const deleteRemoteExperimentMutation =
    api.datasets.deleteRemoteExperiment.useMutation({
      onSuccess: () => {
        showSuccessToast({
          operation: "remote_experiment.delete",
          title: t("deleteSuccess"),
          description: t("deleteSuccessHelp"),
        });
        setShowRemoteExperimentUpsertForm(false);
        utils.datasets.getRemoteExperiment.invalidate({
          projectId,
          datasetId,
        });
      },
      onError: (error) => {
        showErrorToast(
          error.message || t("deleteFailed"),
          t("deleteFailedHelp"),
          classifyTrpcToastError(error, "remote_experiment.delete"),
        );
      },
    });

  const onSubmit = (data: RemoteExperimentSetupForm) => {
    if (data.defaultPayload.trim()) {
      try {
        JSON.parse(data.defaultPayload);
      } catch {
        form.setError("defaultPayload", {
          message: t("invalidJson"),
        });
        return;
      }
    }

    const requestHeaders: Record<string, { secret: boolean; value: string }> =
      {};
    for (const [index, header] of data.headers.entries()) {
      const name = header.name.trim();
      if (!name) continue;
      if (WebhookProtectedHeaders.includes(name.toLowerCase())) {
        form.setError(`headers.${index}.name`, {
          message: t("headerOverridden", { name }),
        });
        return;
      }
      requestHeaders[name] = {
        secret: header.isSecret,
        value: header.value,
      };
    }

    upsertRemoteExperimentMutation.mutate({
      projectId,
      datasetId,
      url: data.url,
      defaultPayload: data.defaultPayload,
      enabled: data.enabled,
      signingEnabled: data.signingEnabled,
      requestHeaders,
    });
  };

  const handleDelete = () => {
    if (confirm(t("confirmDeleteTrigger"))) {
      deleteRemoteExperimentMutation.mutate({
        projectId,
        datasetId,
      });
    }
  };

  if (!hasDatasetAccess) {
    return null;
  }

  if (dataset.isPending) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (oneTimeSecret) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("saveSigningSecret")}</DialogTitle>
          <DialogDescription>{t("saveSigningSecretHelp")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CodeSection variant="outline" content={oneTimeSecret} />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => setShowRemoteExperimentUpsertForm(false)}
          >
            {t("saveSecret")}
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <Button
          variant="ghost"
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              setShowRemoteExperimentUpsertForm(false);
            }
          }}
          className="inline-block self-start"
        >
          {t("back")}
        </Button>
        <DialogTitle>
          {existingRemoteExperiment
            ? t("editRemoteExperimentTrigger")
            : t("setupRemoteExperimentTrigger")}
        </DialogTitle>
        <DialogDescription>
          {t("setupRemoteTriggerHelp", {
            name: dataset.isSuccess ? `"${dataset.data?.name}"` : "",
          })}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogBody>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("urlLabel")}</FormLabel>
                  <FormDescription>{t("urlHelp")}</FormDescription>
                  <FormControl>
                    <Input
                      placeholder="https://your-service.com/webhook"
                      {...field}
                    />
                  </FormControl>
                  {field.value.startsWith("http://") && (
                    <p className="text-dark-yellow text-sm">
                      {t("httpWarning")}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultPayload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("defaultConfig")}</FormLabel>
                  <FormDescription>{t("defaultConfigHelp")}</FormDescription>
                  <CodeMirrorEditor
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    editable
                    mode="json"
                    minHeight={200}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signingEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("signRequests")}</FormLabel>
                    <FormDescription>
                      {field.value
                        ? existingRemoteExperiment?.displaySecretKey
                          ? t("signRequestsHelp")
                          : t("signRequestsWillGenerate")
                        : t("signRequestsDisabled")}
                    </FormDescription>
                    {field.value &&
                      existingRemoteExperiment?.displaySecretKey && (
                        <div className="pt-2">
                          <CodeSection
                            variant="outline"
                            isCollapsible
                            defaultCollapsed
                            content={existingRemoteExperiment.displaySecretKey}
                          />
                          <div className="text-muted-foreground mt-1 text-xs">
                            {t("secretEncrypted")}
                          </div>
                        </div>
                      )}
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <AccordionPrimitive.Root type="single" collapsible>
              <AccordionPrimitive.Item value="advanced">
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-start gap-2 py-2 text-sm font-bold transition-all hover:underline [&>svg]:order-first [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0">
                    <DropdownIndicator nudge />
                    {t("advancedOptions")}
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all">
                  <div className="space-y-6 px-1 pt-2 pb-4">
                    <div>
                      <FormLabel>{t("customHeaders")}</FormLabel>
                      <FormDescription className="mb-2">
                        {t("customHeadersHelp")}
                      </FormDescription>

                      {headerFields.map((field, index) => {
                        const isSecret = form.watch(
                          `headers.${index}.isSecret`,
                        );
                        const displayValue = form.watch(
                          `headers.${index}.displayValue`,
                        );

                        return (
                          <div
                            key={field.id}
                            className="mb-2 grid grid-cols-[1fr_1fr_auto_auto] gap-2"
                          >
                            <FormField
                              control={form.control}
                              name={`headers.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={t("headerName")}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`headers.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={
                                        displayValue || t("headerValue")
                                      }
                                      {...field}
                                      type={isSecret ? "password" : "text"}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                form.setValue(
                                  `headers.${index}.isSecret`,
                                  !isSecret,
                                )
                              }
                              title={
                                isSecret
                                  ? t("makeHeaderPublic")
                                  : t("makeHeaderSecret")
                              }
                            >
                              {isSecret ? (
                                <Lock
                                  size="base"
                                  __rawClassName="text-orange-500"
                                />
                              ) : (
                                <LockOpen size="base" color="muted" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHeader(index)}
                            >
                              <X size="base" color="default" />
                            </Button>
                          </div>
                        );
                      })}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendHeader({
                            name: "",
                            value: "",
                            isSecret: false,
                            displayValue: "",
                          })
                        }
                        className="mt-2"
                      >
                        <Plus
                          size="base"
                          color="default"
                          __rawClassName="mr-1"
                        />
                        {t("addCustomHeader")}
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>{t("enabled")}</FormLabel>
                            <FormDescription>
                              {field.value
                                ? t("triggerActive")
                                : t("triggerPaused")}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            </AccordionPrimitive.Root>
          </DialogBody>

          <DialogFooter>
            <div className="flex w-full justify-between">
              {existingRemoteExperiment && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteRemoteExperimentMutation.isPending}
                >
                  {deleteRemoteExperimentMutation.isPending && (
                    <div className="mr-2">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {t("delete")}
                </Button>
              )}
              <Button
                type="submit"
                className="ml-auto"
                disabled={upsertRemoteExperimentMutation.isPending}
              >
                {upsertRemoteExperimentMutation.isPending ? (
                  <div className="mr-2">
                    <Spinner size="sm" />
                  </div>
                ) : null}
                {existingRemoteExperiment ? t("update") : t("setUp")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
