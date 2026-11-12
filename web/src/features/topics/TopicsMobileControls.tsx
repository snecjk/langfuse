import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import {
  TOPICS_RESULTS_VIEWS,
  type TopicsResultsView,
} from "./TopicsResultsViewSelect";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

export function TopicsMobileControls({
  facets,
  selectedFacet,
  onSelectFacet,
  view,
  onSelectView,
}: TopicsMobileControlsProps) {
  const t = useTranslation(topicsMessages);
  const viewLabels: Record<TopicsResultsView, keyof typeof topicsMessages.en> =
    {
      treemap: "viewTreemap",
      "treemap-side": "viewTreemapSide",
      grid: "viewGrid",
      map: "viewMap",
    };
  return (
    <div className="ph-no-capture flex min-w-0 items-center gap-2">
      <div className="w-40 min-w-0">
        <SelectInput
          aria-label={t("topicsFacet")}
          placeholder={t("facet")}
          value={selectedFacet}
          onValueChange={onSelectFacet}
          options={facets.map((facet) => ({
            value: facet.facetId,
            label: facet.name,
          }))}
        />
      </div>
      <div className="w-28 shrink-0">
        <SelectInput
          aria-label={t("topicsView")}
          placeholder={t("visualizeAs")}
          value={view}
          onValueChange={onSelectView}
          options={TOPICS_RESULTS_VIEWS.map((option) => ({
            value: option.value,
            label: t(viewLabels[option.value]),
          }))}
        />
      </div>
    </div>
  );
}

type TopicsMobileControlsProps = {
  facets: readonly { facetId: string; name: string }[];
  selectedFacet: string;
  onSelectFacet: (facetId: string) => void;
  view: TopicsResultsView;
  onSelectView: (view: TopicsResultsView) => void;
};
