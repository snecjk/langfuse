import { Button } from "@/src/components/design-system/Button/Button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ConnectedGatewayNotSetUpNotice } from "@/src/features/ai-gateway/components/GatewayNotSetUpNotice/ConnectedGatewayNotSetUpNotice";
import { GATEWAY_API_KEYS_DOCS_URL } from "@/src/features/ai-gateway/constants/gatewayDocsUrls";
import { useGatewaySettingsAccess } from "@/src/features/ai-gateway/hooks/useGatewaySettingsAccess";
import { CreateGatewayApiKeyDialogController } from "@/src/features/ai-gateway/components/GatewayApiKeysPage/components/CreateGatewayApiKeyDialogController/CreateGatewayApiKeyDialogController";
import { ConnectedGatewayCreateFirstKeyPlaceholder } from "@/src/features/ai-gateway/components/GatewayCreateFirstKeyPlaceholder/ConnectedGatewayCreateFirstKeyPlaceholder";
import { ConnectedGatewayApiKeysTable } from "@/src/features/ai-gateway/components/GatewayApiKeysPage/components/GatewayApiKeysTable/ConnectedGatewayApiKeysTable";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export function GatewayApiKeysPage({
  organizationId,
}: {
  organizationId: string;
}) {
  const t = useTranslation(gatewayMessages);
  const { canManageGateway, isIngestionConfigured, isSetupStatusPending } =
    useGatewaySettingsAccess(organizationId);

  if (isSetupStatusPending) {
    return <ApiKeysSkeleton />;
  }
  /** Managers are redirected to Setup by the settings route. */
  if (!canManageGateway && isIngestionConfigured === false) {
    return <ConnectedGatewayNotSetUpNotice />;
  }
  const description = (
    <p className="text-muted-foreground text-sm">
      {canManageGateway
        ? t("gatewayKeysDescriptionManager")
        : t("gatewayKeysDescriptionMember")}{" "}
      <Button
        variant="text"
        text={t("howGatewayKeysWork")}
        href={GATEWAY_API_KEYS_DOCS_URL}
      />
    </p>
  );
  if (canManageGateway) {
    return (
      <ConnectedGatewayApiKeysTable
        key={organizationId}
        organizationId={organizationId}
        description={description}
      />
    );
  }
  // Above the table, so the new key's dialog stays open when the placeholder gives way.
  return (
    <CreateGatewayApiKeyDialogController organizationId={organizationId}>
      {({ openDialog }) => (
        <ConnectedGatewayApiKeysTable
          key={organizationId}
          organizationId={organizationId}
          description={description}
          emptyState={
            <ConnectedGatewayCreateFirstKeyPlaceholder
              organizationId={organizationId}
              onCreateKey={openDialog}
            />
          }
        />
      )}
    </CreateGatewayApiKeyDialogController>
  );
}

function ApiKeysSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
