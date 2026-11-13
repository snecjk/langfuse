import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { navigationMessages } from "@/src/features/i18n/messages/navigation";

export function SessionErrorBanner({ onRetry }: { onRetry: () => void }) {
  const t = useTranslation(navigationMessages);
  return (
    <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
      <span role="alert">
        {t("sessionUnavailable")}{" "}
        <Button text={t("retry")} variant="text" onClick={onRetry} />{" "}
        {t("sessionUnavailableHint")}
      </span>
    </div>
  );
}
