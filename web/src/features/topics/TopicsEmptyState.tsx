import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";
import { Button } from "@/src/components/design-system/Button/Button";

export function TopicsEmptyState({
  onGenerateTopics,
  canGenerateTopics,
}: TopicsEmptyStateProps) {
  const t = useTranslation(topicsMessages);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h3 className="text-lg font-bold">{t("findPatternsTitle")}</h3>
      <p className="text-muted-foreground max-w-sm text-sm">
        {t("findPatternsBody")}
      </p>
      <Button
        text={t("generateTopics")}
        size="sm"
        disabled={!canGenerateTopics}
        onClick={onGenerateTopics}
      />
    </div>
  );
}

type TopicsEmptyStateProps = {
  onGenerateTopics: () => void;
  canGenerateTopics: boolean;
};
