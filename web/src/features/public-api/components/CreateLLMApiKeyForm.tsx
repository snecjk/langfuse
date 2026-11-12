/* eslint-disable no-nested-ternary, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { useFieldArray, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type BedrockApiKey,
  type BedrockAccessKeys,
  type BedrockConfig,
  type OpenAIConfig,
  type VertexAIConfig,
  LLMAdapter,
  BEDROCK_USE_DEFAULT_CREDENTIALS,
  TYPESAFE_UPSTREAMS,
  VERTEXAI_USE_DEFAULT_CREDENTIALS,
  resolveTypeSafeUpstream,
  type TypeSafeUpstream,
} from "@langfuse/shared";
import { ChevronDown, PlusIcon, TrashIcon } from "@langfuse/icons";
import { z } from "zod";
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
import { Input } from "@/src/components/ui/input";
import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { TypeSafeUpstreamCards } from "@/src/features/llm-api-key/components/TypeSafeUpstreamCards/TypeSafeUpstreamCards";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import {
  api,
  reportTrpcErrorWithoutToast,
  type RouterOutputs,
} from "@/src/utils/api";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import type { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";
import { DialogFooter, DialogBody } from "@/src/components/ui/dialog";
import { env } from "@/src/env.mjs";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";
import {
  AuthMethod,
  BedrockAuthMethodSchema,
  type BedrockAuthMethod,
} from "@/src/features/llm-api-key/types";

const isLangfuseCloud = Boolean(env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION);

/**
 * UI-only sentinel value for the adapter dropdown. Selecting it does not set a
 * real adapter; instead it surfaces guidance that any OpenAI-compatible
 * provider can be added through one of the existing adapters.
 */
const OTHER_MODEL_OPTION = "other-model";

/**
 * Picker labels that differ from the stored adapter value. Naming the
 * `systemone` API tells users that third-party providers serving it can use
 * the TypeSafe adapter with a custom base URL.
 */
const ADAPTER_PICKER_LABELS: Partial<Record<LLMAdapter, string>> = {
  [LLMAdapter.TypeSafe]: "TypeSafe (System One)",
};

const isCustomModelsRequired = (adapter: LLMAdapter) =>
  adapter === LLMAdapter.Azure || adapter === LLMAdapter.Bedrock;

const hasText = (value?: string) => Boolean(value?.trim());

/**
 * Whether the selected auth method matches the existing one (i.e. credentials
 * can be preserved on update). DefaultCredentials is grouped with AccessKeys
 * because both use SigV4-based authentication via the AWS SDK.
 */
const isMatchingBedrockAuthMethod = (
  newAuthMethod: BedrockAuthMethod,
  existingAuthMethod?: BedrockAuthMethod,
): boolean =>
  (newAuthMethod === AuthMethod.ApiKey &&
    existingAuthMethod === AuthMethod.ApiKey) ||
  (newAuthMethod === AuthMethod.AccessKeys &&
    (existingAuthMethod === AuthMethod.AccessKeys ||
      existingAuthMethod === AuthMethod.DefaultCredentials));

export type LlmApiKeyListItem =
  | RouterOutputs["llmApiKey"]["all"]["data"][number]
  | RouterOutputs["organizationLlmApiKey"]["all"]["data"][number];

const getInitialBedrockAuthMethod = (params: {
  mode: "create" | "update";
  existingAuthMethod?: BedrockAuthMethod;
}): BedrockAuthMethod => {
  if (params.mode === "update") {
    return params.existingAuthMethod === AuthMethod.ApiKey
      ? AuthMethod.ApiKey
      : AuthMethod.AccessKeys;
  }

  return AuthMethod.AccessKeys;
};

const createFormSchema = (params: {
  mode: "create" | "update";
  existingAuthMethod?: BedrockAuthMethod;
}) =>
  z
    .object({
      secretKey: z.string().optional(),
      provider: z
        .string()
        .min(1, "providerNameRequired")
        .regex(/^[^:]+$/, "providerNameColonError"),
      adapter: z.enum(LLMAdapter),
      baseURL: z.union([z.literal(""), z.url()]),
      typeSafeUpstream: z.enum(
        TYPESAFE_UPSTREAMS.map(
          (upstream): TypeSafeUpstream["id"] => upstream.id,
        ),
      ),
      withDefaultModels: z.boolean(),
      customModels: z.array(z.object({ value: z.string().min(1) })),
      awsAccessKeyId: z.string().optional(),
      awsSecretAccessKey: z.string().optional(),
      bedrockApiKey: z.string().optional(),
      authMethod: BedrockAuthMethodSchema,
      awsRegion: z.string().optional(),
      vertexAILocation: z.string().optional(),
      openAIUseResponsesApi: z.boolean(),
      extraHeaders: z.array(
        z.object({
          key: z.string().min(1),
          value:
            params.mode === "create"
              ? z.string().min(1)
              : z.string().optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      if (data.adapter !== LLMAdapter.Bedrock) return;

      const hasRegion = hasText(data.awsRegion);
      const hasAccessKeyId = hasText(data.awsAccessKeyId);
      const hasSecretAccessKey = hasText(data.awsSecretAccessKey);
      const hasBedrockApiKey = hasText(data.bedrockApiKey);
      const hasAnyAccessKeys = hasAccessKeyId || hasSecretAccessKey;
      const { authMethod } = data;
      const isUpdatingCurrentAuthMethod =
        params.mode === "update" &&
        isMatchingBedrockAuthMethod(authMethod, params.existingAuthMethod);

      if (!hasRegion) {
        ctx.addIssue({
          code: "custom",
          message: "awsRegionRequired",
          path: ["awsRegion"],
        });
      }

      if (authMethod === AuthMethod.AccessKeys) {
        if (isUpdatingCurrentAuthMethod && !hasAnyAccessKeys) {
          return;
        }

        if (!isLangfuseCloud && !hasAnyAccessKeys) {
          return;
        }

        if (!hasAccessKeyId) {
          ctx.addIssue({
            code: "custom",
            message: "awsAccessKeyIdRequired",
            path: ["awsAccessKeyId"],
          });
        }

        if (!hasSecretAccessKey) {
          ctx.addIssue({
            code: "custom",
            message: "awsSecretAccessKeyRequired",
            path: ["awsSecretAccessKey"],
          });
        }
        return;
      }

      if (isUpdatingCurrentAuthMethod && !hasBedrockApiKey) {
        return;
      }

      if (!hasBedrockApiKey) {
        ctx.addIssue({
          code: "custom",
          message: "bedrockApiKeyRequired",
          path: ["bedrockApiKey"],
        });
      }
    })
    .refine(
      (data) => {
        if (isCustomModelsRequired(data.adapter)) {
          return data.customModels.length > 0;
        }
        return true;
      },
      {
        message: "customModelsRequired",
        path: ["customModels"],
      },
    )
    // 2) For adapters that support defaults, require default models or at least one custom model
    .refine(
      (data) => {
        if (isCustomModelsRequired(data.adapter)) {
          return true;
        }
        return data.withDefaultModels || data.customModels.length > 0;
      },
      {
        message: "customModelOrDefaultsRequired",
        path: ["withDefaultModels"],
      },
    )
    // Vertex AI validation - service account key or ADC sentinel value required
    .refine(
      (data) => {
        if (data.adapter !== LLMAdapter.VertexAI) return true;

        // In update mode, credentials are optional (existing ones are preserved)
        if (params.mode === "update") return true;

        // secretKey is required (either JSON key or VERTEXAI_USE_DEFAULT_CREDENTIALS sentinel)
        return !!data.secretKey;
      },
      {
        message: isLangfuseCloud ? "gcpKeyRequired" : "gcpKeyOrAdcRequired",
        path: ["secretKey"],
      },
    )
    .refine(
      (data) =>
        data.adapter === LLMAdapter.Bedrock ||
        data.adapter === LLMAdapter.VertexAI ||
        params.mode === "update" ||
        data.secretKey,
      {
        message: "secretKeyRequired",
        path: ["secretKey"],
      },
    )
    .refine(
      (data) => {
        if (data.adapter !== LLMAdapter.Azure) return true;
        return data.baseURL && data.baseURL.trim() !== "";
      },
      {
        message: "baseUrlRequiredAzure",
        path: ["baseURL"],
      },
    )
    .refine(
      (data) =>
        data.adapter !== LLMAdapter.TypeSafe ||
        data.typeSafeUpstream !== "custom" ||
        data.baseURL.trim() !== "",
      {
        message: "baseUrlRequiredCustom",
        path: ["baseURL"],
      },
    );

export type LlmConnectionFormOwner =
  | { scope: "project"; projectId: string }
  | { scope: "organization"; organizationId: string };

// Save failures render beside the submit button; a local handler replaces the
// React Query default that would show the same error in a toast.
const suppressSaveErrorToast = () => undefined;

interface CreateLLMApiKeyFormProps {
  owner: LlmConnectionFormOwner;
  onSuccess: () => void;
  customization: ReturnType<typeof useUiCustomization>;
  mode?: "create" | "update";
  existingKey?: LlmApiKeyListItem;
}

export function CreateLLMApiKeyForm({
  owner,
  onSuccess,
  customization,
  mode = "create",
  existingKey,
}: CreateLLMApiKeyFormProps) {
  const t = useTranslation(integrationMessages);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // When the "Other model" option is selected we hide the form fields and show
  // guidance instead. This is purely UI state and never reaches the form value.
  const [showOtherModelInfo, setShowOtherModelInfo] = useState(false);
  const [adapterSelectOpen, setAdapterSelectOpen] = useState(false);
  const utils = api.useUtils();
  const capture = usePostHogClientCapture();

  const projectExistingKeys = api.llmApiKey.all.useQuery(
    {
      projectId: owner.scope === "project" ? owner.projectId : "",
      includeDecisionModels: true,
    },
    { enabled: owner.scope === "project" },
  );
  const organizationExistingKeys = api.organizationLlmApiKey.all.useQuery(
    {
      orgId: owner.scope === "organization" ? owner.organizationId : "",
      includeDecisionModels: true,
    },
    { enabled: owner.scope === "organization" },
  );
  const existingKeys =
    owner.scope === "project"
      ? projectExistingKeys.data?.data
      : organizationExistingKeys.data?.data;
  const adapterOptions = Object.values(LLMAdapter);

  const mutCreateLlmApiKey = api.llmApiKey.create.useMutation({
    onSuccess: () => utils.llmApiKey.invalidate(),
    onError: suppressSaveErrorToast,
  });

  const mutUpdateLlmApiKey = api.llmApiKey.update.useMutation({
    onSuccess: () => utils.llmApiKey.invalidate(),
    onError: suppressSaveErrorToast,
  });

  const mutTestLLMApiKey = api.llmApiKey.test.useMutation();
  const mutTestUpdateLLMApiKey = api.llmApiKey.testUpdate.useMutation();
  const mutCreateOrganizationLlmApiKey =
    api.organizationLlmApiKey.create.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.organizationLlmApiKey.invalidate(),
          utils.llmApiKey.invalidate(),
        ]);
      },
      onError: suppressSaveErrorToast,
    });
  const mutUpdateOrganizationLlmApiKey =
    api.organizationLlmApiKey.update.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.organizationLlmApiKey.invalidate(),
          utils.llmApiKey.invalidate(),
        ]);
      },
      onError: suppressSaveErrorToast,
    });
  const mutTestOrganizationLlmApiKey =
    api.organizationLlmApiKey.test.useMutation();
  const mutTestUpdateOrganizationLlmApiKey =
    api.organizationLlmApiKey.testUpdate.useMutation();

  const defaultAdapter: LLMAdapter = customization?.defaultModelAdapter
    ? LLMAdapter[customization.defaultModelAdapter]
    : LLMAdapter.OpenAI;

  const getCustomizedBaseURL = (adapter: LLMAdapter) => {
    switch (adapter) {
      case LLMAdapter.OpenAI:
        return customization?.defaultBaseUrlOpenAI ?? "";
      case LLMAdapter.Azure:
        return customization?.defaultBaseUrlAzure ?? "";
      case LLMAdapter.Anthropic:
        return customization?.defaultBaseUrlAnthropic ?? "";
      default:
        return "";
    }
  };

  const formSchema = createFormSchema({
    mode,
    existingAuthMethod: existingKey?.authMethod,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues:
      mode === "update" && existingKey
        ? {
            adapter: existingKey.adapter as LLMAdapter,
            provider: existingKey.provider,
            secretKey:
              existingKey.adapter === LLMAdapter.VertexAI &&
              existingKey.displaySecretKey === "Default GCP credentials (ADC)"
                ? VERTEXAI_USE_DEFAULT_CREDENTIALS
                : "",
            baseURL:
              existingKey.baseURL ??
              getCustomizedBaseURL(existingKey.adapter as LLMAdapter),
            typeSafeUpstream: resolveTypeSafeUpstream(existingKey.baseURL).id,
            withDefaultModels: existingKey.withDefaultModels,
            customModels: existingKey.customModels.map((value) => ({ value })),
            extraHeaders:
              existingKey.extraHeaderKeys?.map((key) => ({ key, value: "" })) ??
              [],
            vertexAILocation:
              existingKey.adapter === LLMAdapter.VertexAI && existingKey.config
                ? ((existingKey.config as VertexAIConfig).location ?? "")
                : "",
            openAIUseResponsesApi:
              existingKey.adapter === LLMAdapter.OpenAI &&
              existingKey.config != null
                ? Boolean((existingKey.config as OpenAIConfig).useResponsesApi)
                : false,
            awsRegion:
              existingKey.adapter === LLMAdapter.Bedrock && existingKey.config
                ? ((existingKey.config as BedrockConfig).region ?? "")
                : "",
            awsAccessKeyId: "",
            awsSecretAccessKey: "",
            bedrockApiKey: "",
            authMethod: getInitialBedrockAuthMethod({
              mode,
              existingAuthMethod: existingKey.authMethod,
            }),
          }
        : {
            adapter: defaultAdapter,
            provider: "",
            secretKey: "",
            baseURL: getCustomizedBaseURL(defaultAdapter),
            typeSafeUpstream: TYPESAFE_UPSTREAMS[0].id,
            withDefaultModels: true,
            customModels: [],
            extraHeaders: [],
            vertexAILocation: "global",
            openAIUseResponsesApi: false,
            awsRegion: "",
            awsAccessKeyId: "",
            awsSecretAccessKey: "",
            bedrockApiKey: "",
            authMethod: getInitialBedrockAuthMethod({
              mode,
            }),
          },
  });

  const currentAdapter = form.watch("adapter");
  const currentAuthMethod = form.watch("authMethod");
  const currentTypeSafeUpstreamId = form.watch("typeSafeUpstream");
  const currentTypeSafeUpstream =
    TYPESAFE_UPSTREAMS.find(
      (upstream) => upstream.id === currentTypeSafeUpstreamId,
    ) ?? TYPESAFE_UPSTREAMS[0];
  const customTypeSafeBaseURLDraft = useRef("");
  const isKeepingCurrentBedrockAuthMethod =
    mode === "update" &&
    currentAdapter === LLMAdapter.Bedrock &&
    isMatchingBedrockAuthMethod(currentAuthMethod, existingKey?.authMethod);
  const isUsingDefaultAwsCredentialsForCurrentAuthMethod =
    currentAuthMethod === AuthMethod.AccessKeys &&
    existingKey?.authMethod === AuthMethod.DefaultCredentials;

  const hasAdvancedSettings = (adapter: LLMAdapter) =>
    adapter === LLMAdapter.OpenAI ||
    adapter === LLMAdapter.Anthropic ||
    adapter === LLMAdapter.VertexAI ||
    adapter === LLMAdapter.GoogleAIStudio ||
    adapter === LLMAdapter.TypeSafe;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customModels",
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: "extraHeaders",
  });

  const renderCustomModelsField = () => (
    <FormField
      control={form.control}
      name="customModels"
      render={() => (
        <FormItem>
          <FormLabel>{t("customModels")}</FormLabel>
          <FormDescription>{t("customModelsHelp")}</FormDescription>
          {currentAdapter === LLMAdapter.Azure && (
            <FormDescription className="text-dark-yellow">
              {t("customModelsAzureHelp")}
            </FormDescription>
          )}

          {currentAdapter === LLMAdapter.Bedrock && (
            <FormDescription className="text-dark-yellow">
              {t("customModelsBedrockHelp")}
            </FormDescription>
          )}

          {fields.map((customModel, index) => (
            <span key={customModel.id} className="flex flex-row space-x-2">
              <Input
                {...form.register(`customModels.${index}.value`)}
                placeholder={t("customModelPlaceholder", {
                  index: index + 1,
                })}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(index)}
              >
                <TrashIcon size="base" color="default" />
              </Button>
            </span>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => append({ value: "" })}
            className="w-full"
          >
            <PlusIcon
              size="base"
              color="default"
              __rawClassName="mr-1.5 -ml-0.5"
              aria-hidden="true"
            />
            {t("addCustomModel")}
          </Button>
        </FormItem>
      )}
    />
  );

  const renderExtraHeadersField = () => (
    <FormField
      control={form.control}
      name="extraHeaders"
      render={() => (
        <FormItem>
          <FormLabel>{t("extraHeaders")}</FormLabel>
          <FormDescription>
            {t("extraHeadersHelp", {
              storage: isLangfuseCloud
                ? t("extraHeadersCloudStorage")
                : t("extraHeadersDbStorage"),
            })}
          </FormDescription>

          {headerFields.map((header, index) => (
            <div key={header.id} className="flex flex-row space-x-2">
              <Input
                {...form.register(`extraHeaders.${index}.key`)}
                placeholder={t("headerName")}
              />
              <Input
                {...form.register(`extraHeaders.${index}.value`)}
                placeholder={
                  mode === "update" &&
                  existingKey?.extraHeaderKeys &&
                  existingKey.extraHeaderKeys[index]
                    ? "***"
                    : t("headerValue")
                }
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeHeader(index)}
              >
                <TrashIcon size="base" color="default" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={() => appendHeader({ key: "", value: "" })}
            className="w-full"
          >
            <PlusIcon
              size="base"
              color="default"
              __rawClassName="mr-1.5 -ml-0.5"
              aria-hidden="true"
            />
            {t("addHeaderButton")}
          </Button>
        </FormItem>
      )}
    />
  );

  // Disable provider and adapter fields in update mode
  const isFieldDisabled = (fieldName: string) => {
    if (mode !== "update") return false;
    return ["provider", "adapter"].includes(fieldName);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (mode === "create") {
      if (existingKeys?.map((key) => key.provider).includes(values.provider)) {
        form.setError("provider", {
          type: "manual",
          message: t("duplicateProvider"),
        });
        return;
      }
    }

    let secretKey = values.secretKey;
    let config: BedrockConfig | OpenAIConfig | VertexAIConfig | undefined;

    if (currentAdapter === LLMAdapter.Bedrock) {
      const shouldPreserveExistingBedrockCredentials =
        mode === "update" &&
        isMatchingBedrockAuthMethod(values.authMethod, existingKey?.authMethod);

      switch (values.authMethod) {
        case AuthMethod.ApiKey:
          secretKey =
            shouldPreserveExistingBedrockCredentials && !values.bedrockApiKey
              ? undefined
              : JSON.stringify({
                  apiKey: values.bedrockApiKey!,
                } satisfies BedrockApiKey);
          break;
        case AuthMethod.AccessKeys:
          if (!values.awsAccessKeyId && !values.awsSecretAccessKey) {
            secretKey = shouldPreserveExistingBedrockCredentials
              ? undefined
              : BEDROCK_USE_DEFAULT_CREDENTIALS;
          } else {
            secretKey = JSON.stringify({
              accessKeyId: values.awsAccessKeyId!,
              secretAccessKey: values.awsSecretAccessKey!,
            } satisfies BedrockAccessKeys);
          }
          break;
      }

      config = {
        region: values.awsRegion ?? "",
      };
    } else if (currentAdapter === LLMAdapter.VertexAI) {
      // Handle Vertex AI credentials
      // secretKey already contains either JSON key or VERTEXAI_USE_DEFAULT_CREDENTIALS sentinel
      if (mode === "update") {
        // In update mode, only update secretKey if a new one is provided
        if (values.secretKey) {
          secretKey = values.secretKey;
        } else {
          // Keep existing credentials by not setting secretKey
          secretKey = undefined;
        }
      }
      // In create mode, secretKey is already set from values.secretKey

      // Build config with location only (projectId removed for security - ADC auto-detects)
      const vertexAIConfig: VertexAIConfig = {};
      if (values.vertexAILocation?.trim()) {
        vertexAIConfig.location = values.vertexAILocation.trim();
      }
      // If config is empty, set to undefined
      config =
        Object.keys(vertexAIConfig).length > 0 ? vertexAIConfig : undefined;
    } else if (currentAdapter === LLMAdapter.OpenAI) {
      config =
        values.openAIUseResponsesApi || mode === "update"
          ? { useResponsesApi: values.openAIUseResponsesApi }
          : undefined;
    }

    let extraHeaders: Record<string, string> | undefined;
    if (values.extraHeaders.length > 0) {
      extraHeaders = values.extraHeaders.reduce<Record<string, string>>(
        (headers, header) => {
          headers[header.key] = header.value ?? "";
          return headers;
        },
        {},
      );
    } else if (mode === "update") {
      extraHeaders = {};
    }

    const connectionInput = {
      id: existingKey?.id ?? "",
      secretKey: secretKey ?? "",
      provider: values.provider,
      adapter: values.adapter,
      baseURL:
        values.baseURL ||
        (mode === "update" && currentAdapter === LLMAdapter.TypeSafe
          ? null
          : undefined),
      withDefaultModels: isCustomModelsRequired(currentAdapter)
        ? false
        : values.withDefaultModels,
      config,
      customModels: values.customModels
        .map((m) => m.value.trim())
        .filter(Boolean),
      extraHeaders,
    };

    try {
      let testResult;
      if (owner.scope === "project") {
        const input = { ...connectionInput, projectId: owner.projectId };
        testResult =
          mode === "create"
            ? await mutTestLLMApiKey.mutateAsync(input)
            : await mutTestUpdateLLMApiKey.mutateAsync(input);
      } else {
        const input = { ...connectionInput, orgId: owner.organizationId };
        testResult =
          mode === "create"
            ? await mutTestOrganizationLlmApiKey.mutateAsync(input)
            : await mutTestUpdateOrganizationLlmApiKey.mutateAsync(input);
      }

      if (!testResult.success) throw new Error(testResult.error);
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : t("testConnectionFailed"),
      });

      return;
    }

    let mutation;
    if (owner.scope === "project") {
      const input = { ...connectionInput, projectId: owner.projectId };
      mutation =
        mode === "create"
          ? mutCreateLlmApiKey.mutateAsync(input)
          : mutUpdateLlmApiKey.mutateAsync(input);
    } else {
      const input = { ...connectionInput, orgId: owner.organizationId };
      mutation =
        mode === "create"
          ? mutCreateOrganizationLlmApiKey.mutateAsync(input)
          : mutUpdateOrganizationLlmApiKey.mutateAsync(input);
    }

    return mutation
      .then(() => {
        const eventProps = { adapter: values.adapter };
        if (owner.scope === "project") {
          capture(
            mode === "create"
              ? "project_settings:llm_api_key_create"
              : "project_settings:llm_api_key_update",
            eventProps,
          );
        } else {
          capture(
            mode === "create"
              ? "organization_settings:llm_api_key_create"
              : "organization_settings:llm_api_key_update",
            eventProps,
          );
        }
        form.reset();
        onSuccess();
      })
      .catch((error) => {
        reportTrpcErrorWithoutToast(error, "llm-api-keys");
        form.setError("root", {
          type: "manual",
          message:
            error instanceof Error ? error.message : t("saveConnectionFailed"),
        });
      });
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 overflow-auto"
        onSubmit={(e) => {
          e.stopPropagation(); // Prevent event bubbling to parent forms
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <DialogBody>
          {/* LLM adapter */}
          <FormField
            control={form.control}
            name="adapter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("adapter")}</FormLabel>
                <FormDescription>{t("adapterDescription")}</FormDescription>
                <Select
                  open={adapterSelectOpen}
                  onOpenChange={setAdapterSelectOpen}
                  value={showOtherModelInfo ? OTHER_MODEL_OPTION : field.value}
                  onValueChange={(value) => {
                    if (value === OTHER_MODEL_OPTION) {
                      setShowOtherModelInfo(true);
                      return;
                    }
                    setShowOtherModelInfo(false);
                    // Only reset the base URL when the adapter actually
                    // changes. Bouncing through the "other model" sentinel and
                    // back to the same adapter looks like a value change to
                    // Radix, but must not wipe a custom base URL the user
                    // already entered.
                    if (value !== field.value) {
                      form.setValue(
                        "baseURL",
                        getCustomizedBaseURL(value as LLMAdapter),
                      );
                      form.setValue(
                        "typeSafeUpstream",
                        TYPESAFE_UPSTREAMS[0].id,
                      );
                      customTypeSafeBaseURLDraft.current = "";
                    }
                    field.onChange(value as LLMAdapter);
                  }}
                  disabled={isFieldDisabled("adapter")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectProvider")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {adapterOptions.map((provider) => (
                      <SelectItem value={provider} key={provider}>
                        {ADAPTER_PICKER_LABELS[provider] ?? provider}
                      </SelectItem>
                    ))}
                    {mode === "create" && (
                      <SelectItem value={OTHER_MODEL_OPTION}>
                        {t("otherModel")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showOtherModelInfo && (
            <div className="bg-muted/40 text-muted-foreground space-y-2 rounded-md border p-4 text-sm">
              <p>{t("otherModelHelp")}</p>
              <p>
                <a
                  href="https://langfuse.com/docs/administration/llm-connection#supported-providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {t("learnMoreProviders")}
                </a>
              </p>
            </div>
          )}

          {!showOtherModelInfo && (
            <>
              {/* Provider name */}
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("providerName")}</FormLabel>
                    <FormDescription>
                      {t("providerDescription")}
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("providerPlaceholder", {
                          adapter: currentAdapter,
                        })}
                        disabled={isFieldDisabled("provider")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Decision-model upstream: which gateway serves Jev */}
              {currentAdapter === LLMAdapter.TypeSafe && (
                <FormField
                  control={form.control}
                  name="typeSafeUpstream"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upstream")}</FormLabel>
                      <FormDescription>{t("upstreamHelp")}</FormDescription>
                      <FormControl>
                        <TypeSafeUpstreamCards
                          aria-label={t("upstream")}
                          value={field.value}
                          onValueChange={(id) => {
                            if (field.value === "custom") {
                              customTypeSafeBaseURLDraft.current =
                                form.getValues("baseURL");
                            }
                            field.onChange(id);
                            form.setValue(
                              "baseURL",
                              id === "custom"
                                ? customTypeSafeBaseURLDraft.current
                                : (TYPESAFE_UPSTREAMS.find(
                                    (upstream) => upstream.id === id,
                                  )?.baseURL ?? ""),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentAdapter === LLMAdapter.TypeSafe &&
                currentTypeSafeUpstream.id === "custom" && (
                  <FormField
                    control={form.control}
                    name="baseURL"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("customBaseUrl")}</FormLabel>
                        <FormDescription>
                          {t("customBaseUrlHelp", {
                            code: "https://gateway.example.com/typesafe/v1",
                            systemone: "/systemone",
                          })}
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("customBaseUrlPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              {/* API Key or AWS Credentials or Vertex AI Credentials */}
              {currentAdapter === LLMAdapter.Bedrock ? (
                <>
                  <FormField
                    control={form.control}
                    name="authMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("authenticationMethod")}</FormLabel>
                        <FormDescription>
                          {t("awsAuthMethodHelp")}
                        </FormDescription>
                        <FormControl>
                          <div className="w-full">
                            <Tabs
                              value={field.value}
                              onValueChange={(value) =>
                                field.onChange(value as BedrockAuthMethod)
                              }
                            >
                              <Tabs.List
                                variant="inset"
                                layout="full"
                                gap="sm"
                                size="md"
                              >
                                <Tabs.Trigger
                                  value={AuthMethod.AccessKeys}
                                  label={t("awsAccessKeysTab")}
                                />
                                <Tabs.Trigger
                                  value={AuthMethod.ApiKey}
                                  label={t("apiKeyTab")}
                                />
                              </Tabs.List>
                            </Tabs>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="awsRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("awsRegion")}</FormLabel>
                        <FormDescription>
                          {mode === "update" &&
                            existingKey?.config &&
                            (existingKey.config as BedrockConfig).region && (
                              <span className="text-sm">
                                Current:{" "}
                                <code className="bg-muted rounded px-1 py-0.5">
                                  {(existingKey.config as BedrockConfig).region}
                                </code>
                              </span>
                            )}
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              mode === "update" && existingKey?.config
                                ? ((existingKey.config as BedrockConfig)
                                    .region ?? "")
                                : "e.g., us-east-1"
                            }
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {currentAuthMethod === AuthMethod.ApiKey && (
                    <FormField
                      control={form.control}
                      name="bedrockApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("bedrockApiKey")}</FormLabel>
                          <FormDescription>
                            {mode === "update" ? (
                              <>
                                <a
                                  href="https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800"
                                >
                                  Amazon Bedrock API keys
                                </a>{" "}
                                {t("bedrockApiKeyUpdateHelp")}
                              </>
                            ) : (
                              <>
                                <a
                                  href="https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800"
                                >
                                  Amazon Bedrock API keys
                                </a>
                                .
                              </>
                            )}
                          </FormDescription>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder={
                                mode === "update"
                                  ? isKeepingCurrentBedrockAuthMethod &&
                                    existingKey?.displaySecretKey
                                    ? `${existingKey.displaySecretKey} ${t("preservedUnlessReplaced")}`
                                    : t("enterBedrockApiKey")
                                  : undefined
                              }
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {currentAuthMethod === AuthMethod.AccessKeys && (
                    <>
                      <FormField
                        control={form.control}
                        name="awsAccessKeyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("awsAccessKeyId")}
                              {!isLangfuseCloud && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  {t("optional")}
                                </span>
                              )}
                            </FormLabel>
                            <FormDescription>
                              {mode === "update"
                                ? isKeepingCurrentBedrockAuthMethod
                                  ? t("accessKeyKeepHint")
                                  : t("accessKeyHint")
                                : isLangfuseCloud
                                  ? t("awsCloudLongLived")
                                  : t("awsSelfHostedOptional")}
                            </FormDescription>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  mode === "update"
                                    ? isUsingDefaultAwsCredentialsForCurrentAuthMethod
                                      ? t("usingDefaultAwsCredentials")
                                      : isKeepingCurrentBedrockAuthMethod
                                        ? `•••••••• ${t("preservedIfEmpty")}`
                                        : t("enterAwsAccessKeyId")
                                    : undefined
                                }
                                autoComplete="off"
                                data-1p-ignore
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="awsSecretAccessKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("awsSecretAccessKey")}
                              {!isLangfuseCloud && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  {t("optional")}
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <PasswordInput
                                {...field}
                                placeholder={
                                  mode === "update"
                                    ? isUsingDefaultAwsCredentialsForCurrentAuthMethod
                                      ? t("usingDefaultAwsCredentials")
                                      : isKeepingCurrentBedrockAuthMethod &&
                                          existingKey?.displaySecretKey
                                        ? `${existingKey.displaySecretKey} ${t("preservedIfEmpty")}`
                                        : t("enterAwsSecretAccessKey")
                                    : undefined
                                }
                                autoComplete="off"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {!isLangfuseCloud &&
                    currentAuthMethod === AuthMethod.AccessKeys && (
                      <div className="text-muted-foreground space-y-2 border-l-2 border-blue-200 pl-4 text-sm">
                        <p>
                          <strong>{t("defaultCredentialChainTitle")}</strong>{" "}
                          {t("defaultCredentialChainHelp")}
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>{t("credentialEnvVars")}</li>
                          <li>{t("credentialAwsFile")}</li>
                          <li>{t("credentialEc2")}</li>
                          <li>{t("credentialEcs")}</li>
                        </ul>
                        <p>
                          <a
                            href="https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {t("learnMoreAws")}
                          </a>
                        </p>
                      </div>
                    )}
                </>
              ) : currentAdapter === LLMAdapter.VertexAI ? (
                <>
                  {/* Vertex AI ADC option for self-hosted only, create mode only */}
                  {!isLangfuseCloud && mode === "create" && (
                    <FormItem>
                      <span className="flex">
                        <span className="flex-1">
                          <FormLabel>{t("useAdc")}</FormLabel>
                          <FormDescription>{t("useAdcHelp")}</FormDescription>
                        </span>
                        <FormControl>
                          <Switch
                            checked={
                              form.watch("secretKey") ===
                              VERTEXAI_USE_DEFAULT_CREDENTIALS
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue(
                                  "secretKey",
                                  VERTEXAI_USE_DEFAULT_CREDENTIALS,
                                );
                              } else {
                                form.setValue("secretKey", "");
                              }
                            }}
                          />
                        </FormControl>
                      </span>
                    </FormItem>
                  )}

                  {/* Service Account Key - hidden when ADC is enabled */}
                  {(isLangfuseCloud ||
                    form.watch("secretKey") !==
                      VERTEXAI_USE_DEFAULT_CREDENTIALS) && (
                    <FormField
                      control={form.control}
                      name="secretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("gcpServiceAccountKey")}</FormLabel>
                          <FormDescription>
                            {isLangfuseCloud
                              ? t("secretKeyStoredEncrypted", {
                                  storage: t("extraHeadersCloudStorage"),
                                })
                              : t("secretKeyStoredEncrypted", {
                                  storage: t("extraHeadersDbStorage"),
                                })}
                          </FormDescription>
                          <FormDescription className="text-dark-yellow">
                            {t("gcpKeyPasteHelp")}
                            <pre className="text-xs">
                              {`{
  "type": "service_account",
  "project_id": "<project_id>",
  "private_key_id": "<private_key_id>",
  "private_key": "<private_key>",
  "client_email": "<client_email>",
  "client_id": "<client_id>",
  "auth_uri": "<auth_uri>",
  "token_uri": "<token_uri>",
  "auth_provider_x509_cert_url": "<auth_provider_x509_cert_url>",
  "client_x509_cert_url": "<client_x509_cert_url>",
}`}
                            </pre>
                          </FormDescription>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder={
                                mode === "update"
                                  ? existingKey?.displaySecretKey
                                  : '{"type": "service_account", ...}'
                              }
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* ADC info box for self-hosted */}
                  {!isLangfuseCloud &&
                    form.watch("secretKey") ===
                      VERTEXAI_USE_DEFAULT_CREDENTIALS && (
                      <div className="text-muted-foreground space-y-2 border-l-2 border-blue-200 pl-4 text-sm">
                        <p>
                          <strong>{t("adcTitle")}</strong> {t("adcHelp")}
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>{t("adcEnvVar")}</li>
                          <li>{t("adcCli")}</li>
                          <li>{t("adcWorkload")}</li>
                          <li>{t("adcCloudRun")}</li>
                          <li>{t("adcMetadata")}</li>
                        </ul>
                        <p>
                          <a
                            href="https://cloud.google.com/docs/authentication/application-default-credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {t("learnMoreAdc")}
                          </a>
                        </p>
                      </div>
                    )}
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {currentAdapter === LLMAdapter.TypeSafe
                          ? currentTypeSafeUpstream.apiKeyLabel
                          : t("apiKey")}
                      </FormLabel>
                      <FormDescription>
                        {isLangfuseCloud
                          ? t("secretKeyStoredEncrypted", {
                              storage: t("extraHeadersCloudStorage"),
                            })
                          : t("secretKeyStoredEncrypted", {
                              storage: t("extraHeadersDbStorage"),
                            })}
                      </FormDescription>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder={
                            mode === "update"
                              ? existingKey?.displaySecretKey
                              : undefined
                          }
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Azure Base URL - Always required for Azure */}
              {currentAdapter === LLMAdapter.Azure && (
                <FormField
                  control={form.control}
                  name="baseURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("apiBaseUrl")}</FormLabel>
                      <FormDescription>
                        {t("baseUrlFormatHelp", {
                          url: "https://{instanceName}.openai.azure.com/openai/deployments",
                        })}
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://your-instance.openai.azure.com/openai/deployments"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Custom models: top-level for Azure/Bedrock */}
              {isCustomModelsRequired(currentAdapter) &&
                renderCustomModelsField()}

              {/* Extra headers - show for Azure in main section (Azure has no advanced settings) */}
              {currentAdapter === LLMAdapter.Azure && renderExtraHeadersField()}

              {hasAdvancedSettings(currentAdapter) && (
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="flex items-center pl-0"
                    onClick={() =>
                      setShowAdvancedSettings(!showAdvancedSettings)
                    }
                  >
                    <span>
                      {showAdvancedSettings
                        ? t("hideAdvanced")
                        : t("showAdvanced")}
                    </span>
                    <ChevronDown
                      size="base"
                      __rawClassName={`text-foreground-tertiary ml-1 translate-y-px transition-transform ${showAdvancedSettings ? "rotate-180" : "rotate-0"}`}
                    />
                  </Button>
                </div>
              )}

              {hasAdvancedSettings(currentAdapter) && showAdvancedSettings && (
                <div className="space-y-4 border-t pt-4">
                  {/* baseURL: TypeSafe sets it through the upstream cards */}
                  {currentAdapter !== LLMAdapter.TypeSafe && (
                    <FormField
                      control={form.control}
                      name="baseURL"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("apiBaseUrl")}</FormLabel>
                          <FormDescription>
                            {currentAdapter === LLMAdapter.OpenAI ||
                            currentAdapter === LLMAdapter.Anthropic
                              ? t("baseUrlHelp", {
                                  defaults:
                                    currentAdapter === LLMAdapter.OpenAI
                                      ? t("baseUrlOpenAiDefault")
                                      : t("baseUrlAnthropicDefault"),
                                })
                              : t("baseUrlHelp", { defaults: "" })}
                          </FormDescription>

                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("baseUrlPlaceholder")}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* VertexAI Location */}
                  {currentAdapter === LLMAdapter.VertexAI && (
                    <FormField
                      control={form.control}
                      name="vertexAILocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("locationOptional")}</FormLabel>
                          <FormDescription>
                            {t("locationHelp", { global: "global" })}
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("locationGlobal")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* OpenAI Responses API */}
                  {currentAdapter === LLMAdapter.OpenAI && (
                    <FormField
                      control={form.control}
                      name="openAIUseResponsesApi"
                      render={({ field }) => (
                        <FormItem>
                          <span className="flex">
                            <span className="flex-1">
                              <FormLabel>{t("useResponsesApi")}</FormLabel>
                              <FormDescription>
                                {t("useResponsesApiHelp")}
                              </FormDescription>
                            </span>

                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </span>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Extra Headers */}
                  {[
                    LLMAdapter.OpenAI,
                    LLMAdapter.Anthropic,
                    LLMAdapter.TypeSafe,
                  ].includes(currentAdapter) && renderExtraHeadersField()}

                  {/* With default models */}
                  <FormField
                    control={form.control}
                    name="withDefaultModels"
                    render={({ field }) => (
                      <FormItem>
                        <span className="flex">
                          <span className="flex-1">
                            <FormLabel>{t("enableDefaultModels")}</FormLabel>
                            <FormDescription>
                              {t("enableDefaultModelsHelp")}
                            </FormDescription>
                          </span>

                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </span>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom model names */}
                  {!isCustomModelsRequired(currentAdapter) &&
                    renderCustomModelsField()}
                </div>
              )}
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <div className="flex min-w-0 flex-col gap-4">
            {showOtherModelInfo ? (
              <Button
                type="button"
                className="w-full"
                onClick={() => setAdapterSelectOpen(true)}
              >
                {t("selectAdapter")}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting}
              >
                {mode === "create" ? t("createConnection") : t("saveChanges")}
              </Button>
            )}
            {form.formState.errors.root && (
              <div className="max-h-32 overflow-y-auto">
                <FormMessage className="break-words wrap-anywhere">
                  {form.formState.errors.root.message}
                </FormMessage>
              </div>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
