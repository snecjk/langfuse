import { Unlink } from "@langfuse/icons";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export interface SlackDisconnectDialogProps {
  isPending: boolean;
  onConfirm: () => void;
}

export function SlackDisconnectDialog({
  isPending,
  onConfirm,
}: SlackDisconnectDialogProps) {
  const t = useTranslation(integrationMessages);
  return (
    <Dialog
      size="sm"
      title={t("slackDisconnectTitle")}
      actions={[
        {
          label: t("disconnect"),
          icon: Unlink,
          variant: "destructive",
          loading: isPending,
          onClick: onConfirm,
        },
      ]}
    >
      <Dialog.Body>
        <p>{t("slackDisconnectBody")}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("slackDisconnectBullet1")}</li>
          <li>{t("slackDisconnectBullet2")}</li>
          <li>{t("slackDisconnectBullet3")}</li>
          <li>{t("slackDisconnectBullet4")}</li>
        </ul>
        <p className="text-muted-foreground">{t("slackDisconnectNote")}</p>
      </Dialog.Body>
    </Dialog>
  );
}
