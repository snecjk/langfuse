import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function V4MigrationLoadingState() {
  const t = useTranslation(enterpriseMessages);
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6 py-12">
      <p className="text-primary text-center text-base" role="status">
        {t("migrationChecking")}
      </p>
    </div>
  );
}
