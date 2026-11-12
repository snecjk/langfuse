import {
  type Facet,
  type FacetTopic,
  orderedFacetTopics,
} from "./facet-topics";
import {
  topicColor,
  treemapSwatchColor,
  treemapTileClasses,
  UNASSIGNED_SWATCH_COLOR,
  unassignedTileClasses,
} from "./topic-map-colors";
import { type TopicsResultsView } from "./TopicsResultsViewSelect";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

export const UNASSIGNED_TOPIC_ID = "__unassigned";

type TileColors = { tile: string; active: string; hover: string };

export type TopicDisplay = Pick<
  FacetTopic,
  "id" | "name" | "description" | "count"
> & {
  color: string;
  tiles: {
    small: TileColors;
    big: TileColors;
  };
};

/** Topic identity, counts, and colors shared by the list and treemap renderers. */
export function prepareTopicDisplay(
  facet: Facet,
  view: TopicsResultsView,
  t: T,
) {
  const mapIndices = new Map(
    orderedFacetTopics(facet).map((topic, index) => [topic.id, index]),
  );
  const topics: TopicDisplay[] = facet.topics.map(
    ({ id, name, description, count }, index) => ({
      id,
      name,
      description,
      count,
      color:
        view === "treemap"
          ? treemapSwatchColor(index)
          : topicColor(mapIndices.get(id) ?? -1),
      tiles: {
        small: treemapTileClasses(index, false),
        big: treemapTileClasses(index, true),
      },
    }),
  );
  const unassignedCount = Math.max(
    0,
    facet.counts.total - facet.counts.assigned,
  );
  if (unassignedCount > 0) {
    topics.push({
      id: UNASSIGNED_TOPIC_ID,
      name: t("unassigned"),
      description: t("unassignedDescription"),
      count: unassignedCount,
      color: UNASSIGNED_SWATCH_COLOR,
      tiles: { small: unassignedTileClasses, big: unassignedTileClasses },
    });
  }
  return { topics, total: facet.counts.total };
}

/** Counts only traces in a topic, which removes the Unassigned tile and list entry. */
export function facetWithoutUnassigned(facet: Facet): Facet {
  return {
    ...facet,
    counts: { ...facet.counts, total: facet.counts.assigned },
  };
}

/** Keeps points with a map topic, removing the map's Outliers and awaiting zones. */
export function mapWithoutUnassigned<
  T extends { points: { topicId: string | null }[] },
>(map: T): T {
  return { ...map, points: map.points.filter((point) => point.topicId) };
}
