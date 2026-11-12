/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { Button } from "@/src/components/ui/button";
import { useInternalViewMode } from "../hooks/useInternalViewMode";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function InternalViewModeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const viewMode = useInternalViewMode();
  const t = useTranslation(enterpriseMessages);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("featureFlagsViewModeTitle")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription className="m-0 leading-relaxed">
            {t("featureFlagsViewModeDescription")}
          </DialogDescription>
          <div className="flex items-center gap-4 py-2">
            <label
              htmlFor="internal-view-mode"
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              {t("featureFlagsInternalView")}
            </label>
            <Switch
              id="internal-view-mode"
              checked={viewMode.mode === "INTERNAL"}
              disabled={viewMode.saving}
              onCheckedChange={(enabled) =>
                viewMode.setMode(enabled ? "INTERNAL" : "EXTERNAL")
              }
            />
          </div>
        </DialogBody>
        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button variant="ghost">{t("migrationClose")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
