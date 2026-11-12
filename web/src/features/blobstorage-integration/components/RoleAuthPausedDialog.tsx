import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export function RoleAuthPausedDialog() {
  const t = useTranslation(integrationMessages);
  return (
    <Dialog title={t("exportsPausedTitle")} size="md" closeLabel={t("done")}>
      <Dialog.Body>
        <p>{t("exportsPausedBody")}</p>
      </Dialog.Body>
    </Dialog>
  );
}
