/* eslint-disable @repo/no-abstracted-overlay-trigger */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { type IoRenderMode } from "@/src/components/table/data-table-io-render-mode-switch";
import { Button } from "@/src/components/ui/button";
import { Settings2, Check } from "@langfuse/icons";
import {
  type ExperimentDiffMode,
  type ExperimentResultsLayout,
} from "@/src/features/experiments/hooks/useExperimentResultsState";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

type ExperimentDisplaySettingsProps = {
  layout: ExperimentResultsLayout;
  onLayoutChange: (layout: ExperimentResultsLayout) => void;
  diffMode: ExperimentDiffMode;
  onDiffModeChange: (diffMode: ExperimentDiffMode) => void;
  itemVisibility: "baseline-only" | "all";
  onItemVisibilityChange: (visibility: "baseline-only" | "all") => void;
  hasComparisons: boolean;
  hasBaseline: boolean;
  ioRenderMode: IoRenderMode;
  onIoRenderModeChange: (mode: IoRenderMode) => void;
};

/** A menu row that reads as a radio option. */
const OptionItem = ({
  selected,
  disabled,
  onSelect,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) => (
  <DropdownMenuItem onClick={onSelect} disabled={disabled}>
    {selected ? (
      <Check size="base" color="default" __rawClassName="mr-2" />
    ) : (
      <span className="mr-2 h-4 w-4 shrink-0" />
    )}
    {children}
  </DropdownMenuItem>
);

/**
 * The shape of the comparison, as one menu: which layout, what each cell's
 * second line is measured against, and whether items missing from the baseline
 * are listed.
 *
 * Comparison settings travel with a shared URL; cell format is stored locally.
 */
export function ExperimentDisplaySettings({
  layout,
  onLayoutChange,
  diffMode,
  onDiffModeChange,
  itemVisibility,
  onItemVisibilityChange,
  hasComparisons,
  hasBaseline,
  ioRenderMode,
  onIoRenderModeChange,
}: ExperimentDisplaySettingsProps) {
  const isItemVisibilityDisabled = !hasComparisons || !hasBaseline;
  const t = useTranslation(experimentMessages);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2.5 text-xs">
          <Settings2 size="base" color="default" />
          <span className="ml-2">{t("display")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t("layout")}</DropdownMenuLabel>
        <OptionItem
          selected={layout === "list"}
          onSelect={() => onLayoutChange("list")}
        >
          {t("listView")}
        </OptionItem>
        <OptionItem
          selected={layout === "grid"}
          onSelect={() => onLayoutChange("grid")}
        >
          {t("gridView")}
        </OptionItem>
        <OptionItem
          selected={layout === "matrix"}
          onSelect={() => onLayoutChange("matrix")}
        >
          {t("matrixView")}
        </OptionItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t("cellFormat")}</DropdownMenuLabel>
        <OptionItem
          selected={ioRenderMode === "json"}
          onSelect={() => onIoRenderModeChange("json")}
        >
          JSON
        </OptionItem>
        <OptionItem
          selected={ioRenderMode === "text"}
          onSelect={() => onIoRenderModeChange("text")}
        >
          {t("formatted")}
        </OptionItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t("diff")}</DropdownMenuLabel>
        <OptionItem
          selected={diffMode === "comparison"}
          onSelect={() => onDiffModeChange("comparison")}
        >
          {t("diffComparison")}
        </OptionItem>
        <OptionItem
          selected={diffMode === "expected"}
          onSelect={() => onDiffModeChange("expected")}
        >
          {t("diffExpected")}
        </OptionItem>
        <OptionItem
          selected={diffMode === "off"}
          onSelect={() => onDiffModeChange("off")}
        >
          {t("diffOff")}
        </OptionItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t("itemVisibility")}</DropdownMenuLabel>
        <OptionItem
          selected={itemVisibility === "baseline-only"}
          disabled={isItemVisibilityDisabled}
          onSelect={() => onItemVisibilityChange("baseline-only")}
        >
          {t("baselineOnly")}
        </OptionItem>
        <OptionItem
          selected={itemVisibility === "all"}
          disabled={isItemVisibilityDisabled}
          onSelect={() => onItemVisibilityChange("all")}
        >
          {t("showAll")}
        </OptionItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
