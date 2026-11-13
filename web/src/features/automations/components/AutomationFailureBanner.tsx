import { AlertTriangle, X } from "@langfuse/icons";
import { Button } from "@/src/components/ui/button";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { notificationMessages } from "@/src/features/i18n/messages/notifications";

interface AutomationFailureBannerProps {
  failureCount: number;
  onDismiss: () => void;
}

export const AutomationFailureBanner = ({
  failureCount,
  onDismiss,
}: AutomationFailureBannerProps) => {
  const t = useTranslation(notificationMessages);
  return (
    <div className="mb-4">
      <Alert variant="destructive" icon={AlertTriangle}>
        <Alert.Description>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <strong>
                {t("automationFailureTitle", { count: failureCount })}
              </strong>
              <div className="mt-2 text-sm">
                {t("automationFailureDescription")}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="ml-4 h-6 w-6 p-0"
            >
              <X size="base" color="default" />
            </Button>
          </div>
        </Alert.Description>
      </Alert>
    </div>
  );
};
