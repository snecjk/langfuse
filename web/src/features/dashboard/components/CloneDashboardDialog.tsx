import { ExternalLinkIcon } from "@langfuse/icons";
import { Button } from "@/src/components/design-system/Button/Button";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboards";

export function CloneDashboardDialog({
  dashboardName,
  setAsHome,
  hasPendingChange,
  existingCloneName,
  isPending,
  onConfirm,
  onOpenExisting,
}: {
  dashboardName: string;
  setAsHome: boolean;
  hasPendingChange: boolean;
  existingCloneName?: string;
  isPending: boolean;
  onConfirm: () => void;
  onOpenExisting: () => void;
}) {
  const t = useTranslation(dashboardMessages);
  return (
    <Dialog
      title={t("cloneDashboard")}
      actions={[
        {
          label: t("clone"),
          loading: isPending,
          onClick: onConfirm,
        },
      ]}
    >
      <Dialog.Body>
        <p className="text-muted-foreground">
          {t("cloneDashboardBody", { name: dashboardName })}
          {hasPendingChange && t("cloneDashboardChange")}
          {setAsHome && t("cloneDashboardHome")}
        </p>
        <p className="text-muted-foreground">{t("cloneDashboardTiles")}</p>
        {existingCloneName && (
          <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
            <span className="text-muted-foreground">
              {t("cloneDashboardExists", { name: existingCloneName })}
              {hasPendingChange ? t("cloneDashboardExistsChange") : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              text={t("openExistingClone")}
              icon={ExternalLinkIcon}
              disabled={isPending}
              onClick={onOpenExisting}
            />
          </div>
        )}
      </Dialog.Body>
    </Dialog>
  );
}
