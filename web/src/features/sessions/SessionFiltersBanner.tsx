import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { navigationMessages } from "@/src/features/i18n/messages/navigation";

export function SessionFiltersBanner({
  onEdit,
  onClear,
}: {
  onEdit: () => void;
  onClear: () => void;
}) {
  const t = useTranslation(navigationMessages);
  return (
    <div
      role="status"
      className="bg-muted/40 text-muted-foreground flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2 text-sm"
    >
      <span className="flex-1">{t("sessionFiltersActive")}</span>
      <Button
        variant="ghost"
        size="sm"
        text={t("editFilters")}
        onClick={onEdit}
      />
      <Button
        variant="ghost"
        size="sm"
        text={t("clearFilters")}
        onClick={onClear}
      />
    </div>
  );
}
