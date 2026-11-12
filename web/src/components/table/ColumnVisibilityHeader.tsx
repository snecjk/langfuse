import { RotateCcw } from "@langfuse/icons";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tableMessages } from "@/src/features/i18n/messages/table";

export function ColumnVisibilityHeader({
  onRestoreDefaults,
}: {
  onRestoreDefaults?: () => void;
}) {
  const t = useTranslation(tableMessages);
  return (
    <div className="bg-popover sticky top-0 z-10 flex h-10 items-center justify-between gap-3 border-b px-3">
      <p className="text-sm font-bold">{t("columnHeader")}</p>
      {onRestoreDefaults && (
        <Button
          variant="outline"
          size="sm"
          className="bg-accent gap-1.5 text-xs"
          onClick={onRestoreDefaults}
        >
          <RotateCcw size="base" color="default" />
          {t("restoreDefaults")}
        </Button>
      )}
    </div>
  );
}
