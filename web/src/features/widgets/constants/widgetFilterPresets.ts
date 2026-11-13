import { type views } from "@langfuse/shared/query";
import { type z } from "zod";
import { BeakerIcon, type IconComponent } from "@langfuse/icons";
import { type FilterState } from "@langfuse/shared";

/**
 * Widget filter preset definition. `label` and `description` hold stable
 * widgetMessages keys (not display copy) so the presets popover renders them
 * in the active interface language.
 */
type WidgetFilterPreset = {
  label: string;
  description: string;
  icon: IconComponent;
  /** The view this preset applies to */
  view: z.infer<typeof views>;
  /** Filters to apply - must be complete, valid filters */
  filters: FilterState;
};

/**
 * Predefined filter presets for common widget configurations.
 *
 * To add a new preset:
 * 1. Add a new key to this object
 * 2. TypeScript will validate that filters match FilterState schema
 * 3. If a filter column is renamed/removed, TypeScript won't catch it directly,
 *    but the filter will fail at runtime when applied
 */
export const WIDGET_FILTER_PRESETS = {
  allExperimentData: {
    label: "presetExperimentData",
    description: "presetExperimentDataHelp",
    icon: BeakerIcon,
    view: "observations",
    filters: [
      {
        column: "experimentId",
        type: "null",
        operator: "is not null",
        value: "",
      },
    ],
  },
} as const satisfies Record<string, WidgetFilterPreset>;
