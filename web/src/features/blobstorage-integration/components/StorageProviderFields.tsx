/* eslint-disable no-nested-ternary */
import { type UseFormSetValue, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import {
  BlobStorageIntegrationType,
  GCS_USE_DEFAULT_CREDENTIALS,
  STORAGE_ROLE_WRITE_ACTIONS,
  StorageIntegrationAuthType,
} from "@langfuse/shared";
import { RoleAuthSetupSection } from "@/src/ee/features/storage-role-auth/components/RoleAuthSetupSection";
import { RoleAuthSetupInstructions } from "@/src/ee/features/storage-role-auth/components/RoleAuthSetupInstructions";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import {
  type BlobStorageFormControl,
  type BlobStorageFormValues,
} from "@/src/features/blobstorage-integration/components/formValues";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";
import { type RevealableExternalId } from "@/src/ee/features/storage-role-auth/components/types";

// Provider selection plus the connection fields whose labels and visibility
// depend on it: bucket/container, endpoint, region, path style, credentials,
// and prefix.
export const StorageProviderFields = ({
  control,
  setValue,
  crossAccountRoleArn,
  roleAuthRequiresUpgrade,
  externalId,
}: {
  control: BlobStorageFormControl;
  setValue: UseFormSetValue<BlobStorageFormValues>;
  crossAccountRoleArn: string | null;
  roleAuthRequiresUpgrade: boolean;
  externalId: RevealableExternalId;
}) => {
  const { isLangfuseCloud } = useLangfuseCloudRegion();
  // Check if this is a self-hosted instance (no cloud region set)
  const isSelfHosted = !isLangfuseCloud;
  const integrationType =
    useWatch({ control, name: "type" }) ?? BlobStorageIntegrationType.S3;
  const isGcs = integrationType === "GOOGLE_CLOUD_STORAGE";
  const secretAccessKey = useWatch({ control, name: "secretAccessKey" });
  const isGcsDefaultCredentials =
    isGcs && secretAccessKey === GCS_USE_DEFAULT_CREDENTIALS;
  const authType = useWatch({ control, name: "authType" });
  const usesRole = authType === StorageIntegrationAuthType.ROLE_ARN;
  // An integration that already uses a role keeps the option visible even if
  // the deployment no longer offers it, so it can be switched to access keys.
  // Plans without IAM role auth see the option disabled.
  const showAuthTypeSelect =
    integrationType === BlobStorageIntegrationType.S3 &&
    (Boolean(crossAccountRoleArn) || roleAuthRequiresUpgrade || usesRole);
  const isRoleOptionLocked = roleAuthRequiresUpgrade && !usesRole;
  const [roleArn, bucketName, prefix] = useWatch({
    control,
    name: ["roleArn", "bucketName", "prefix"],
  });
  const t = useTranslation(integrationMessages);

  return (
    <>
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("storageProvider")}</FormLabel>
            <FormControl>
              <SelectInput
                value={field.value}
                onValueChange={(value) => {
                  // A GCS key (or the ADC sentinel) is not an S3/Azure secret,
                  // and vice versa.
                  if ((value === "GOOGLE_CLOUD_STORAGE") !== isGcs) {
                    setValue("secretAccessKey", "", { shouldDirty: true });
                  }
                  if (value !== BlobStorageIntegrationType.S3) {
                    setValue(
                      "authType",
                      StorageIntegrationAuthType.ACCESS_KEYS,
                      {
                        shouldDirty: true,
                      },
                    );
                  }
                  field.onChange(value);
                }}
                placeholder={t("selectProviderPlaceholder")}
                options={[
                  { value: BlobStorageIntegrationType.S3, label: "Amazon S3" },
                  {
                    value: BlobStorageIntegrationType.S3_COMPATIBLE,
                    label: "S3 Compatible Storage",
                  },
                  {
                    value: BlobStorageIntegrationType.AZURE_BLOB_STORAGE,
                    label: "Azure Blob Storage",
                  },
                  {
                    value: BlobStorageIntegrationType.GOOGLE_CLOUD_STORAGE,
                    label: "Google Cloud Storage",
                  },
                ]}
              />
            </FormControl>
            <FormDescription>{t("storageProviderHelp")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="bucketName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {integrationType === "AZURE_BLOB_STORAGE"
                ? t("containerName")
                : t("bucketName")}
            </FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              {integrationType === "AZURE_BLOB_STORAGE"
                ? t("azureBucketHelp")
                : isGcsDefaultCredentials
                  ? t("gcsBucketHelp")
                  : isGcs
                    ? t("gcsBucketSimpleHelp")
                    : t("s3BucketHelp")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Endpoint URL field - Only shown for S3-compatible and Azure */}
      {integrationType !== "S3" && !isGcs && (
        <FormField
          control={control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("endpointUrl")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("azureEndpointHelp")
                  : t("s3EndpointHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Region field - Only shown for Amazon S3 or compatible storage */}
      {integrationType !== "AZURE_BLOB_STORAGE" && !isGcs && (
        <FormField
          control={control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("region")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {integrationType === "S3"
                  ? t("awsRegionHelp")
                  : t("s3RegionHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Force Path Style switch - Only shown for S3-compatible */}
      {integrationType === "S3_COMPATIBLE" && (
        <FormField
          control={control}
          name="forcePathStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forcePathStyle")}</FormLabel>
              <FormControl>
                <div className="mt-1 ml-4">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>{t("forcePathStyleHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* GCS credentials: service account JSON key, or (self-hosted) default
          credentials, mirroring the Vertex AI LLM connection form. */}
      {isGcs && isSelfHosted && (
        <FormField
          control={control}
          name="secretAccessKey"
          render={({ field }) => (
            <FormItem>
              <span className="flex">
                <span className="flex-1">
                  <FormLabel>{t("useAdcLabel")}</FormLabel>
                  <FormDescription>{t("useAdcDescription")}</FormDescription>
                </span>
                <FormControl>
                  <Switch
                    checked={field.value === GCS_USE_DEFAULT_CREDENTIALS}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? GCS_USE_DEFAULT_CREDENTIALS : "")
                    }
                  />
                </FormControl>
              </span>
            </FormItem>
          )}
        />
      )}
      {isGcs && !isGcsDefaultCredentials && (
        <FormField
          control={control}
          name="secretAccessKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("gcpServiceAccountKeyLabel")}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='{"type": "service_account", ...}'
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>{t("gcpServiceAccountKeyHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showAuthTypeSelect && (
        <FormField
          control={control}
          name="authType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("authentication")}</FormLabel>
              <FormControl>
                <SelectInput
                  value={field.value ?? StorageIntegrationAuthType.ACCESS_KEYS}
                  onValueChange={field.onChange}
                  placeholder={t("selectAuthentication")}
                  options={[
                    {
                      value: StorageIntegrationAuthType.ACCESS_KEYS,
                      label: t("accessKeys"),
                    },
                    isRoleOptionLocked
                      ? {
                          value: StorageIntegrationAuthType.ROLE_ARN,
                          label: t("iamRole"),
                          disabled: true,
                          disabledReason: t("iamRoleUpgradeRequired"),
                          badges: [{ text: "Enterprise", color: "outline" }],
                        }
                      : {
                          value: StorageIntegrationAuthType.ROLE_ARN,
                          label: t("iamRole"),
                        },
                  ]}
                />
              </FormControl>
              <FormDescription>
                {isRoleOptionLocked
                  ? t("iamRoleUpgradeRequired")
                  : t("iamRoleHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {usesRole && (
        <FormField
          control={control}
          name="roleArn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("roleArn")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="arn:aws:iam::123456789012:role/langfuse-export"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>{t("roleArnHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      {usesRole && crossAccountRoleArn ? (
        <div className="-mt-1">
          <RoleAuthSetupSection>
            <RoleAuthSetupInstructions
              crossAccountRoleArn={crossAccountRoleArn}
              externalId={externalId}
              roleArn={roleArn ?? ""}
              bucketName={bucketName.trim()}
              prefix={prefix?.trim()}
              actions={STORAGE_ROLE_WRITE_ACTIONS}
              description={t("roleAuthSetupDescription")}
            />
          </RoleAuthSetupSection>
        </div>
      ) : null}

      {/* S3/Azure credentials */}
      {!isGcs && !usesRole && (
        <FormField
          control={control}
          name="accessKeyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("storageAccountName")
                  : integrationType === "S3"
                    ? t("awsAccessKeyId")
                    : t("accessKeyId")}
                {/* Show optional indicator for S3 types on self-hosted instances with entitlement */}
                {isSelfHosted && integrationType === "S3" && (
                  <span className="text-muted-foreground">
                    {" "}
                    {t("optional")}
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("azureAccessKeyIdHelp")
                  : integrationType === "S3"
                    ? isSelfHosted
                      ? t("awsAccessKeyIdSelfHostedHelp")
                      : t("awsAccessKeyIdHelp")
                    : t("s3AccessKeyIdHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!isGcs && !usesRole && (
        <FormField
          control={control}
          name="secretAccessKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("storageAccountKey")
                  : integrationType === "S3"
                    ? t("awsSecretAccessKey")
                    : t("secretAccessKey")}
                {/* Show optional indicator for S3 types on self-hosted instances with entitlement */}
                {isSelfHosted && integrationType === "S3" && (
                  <span className="text-muted-foreground">
                    {" "}
                    {t("optional")}
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********************"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {integrationType === "AZURE_BLOB_STORAGE"
                  ? t("azureSecretAccessKeyHelp")
                  : integrationType === "S3"
                    ? isSelfHosted
                      ? t("awsSecretAccessKeySelfHostedHelp")
                      : t("awsSecretAccessKeyHelp")
                    : t("s3SecretAccessKeyHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="prefix"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("exportPrefix")}</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              {integrationType === "AZURE_BLOB_STORAGE"
                ? t("exportPrefixAzureHelp")
                : integrationType === "S3"
                  ? t("exportPrefixS3Help")
                  : t("exportPrefixHelp")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
