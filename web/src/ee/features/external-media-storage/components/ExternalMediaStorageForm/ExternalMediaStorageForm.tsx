import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { STORAGE_ROLE_READ_ACTIONS } from "@langfuse/shared";

import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { Card } from "@/src/components/ui/card";
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
import { RoleAuthSetupSection } from "@/src/ee/features/storage-role-auth/components/RoleAuthSetupSection";
import { RoleAuthSetupInstructions } from "@/src/ee/features/storage-role-auth/components/RoleAuthSetupInstructions";
import { type RevealableExternalId } from "@/src/ee/features/storage-role-auth/components/types";
import {
  externalMediaStorageFormSchema,
  type ExternalMediaStorageFormValues,
} from "@/src/ee/features/external-media-storage/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function ExternalMediaStorageForm({
  formId,
  initialValues,
  secretAccessKeyDisplay,
  crossAccountRoleArn,
  roleAuthRequiresUpgrade = false,
  externalId,
  onSubmit,
  renderActions,
}: {
  formId: string;
  initialValues: ExternalMediaStorageFormValues;
  secretAccessKeyDisplay: string | null | undefined;
  /** Null when this deployment or the organization does not offer IAM role auth. */
  crossAccountRoleArn: string | null;
  /** The deployment offers IAM role auth, but the organization is not entitled to it. */
  roleAuthRequiresUpgrade?: boolean;
  externalId: RevealableExternalId;
  onSubmit: (values: ExternalMediaStorageFormValues) => void;
  renderActions?: (state: { isDirty: boolean }) => ReactNode;
}) {
  const form = useForm({
    resolver: zodResolver(externalMediaStorageFormSchema),
    defaultValues: initialValues,
  });
  const t = useTranslation(enterpriseMessages);
  const type = useWatch({ control: form.control, name: "type" }) ?? "S3";
  const authType =
    useWatch({ control: form.control, name: "authType" }) ?? "ACCESS_KEYS";
  const [roleArn, bucketName, prefix] = useWatch({
    control: form.control,
    name: ["roleArn", "bucketName", "prefix"],
  });
  const usesRole = authType === "ROLE_ARN";
  // An integration that already uses a role keeps the option visible so it can
  // be switched to access keys. Organizations without IAM role auth see the
  // option disabled.
  const canChooseAuthType =
    type === "S3" &&
    (crossAccountRoleArn !== null || roleAuthRequiresUpgrade || usesRole);
  const isRoleOptionLocked = roleAuthRequiresUpgrade && !usesRole;

  return (
    <Form {...form}>
      <>
        <Card className="p-3">
          <form
            id={formId}
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("mediaStorageProvider")}</FormLabel>
                  <FormControl>
                    <SelectInput
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "S3") {
                          form.setValue("endpoint", null);
                          form.setValue("forcePathStyle", false);
                        } else {
                          form.setValue("authType", "ACCESS_KEYS");
                        }
                      }}
                      placeholder={t("mediaStorageProviderPlaceholder")}
                      options={[
                        {
                          value: "S3",
                          label: t("mediaStorageAmazonS3"),
                        },
                        {
                          value: "S3_COMPATIBLE",
                          label: t("mediaStorageS3Compatible"),
                        },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canChooseAuthType ? (
              <FormField
                control={form.control}
                name="authType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mediaStorageAuth")}</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("mediaStorageAuthPlaceholder")}
                        options={[
                          {
                            value: "ACCESS_KEYS",
                            label: t("mediaStorageAccessKeys"),
                          },
                          isRoleOptionLocked
                            ? {
                                value: "ROLE_ARN",
                                label: t("mediaStorageIamRole"),
                                disabled: true,
                                disabledReason: t("upgradeForRoleAuth"),
                                badges: [
                                  {
                                    text: t("mediaStorageEnterpriseBadge"),
                                    color: "outline",
                                  },
                                ],
                              }
                            : {
                                value: "ROLE_ARN",
                                label: t("mediaStorageIamRole"),
                              },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      {isRoleOptionLocked
                        ? t("upgradeForRoleAuth")
                        : t("mediaStorageIamRoleHelp")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("mediaStorageBucketName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("mediaStorageBucketNameHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "S3_COMPATIBLE" ? (
              <>
                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mediaStorageEndpoint")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        {t("mediaStorageEndpointHelp")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forcePathStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mediaStorageForcePathStyle")}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("mediaStorageForcePathStyleHelp")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("mediaStorageRegion")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("mediaStorageRegionHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {usesRole ? (
              <FormField
                control={form.control}
                name="roleArn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("mediaStorageRoleArn")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="arn:aws:iam::123456789012:role/langfuse-media"
                      />
                    </FormControl>
                    <FormDescription>
                      {t("mediaStorageRoleArnHelp")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {usesRole && crossAccountRoleArn ? (
              <div className="-mt-2">
                <RoleAuthSetupSection>
                  <RoleAuthSetupInstructions
                    crossAccountRoleArn={crossAccountRoleArn}
                    externalId={externalId}
                    roleArn={roleArn ?? ""}
                    bucketName={bucketName.trim()}
                    prefix={prefix?.trim()}
                    actions={STORAGE_ROLE_READ_ACTIONS}
                    description={t("mediaStorageRoleDescription")}
                  />
                </RoleAuthSetupSection>
              </div>
            ) : null}
            {usesRole ? null : (
              <>
                <FormField
                  control={form.control}
                  name="accessKeyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mediaStorageAccessKeyId")}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>
                        {t("mediaStorageAccessKeyIdHelp")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secretAccessKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("mediaStorageSecretAccessKey")}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          value={field.value ?? ""}
                          placeholder={
                            secretAccessKeyDisplay ?? "********************"
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("mediaStorageSecretAccessKeyHelp")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("mediaStoragePrefix")}{" "}
                    <span className="text-muted-foreground">
                      {t("mediaStorageOptional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    {t("mediaStoragePrefixHelp")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Card>
        {renderActions ? (
          <div className="mt-3 flex justify-end gap-2">
            {renderActions({ isDirty: form.formState.isDirty })}
          </div>
        ) : null}
      </>
    </Form>
  );
}
