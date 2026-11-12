import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, Plus, X } from "@langfuse/icons";

import { Alert } from "@/src/components/design-system/Alert/Alert";
import { CustomTooltip } from "@/src/components/design-system/CustomTooltip/CustomTooltip";
import { FormField } from "@/src/components/design-system/FormField/FormField";
import { Input as DesignSystemInput } from "@/src/components/design-system/Input/Input";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { Button } from "@/src/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { InfoTooltip } from "@/src/components/ui/InfoTooltip/InfoTooltip";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { ApiKeyExpirationInput } from "@/src/features/apiKey/components/ApiKeyExpirationInput/ApiKeyExpirationInput";
import type { ApiKeyExpirationPreset } from "@/src/features/apiKey/constants/apiKeyExpirationOptions";
import { resolveApiKeyExpiration } from "@/src/features/apiKey/fns/resolveApiKeyExpiration";
import { GeneratedKeyContent } from "@/src/features/ai-gateway/components/GatewayApiKeysPage/components/GeneratedKeyContent/GeneratedKeyContent";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import {
  api,
  reportNonTrpcError,
  reportTrpcErrorWithoutToast,
} from "@/src/utils/api";

type MetadataField = {
  id: number;
  key: string;
  value: string;
};

type IssuedAs = "user" | "serviceAccount";

export function CreateGatewayApiKeyDialogController({
  organizationId,
  children,
}: {
  organizationId: string;
  children: (control: { openDialog: () => void }) => ReactNode;
}) {
  const t = useTranslation(gatewayMessages);
  const [name, setName] = useState("");
  const [expiryPreset, setExpiryPreset] =
    useState<ApiKeyExpirationPreset>("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [metadata, setMetadata] = useState<MetadataField[]>(() => [
    { id: 1, key: "", value: "" },
  ]);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [nextMetadataId, setNextMetadataId] = useState(2);
  const [issuedAs, setIssuedAs] = useState<IssuedAs>("user");
  const canIssueServiceAccountKeys = useHasOrganizationAccess({
    organizationId,
    scope: "gateway:manage",
  });
  const [generatedSecretKey, setGeneratedSecretKey] = useState<string | null>(
    null,
  );
  const utils = api.useUtils();
  const capture = usePostHogClientCapture();
  const session = useSession();
  const create = api.aiGateway.createApiKey.useMutation({
    onError: (error) =>
      reportTrpcErrorWithoutToast(error, "ai-gateway-api-keys"),
  });

  const reset = () => {
    setName("");
    setExpiryPreset("never");
    setCustomExpiry("");
    setMetadata([{ id: 1, key: "", value: "" }]);
    setIsMetadataOpen(false);
    setGeneratedSecretKey(null);
    setNextMetadataId(2);
    setIssuedAs("user");
  };

  const metadataCount = metadata.filter((field) => field.key.trim()).length;
  const expiresAt = resolveApiKeyExpiration(expiryPreset, customExpiry);
  const effectiveIssuedAs = canIssueServiceAccountKeys ? issuedAs : "user";
  const isNameMissing = !name.trim();

  const submit = async () => {
    if (expiresAt === undefined || isNameMissing) return;
    const metadataObject = Object.fromEntries(
      metadata
        .filter((field) => field.key.trim())
        .map((field) => [field.key.trim(), field.value]),
    );
    try {
      const created = await create.mutateAsync({
        orgId: organizationId,
        name: name.trim(),
        metadata: metadataObject,
        expiresAt,
        issuedAs: effectiveIssuedAs,
      });
      capture("ai_gateway:api_key_created", {
        orgId: organizationId,
        creatorRole:
          session.data?.user?.organizations.find(
            (organization) => organization.id === organizationId,
          )?.role ?? null,
        isServiceAccount: effectiveIssuedAs === "serviceAccount",
        hasMetadata: metadataCount > 0,
        metadataCount,
        hasDescription: name.trim().length > 0,
        expiryPreset,
      });
      setGeneratedSecretKey(created.secretKey);
      await Promise.all([
        utils.aiGateway.listApiKeys.invalidate({ orgId: organizationId }),
        utils.aiGateway.getAnalyticsLabels.invalidate({
          orgId: organizationId,
        }),
      ]);
    } catch (error) {
      reportNonTrpcError(error, "ai-gateway-api-keys");
    }
  };

  return (
    <DialogController
      onBeforeClose={() => !create.isPending}
      renderDialog={() =>
        generatedSecretKey ? (
          <Dialog
            title={t("gatewayKeyCreatedTitle")}
            size="md"
            closeLabel={t("done")}
            requireExplicitClose
          >
            <GeneratedKeyContent
              organizationId={organizationId}
              secretKey={generatedSecretKey}
            />
          </Dialog>
        ) : (
          <Dialog
            title={t("createGatewayKeyTitle")}
            size="md"
            actions={[
              {
                label: t("createKeyButton"),
                loading: create.isPending,
                disabled:
                  create.isPending || expiresAt === undefined || isNameMissing,
                onClick: submit,
              },
            ]}
          >
            <Dialog.Body>
              {canIssueServiceAccountKeys ? (
                <div className="flex flex-col gap-1.5">
                  <Label>{t("issuedAsLabel")}</Label>
                  <div>
                    <Tabs
                      activationMode="manual"
                      value={issuedAs}
                      onValueChange={(value) => setIssuedAs(value as IssuedAs)}
                    >
                      <Tabs.List
                        variant="inset"
                        size="md"
                        aria-label={t("issuedAsLabel")}
                      >
                        <Tabs.Trigger value="user" label={t("issuedAsUser")} />
                        <Tabs.Trigger
                          value="serviceAccount"
                          label={t("issuedAsServiceAccount")}
                        />
                      </Tabs.List>
                    </Tabs>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {issuedAs === "user"
                      ? t("issuedAsUserDescription")
                      : t("issuedAsServiceAccountDescription")}
                  </p>
                </div>
              ) : null}
              <CustomTooltip content={<span>{t("nameFieldTooltip")}</span>}>
                {({ getTriggerProps }) => (
                  <FormField
                    label={t("nameFieldLabel")}
                    required
                    registerLabelTooltip={getTriggerProps}
                  >
                    {(field) => (
                      <DesignSystemInput
                        id={field.id}
                        aria-describedby={field.inputDescribedById}
                        maxLength={500}
                        required
                        placeholder={t("nameFieldPlaceholder")}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    )}
                  </FormField>
                )}
              </CustomTooltip>
              <ApiKeyExpirationInput
                id="gateway-key-expiry"
                expiryPreset={expiryPreset}
                customExpiry={customExpiry}
                onExpiryPresetChange={setExpiryPreset}
                onCustomExpiryChange={setCustomExpiry}
              />
              <Collapsible
                open={isMetadataOpen}
                onOpenChange={setIsMetadataOpen}
              >
                <div className="flex items-center gap-1.5">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="group flex items-center gap-2 text-left text-sm"
                    >
                      <ChevronRight
                        size="base"
                        color="tertiary"
                        __rawClassName="translate-y-px transition-transform group-data-[state=open]:rotate-90"
                      />
                      <span>{t("metadataLabel")}</span>
                      <span className="text-muted-foreground font-normal">
                        {t("metadataOptional")}
                        {metadataCount > 0
                          ? t("metadataSetCount", {
                              count: String(metadataCount),
                            })
                          : ""}
                      </span>
                    </button>
                  </CollapsibleTrigger>
                  <InfoTooltip label={t("metadataTooltipLabel")}>
                    {t("metadataTooltip")}
                  </InfoTooltip>
                </div>
                <CollapsibleContent className="mt-2 pl-5.5">
                  <div className="flex flex-col gap-2">
                    {metadata.map((field) => (
                      <div
                        key={field.id}
                        className="ph-no-capture flex items-center gap-2"
                      >
                        <Input
                          aria-label={t("metadataKeyAria")}
                          placeholder={t("metadataKeyPlaceholder")}
                          value={field.key}
                          onChange={(event) =>
                            setMetadata((current) =>
                              current.map((item) =>
                                item.id === field.id
                                  ? { ...item, key: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Input
                          aria-label={t("metadataValueAria")}
                          placeholder={t("metadataValuePlaceholder")}
                          value={field.value}
                          onChange={(event) =>
                            setMetadata((current) =>
                              current.map((item) =>
                                item.id === field.id
                                  ? { ...item, value: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label={t("removeMetadataField")}
                          onClick={() =>
                            setMetadata((current) =>
                              current.filter((item) => item.id !== field.id),
                            )
                          }
                        >
                          <X size="sm" color="default" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="text-primary mt-2 flex items-center gap-1 text-sm hover:underline"
                    onClick={() => {
                      setMetadata((current) => [
                        ...current,
                        { id: nextMetadataId, key: "", value: "" },
                      ]);
                      setNextMetadataId((current) => current + 1);
                    }}
                  >
                    <Plus size="base" />
                    {t("addMetadata")}
                  </button>
                </CollapsibleContent>
              </Collapsible>
              {create.isError ? (
                <Alert variant="destructive">
                  <Alert.Title>{t("gatewayKeyCreateError")}</Alert.Title>
                  <Alert.Description>
                    {create.error?.message ??
                      t("gatewayKeyCreateErrorDescription")}
                  </Alert.Description>
                </Alert>
              ) : null}
            </Dialog.Body>
          </Dialog>
        )
      }
    >
      {({ openDialog }) =>
        children({
          openDialog: () => {
            reset();
            openDialog();
          },
        })
      }
    </DialogController>
  );
}
