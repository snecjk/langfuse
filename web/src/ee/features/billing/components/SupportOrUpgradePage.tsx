import { AlertCircle } from "@langfuse/icons";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const SupportOrUpgradePage = () => {
  const t = useTranslation(enterpriseMessages);
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Alert icon={AlertCircle}>
          <Alert.Title>{t("supportUpgradeRestricted")}</Alert.Title>
          <Alert.Description>
            <p className="mb-2">{t("supportUpgradeRequired")}</p>
            <p>{t("supportUpgradeHelp")}</p>
          </Alert.Description>
        </Alert>
      </div>
    </div>
  );
};
