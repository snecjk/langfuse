import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";
import { type TopicDisplay } from "./prepare-topic-display";

/** Persistent touch counterpart to a topic's hover details. */
export function TopicPreviewCard({
  topic,
  total,
}: {
  topic: Pick<TopicDisplay, "name" | "description" | "count">;
  total?: number | null;
}) {
  const t = useTranslation(topicsMessages);
  // Counts are approximate, so a topic can slightly exceed the total.
  const share =
    total && total > 0
      ? Math.min(100, Math.round((topic.count / total) * 100))
      : null;
  return (
    <div
      role="tooltip"
      className="ph-no-capture bg-popover text-popover-foreground pointer-events-none rounded-md border p-3 text-xs shadow-md"
    >
      <p className="font-bold">{topic.name}</p>
      <p className="text-muted-foreground mt-1">
        {t("tracesLabel", { count: topic.count })}
        {share !== null && ` · ${t("percentOfTraces", { percent: share })}`}
      </p>
      {topic.description && (
        <p className="mt-1 line-clamp-3">{topic.description}</p>
      )}
      <p className="text-muted-foreground mt-2">{t("tapAgainToViewTraces")}</p>
    </div>
  );
}
