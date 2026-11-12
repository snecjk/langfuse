/* eslint-disable @typescript-eslint/no-deprecated, @typescript-eslint/no-use-before-define -- Legacy UI usage retained during migration to design-system components. */
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "@langfuse/icons";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Button } from "@/src/components/ui/button";
import {
  DialogBody,
  DialogContent,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { areDestinationUrlsEquivalent } from "@/src/features/automations/destinationUrl";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import {
  WEB_CALLOUT_BLOCKED_HEADER_NAMES,
  WEB_CALLOUT_HEADER_NAME_PATTERN,
} from "@/src/features/web-callouts/headerRules";
import { api, type RouterOutputs } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";
import { ConnectedWebCalloutSettingsTable } from "./WebCalloutSettingsTable/ConnectedWebCalloutSettingsTable";

type WebCalloutEndpoint = RouterOutputs["webCallouts"]["all"][number];

const webCalloutFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1).max(100),
    url: z.url(),
    enabled: z.boolean(),
    toastMessage: z.string().trim().min(1).max(200),
    headers: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const seenHeaderNames = new Set<string>();

    data.headers.forEach((header, index) => {
      const name = header.name.trim();

      if (!name) {
        return;
      }

      const lowerName = name.toLowerCase();

      if (!WEB_CALLOUT_HEADER_NAME_PATTERN.test(name)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid header name.",
          path: ["headers", index, "name"],
        });
      }

      if (WEB_CALLOUT_BLOCKED_HEADER_NAMES.has(lowerName)) {
        ctx.addIssue({
          code: "custom",
          message: "This header is set by Langfuse and cannot be customized.",
          path: ["headers", index, "name"],
        });
      }

      if (seenHeaderNames.has(lowerName)) {
        ctx.addIssue({
          code: "custom",
          message: "Header names must be unique.",
          path: ["headers", index, "name"],
        });
      }

      seenHeaderNames.add(lowerName);
    });
  });

type WebCalloutFormValues = z.infer<typeof webCalloutFormSchema>;

export function WebCalloutSettingsPage(props: { projectId: string }) {
  const t = useTranslation(integrationMessages);
  const [formKey, setFormKey] = useState(0);

  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "integrations:CRUD",
  });

  if (!hasAccess) {
    return (
      <div>
        <Alert>
          <Alert.Title>{t("webCalloutsAccessDenied")}</Alert.Title>
          <Alert.Description>
            {t("webCalloutsAccessDeniedBody")}
          </Alert.Description>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <p className="text-primary mb-4 text-sm">
        {t("webCalloutsHelp", { link: t("webCalloutsDocsLink") })}
      </p>

      <DialogController<{ endpoint: WebCalloutEndpoint | null }>
        renderDialog={({ state, closeDialog }) => (
          <WebCalloutEndpointDialog
            key={formKey}
            projectId={props.projectId}
            endpoint={state.endpoint}
            closeDialog={closeDialog}
          />
        )}
      >
        {({ openDialog }) => (
          <ConnectedWebCalloutSettingsTable
            projectId={props.projectId}
            onCreate={() => {
              setFormKey((key) => key + 1);
              openDialog({ endpoint: null });
            }}
            onEdit={(endpoint) => {
              setFormKey((key) => key + 1);
              openDialog({ endpoint });
            }}
          />
        )}
      </DialogController>
    </div>
  );
}

function WebCalloutEndpointDialog(props: {
  projectId: string;
  endpoint: WebCalloutEndpoint | null;
  closeDialog: () => void;
}) {
  const utils = api.useUtils();
  const t = useTranslation(integrationMessages);
  const upsertMutation = api.webCallouts.upsert.useMutation({
    onSuccess: async () => {
      await utils.webCallouts.invalidate();
      showSuccessToast({
        operation: props.endpoint
          ? "web_callout_endpoint.update"
          : "web_callout_endpoint.create",
        title: props.endpoint
          ? t("webCalloutUpdateSuccess")
          : t("webCalloutCreateSuccess"),
        description: t("webCalloutSaveSuccessDesc"),
      });
      props.closeDialog();
    },
    onError: (error) => {
      showErrorToast(
        t("webCalloutSaveFailed"),
        error.message,
        classifyTrpcToastError(
          error,
          props.endpoint
            ? "web_callout_endpoint.update"
            : "web_callout_endpoint.create",
        ),
      );
    },
  });

  const form = useForm<WebCalloutFormValues>({
    resolver: zodResolver(webCalloutFormSchema),
    defaultValues: endpointToFormValues(props.endpoint),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  const currentUrl = form.watch("url");
  const isUrlChanged =
    props.endpoint !== null &&
    !areDestinationUrlsEquivalent(currentUrl, props.endpoint.url);

  const onSubmit = (values: WebCalloutFormValues) => {
    upsertMutation.mutate({
      projectId: props.projectId,
      id: values.id,
      name: values.name,
      url: values.url,
      enabled: values.enabled,
      toastMessage: values.toastMessage,
      requestHeaders: formValuesToRequestHeaders(values),
    });
  };

  return (
    <DialogContent size="lg">
      <DialogHeader>
        <DialogTitle>
          {props.endpoint ? t("webCalloutEditTitle") : t("webCalloutAddTitle")}
        </DialogTitle>
        <DialogDescription>
          {t("webCalloutDialogDesc", { link: t("webCalloutViewDocs") })}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogBody className="min-h-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("webCalloutEndpointName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("webCalloutEndpointUrl")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/langfuse/callout"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("webCalloutUrlHelp")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>{t("webCalloutEnabled")}</FormLabel>
                    <FormDescription>
                      {t("webCalloutEnabledHelp")}
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

            <FormField
              control={form.control}
              name="toastMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("webCalloutToastMessageLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("webCalloutToastMessageHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>{t("webCalloutHeadersLabel")}</FormLabel>
              <FormDescription className="mb-2">
                {t("webCalloutHeadersHelp")}
                {isUrlChanged ? t("webCalloutHeadersUrlChanged") : ""}
              </FormDescription>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const currentHeaderName = form.watch(`headers.${index}.name`);
                  const valuePlaceholder = getHeaderValuePlaceholder({
                    t,
                    isExistingHeader: hasExistingHeaderName(
                      props.endpoint,
                      currentHeaderName,
                    ),
                    isUrlChanged,
                  });

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2"
                    >
                      <FormField
                        control={form.control}
                        name={`headers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={t("headerName")} {...field} />
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
                                placeholder={valuePlaceholder}
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <X size="base" color="default" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("webCalloutRemoveHeader")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() =>
                  append({
                    name: "",
                    value: "",
                  })
                }
              >
                <Plus size="base" color="default" __rawClassName="mr-1" />
                {t("webCalloutAddHeader")}
              </Button>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={props.closeDialog}>
              {t("cancel")}
            </Button>
            <Button type="submit" loading={upsertMutation.isPending}>
              {t("webCalloutSaveEndpoint")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

const endpointToFormValues = (
  endpoint: WebCalloutEndpoint | null,
): WebCalloutFormValues => ({
  id: endpoint?.id,
  name: endpoint?.name ?? "Default",
  url: endpoint?.url ?? "",
  enabled: endpoint?.enabled ?? true,
  toastMessage: endpoint?.toastMessage ?? "Callout sent",
  headers: (endpoint?.requestHeaderKeys ?? []).map((name: string) => ({
    name,
    value: "",
  })),
});

const formValuesToRequestHeaders = (
  values: WebCalloutFormValues,
): Record<string, string> =>
  Object.fromEntries(
    values.headers
      .filter((header) => header.name.trim())
      .map((header) => [header.name.trim(), header.value.trim()]),
  );

const getHeaderValuePlaceholder = ({
  t,
  isExistingHeader,
  isUrlChanged,
}: {
  t: (key: "headerValue" | "webCalloutReenterHeaderValue") => string;
  isExistingHeader: boolean;
  isUrlChanged: boolean;
}) => {
  if (!isExistingHeader) {
    return t("headerValue");
  }

  return isUrlChanged ? t("webCalloutReenterHeaderValue") : "***";
};

const hasExistingHeaderName = (
  endpoint: WebCalloutEndpoint | null,
  name: string,
) => {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) {
    return false;
  }

  return (
    endpoint?.requestHeaderKeys.some(
      (headerName: string) => headerName.toLowerCase() === normalizedName,
    ) ?? false
  );
};
