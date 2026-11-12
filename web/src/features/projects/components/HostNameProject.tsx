import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import { Card } from "@/src/components/ui/card";
import { CodeSection } from "@/src/components/design-system/CodeSection/CodeSection";
import Header from "@/src/components/layouts/header";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";
import { env } from "@/src/env.mjs";

export function HostNameProject() {
  const t = useTranslation(settingsMessages);
  const uiCustomization = useUiCustomization();
  const hostName = `${uiCustomization?.hostname ?? window.origin}${env.NEXT_PUBLIC_BASE_PATH ?? ""}`;
  return (
    <div>
      <Header title={t("hostName")} />
      <Card className="mb-4 p-3">
        <div className="">
          <div className="mb-2 text-sm">{t("hostHelp")}</div>
          <CodeSection variant="outline" content={hostName} />
        </div>
      </Card>
    </div>
  );
}
