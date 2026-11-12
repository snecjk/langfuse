import { Button } from "@/src/components/ui/button";
import { api } from "@/src/utils/api";
import { useState } from "react";
import type * as React from "react";
import { PopoverController } from "@/src/components/ui/popover";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

type RetryBackgroundMigrationPopoverControllerProps = {
  backgroundMigrationName: string;
  isRetryable: boolean;
  children: React.ComponentProps<typeof PopoverController>["children"];
};

export function RetryBackgroundMigrationPopoverController({
  backgroundMigrationName,
  isRetryable,
  children,
}: RetryBackgroundMigrationPopoverControllerProps) {
  const utils = api.useUtils();
  const [adminApiKey, setAdminApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslation(enterpriseMessages);

  const mutRetryBackgroundMigration =
    api.backgroundMigrations.retry.useMutation({
      onSuccess: () => {
        utils.backgroundMigrations.invalidate();
        showSuccessToast({
          operation: "background_migration.retry",
          title: t("retryMigrationScheduled"),
          description: "",
        });
      },
      onError: (error) => {
        showToast({
          type: "ERROR",
          title: error?.message || t("retryMigrationFailed"),
          analytics: classifyTrpcToastError(
            error,
            "background_migration.retry",
          ),
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });

  const handleRetry = async (closePopover: () => void) => {
    if (!adminApiKey.trim()) {
      showToast({
        type: "ERROR",
        title: t("adminApiKeyMissing"),
        analytics: {
          operation: "background_migration.retry",
          errorOrigin: "frontend",
          errorCategory: "user_input",
        },
      });
      return;
    }
    setIsLoading(true);
    try {
      await mutRetryBackgroundMigration.mutateAsync({
        name: backgroundMigrationName,
        adminApiKey: "Bearer " + adminApiKey.trim(),
      });
      closePopover();
      setAdminApiKey("");
    } catch (_e) {
      // Error handled in onError
    }
  };

  return (
    <PopoverController
      align="center"
      contentClassName="w-96"
      disabled={!isRetryable}
      modal={false}
      renderContent={({ closePopover }) => (
        <>
          <h2 className="mb-3 font-bold">{t("retryMigrationTitle")}</h2>
          <p className="mb-4 text-sm">{t("retryMigrationHelp")}</p>

          <div className="mb-4">
            <Label htmlFor="admin-api-key" className="text-sm font-bold">
              {t("adminApiKeyLabel")}
            </Label>
            <Input
              id="admin-api-key"
              type="password"
              placeholder={t("adminApiKeyPlaceholder")}
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              className="mt-1"
              disabled={isLoading}
              autoComplete="off"
              inputMode="text"
              name="admin-api-key"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {t("adminApiKeyRequired")}
              {" ("}
              <a
                href="https://langfuse.com/self-hosting/administration/organization-management-api#authentication"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary underline"
              >
                {t("adminApiKeyDocs")}
              </a>
              ).
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                closePopover();
                setAdminApiKey("");
              }}
              disabled={isLoading}
            >
              {t("retryMigrationCancel")}
            </Button>
            <Button
              type="button"
              variant="default"
              loading={isLoading}
              onClick={() => handleRetry(closePopover)}
              disabled={isLoading}
            >
              {t("retryMigrationAction")}
            </Button>
          </div>
        </>
      )}
    >
      {children}
    </PopoverController>
  );
}
