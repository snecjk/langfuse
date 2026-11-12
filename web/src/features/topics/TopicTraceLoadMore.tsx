import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";
import { type TopicTracesResult } from "./facet-topics";

/** Short server pages cannot scroll, so more results stay one click away. */
export function TopicTraceLoadMore({ traces }: { traces: TopicTracesResult }) {
  const t = useTranslation(topicsMessages);
  return (
    <div className="flex shrink-0 justify-center border-t p-2">
      <Button
        text={t("loadMore")}
        variant="ghost"
        size="sm"
        loading={traces.isLoadingMore}
        onClick={traces.loadMore}
      />
    </div>
  );
}
