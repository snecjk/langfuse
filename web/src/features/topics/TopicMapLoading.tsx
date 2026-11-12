import { cn } from "@/src/utils/tailwind";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

export function TopicMapLoading({ fillContainer }: TopicMapLoadingProps) {
  const t = useTranslation(topicsMessages);
  return (
    <div
      role="status"
      className={cn(
        "bg-muted/20 flex min-w-0 flex-col overflow-hidden rounded-lg border text-sm",
        fillContainer && "h-full min-h-0",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          fillContainer
            ? "min-h-0 flex-1"
            : "h-[clamp(380px,64vh,820px)] min-h-[340px]",
        )}
      >
        {t("loadingEmbeddingMap")}
      </div>
    </div>
  );
}

type TopicMapLoadingProps = {
  fillContainer: boolean;
};
