import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { type RouterOutputs } from "@/src/utils/api";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

type PostHogIntegrationConfig = NonNullable<
  RouterOutputs["posthogIntegration"]["get"]["config"]
>;

/**
 * PostHogStatusSection surfaces the persisted export fault next to the sync
 * line. Neither is gated on `enabled`: a customer-config fault auto-disables
 * the integration, so gating would hide the explanation at the one moment it
 * is needed, and a manually disabled integration would render a bare header.
 */
export const PostHogStatusSection = ({
  config,
}: {
  config: PostHogIntegrationConfig;
}) => {
  const t = useTranslation(integrationMessages);
  return (
    <>
      <Header title={t("statusTitle")} className="mt-8" />
      {config.lastError && (
        <div className="mb-4">
          <Alert variant="destructive">
            {/* A fault normally arrives with the auto-disable, but the disable is
                            skipped when the host changed mid-run, leaving a fault on a still
                            enabled integration — so only promise "disabled" when it is. */}
            <Alert.Title>
              {config.enabled
                ? t("lastExportFailed")
                : t("lastExportFailedPostHog")}
            </Alert.Title>
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
      <p className="text-primary text-sm">
        {t("dataSyncedUntil")}{" "}
        {config.lastSyncAt
          ? new Date(config.lastSyncAt).toLocaleString()
          : t("never")}
      </p>
    </>
  );
};
