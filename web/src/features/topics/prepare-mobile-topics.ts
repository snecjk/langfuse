import { type FilterState } from "@langfuse/shared";
import { type Facet } from "./facet-topics";
import { topicTraceQuery } from "./topic-trace-filters";
import {
  prepareTopicDisplay,
  UNASSIGNED_TOPIC_ID,
} from "./prepare-topic-display";
import { type TopicsResultsView } from "./TopicsResultsViewSelect";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

function selectedTopicId(filters: FilterState) {
  const filter = filters.length === 1 ? filters[0] : undefined;
  if (filter?.type !== "stringOptions" || filter.value.length !== 1)
    return null;
  if (filter.column === "topicId" && filter.operator === "any of")
    return filter.value[0];
  if (
    filter.column === "assignment" &&
    filter.operator === "none of" &&
    filter.value[0] === "assigned"
  )
    return UNASSIGNED_TOPIC_ID;
  return null;
}

/** Results remain complete even when a topic is too small to label on a chart. */
export function prepareMobileTopics(
  facet: Facet,
  view: TopicsResultsView,
  filters: FilterState,
  searchQuery: string | null,
  showUnassigned: boolean,
  t: T,
) {
  const { topics } = prepareTopicDisplay(facet, view, t);
  const selection = selectedTopicId(filters);
  return {
    topics,
    selectedTopicId: selection,
    selectedTopic: topics.find((topic) => topic.id === selection),
    traceQuery: topicTraceQuery(filters, searchQuery, facet.topics, {
      assignedOnly: !showUnassigned,
    }),
  };
}
