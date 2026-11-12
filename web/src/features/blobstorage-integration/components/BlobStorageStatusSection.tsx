import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Card } from "@/src/components/ui/card";
import { BlobStorageExportMode } from "@langfuse/shared";
import { type RouterOutputs } from "@/src/utils/api";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

type BlobStorageIntegrationConfig = NonNullable<
  RouterOutputs["blobStorageIntegration"]["get"]["config"]
>;

const EXPORT_MODE_LABEL_KEYS: Record<
  BlobStorageExportMode,
  "exportModeFullHistory" | "exportModeFromToday" | "exportModeFromCustomDate"
> = {
  [BlobStorageExportMode.FULL_HISTORY]: "exportModeFullHistory",
  [BlobStorageExportMode.FROM_TODAY]: "exportModeFromToday",
  [BlobStorageExportMode.FROM_CUSTOM_DATE]: "exportModeFromCustomDate",
};

export const BlobStorageStatusSection = ({
  config,
}: {
  config: BlobStorageIntegrationConfig;
}) => {
  const t = useTranslation(integrationMessages);
  return (
    <>
      <Header title={t("statusTitle")} />
      {config.lastError && (
        <div className="mb-4">
          <Alert variant="destructive">
            <Alert.Title>{t("lastExportFailed")}</Alert.Title>
            <Alert.Description>
              {config.lastError}
              {config.lastErrorAt && (
                <>
                  <br />
                  <span className="text-xs opacity-70">
                    {new Date(config.lastErrorAt).toLocaleString()}
                  </span>
                </>
              )}
            </Alert.Description>
          </Alert>
        </div>
      )}
      <Card className="p-3">
        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">{t("dataExportedUpTo")}</span>
          <span>
            {config.lastSyncAt
              ? new Date(config.lastSyncAt).toLocaleString()
              : t("never")}
          </span>
          {config.nextSyncAt && (
            <>
              <span className="text-muted-foreground">{t("nextExport")}</span>
              <span>{new Date(config.nextSyncAt).toLocaleString()}</span>
            </>
          )}
          <span className="text-muted-foreground">{t("exportMode")}</span>
          <span>
            {t(
              EXPORT_MODE_LABEL_KEYS[config.exportMode] ??
                "exportModeFullHistory",
            )}
          </span>
          {(config.exportMode === BlobStorageExportMode.FROM_CUSTOM_DATE ||
            config.exportMode === BlobStorageExportMode.FROM_TODAY) &&
            config.exportStartDate && (
              <>
                <span className="text-muted-foreground">
                  {t("exportStartDate")}
                </span>
                <span>
                  {new Date(config.exportStartDate).toLocaleDateString()}
                </span>
              </>
            )}
        </div>
      </Card>
    </>
  );
};
