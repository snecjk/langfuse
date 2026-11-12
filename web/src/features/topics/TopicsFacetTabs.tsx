import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

export function TopicsFacetTabs({
  facets,
  selectedFacet,
  onSelectFacet,
}: TopicsFacetTabsProps) {
  const t = useTranslation(topicsMessages);
  return (
    <div className="ph-no-capture">
      <Tabs value={selectedFacet} onValueChange={onSelectFacet}>
        <Tabs.List variant="inset" size="sm" aria-label={t("topicsFacets")}>
          {facets.map((facet) => (
            <Tabs.Trigger
              key={facet.facetId}
              value={facet.facetId}
              label={facet.name}
            />
          ))}
        </Tabs.List>
      </Tabs>
    </div>
  );
}

type TopicsFacetTabsProps = {
  facets: readonly { facetId: string; name: string }[];
  selectedFacet: string;
  onSelectFacet: (facetId: string) => void;
};