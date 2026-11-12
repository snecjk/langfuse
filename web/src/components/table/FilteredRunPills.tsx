/* eslint-disable @repo/no-style-props */
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { HoverCard } from "@/src/components/design-system/HoverCard/HoverCard";
import { api } from "@/src/utils/api";
import { ListFilter } from "@langfuse/icons";
import React, { useMemo } from "react";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tableMessages } from "@/src/features/i18n/messages/table";
import { type FilterCondition, type FilterState } from "@langfuse/shared";

interface FilteredRunPillsProps {
  projectId: string;
  datasetId: string;
  filteredRuns: {
    runId: string;
    filters: FilterState;
  }[];
  className?: string;
}

function operatorToText(
  operator: FilterCondition["operator"],
  t: (key: keyof (typeof tableMessages)["en"]) => string,
): string {
  switch (operator) {
    case "=":
      return t("operatorEquals");
    case ">=":
      return t("operatorGreaterThanOrEquals");
    case "<=":
      return t("operatorLessThanOrEquals");
    case ">":
      return t("operatorGreaterThan");
    case "<":
      return t("operatorLessThan");
  }
  return operator;
}

// Helper function to format filter information for display
function formatFilterForPill(
  filter: FilterCondition,
  t: (key: keyof (typeof tableMessages)["en"]) => string,
) {
  const { operator, value } = filter;
  const operatorText = operatorToText(operator, t);

  // Handle score filters with key
  if (filter.type === "numberObject" || filter.type === "booleanObject") {
    const valueStr = Array.isArray(value) ? value.join(", ") : String(value);
    return `${filter.key} ${operatorText} ${valueStr}`;
  }

  if (filter.type === "categoryOptions") {
    const valueStr = Array.isArray(value) ? value.join(", ") : String(value);
    return `${filter.key} ${operatorText} ${valueStr}`;
  }

  // Fallback for other filter types
  const valueStr = Array.isArray(value) ? value.join(", ") : String(value);
  return `${filter.column} ${operatorText} ${valueStr}`;
}

export function FilteredRunPills({
  projectId,
  datasetId,
  filteredRuns,
  className,
}: FilteredRunPillsProps) {
  const t = useTranslation(tableMessages);
  // Get run names from the API
  const { data: runs } = api.datasets.baseRunDataByDatasetId.useQuery({
    projectId,
    datasetId,
  });

  // Create a map of run ID to run name for quick lookup
  const runIdToName = useMemo(() => {
    if (!runs) return new Map<string, string>();
    return new Map(runs.map((run) => [run.id, run.name]));
  }, [runs]);

  // Flatten all filters with their associated run information
  const allFilters = filteredRuns.flatMap((runFilter) =>
    runFilter.filters.map((filter, index) => ({
      filter,
      runId: runFilter.runId,
      runName: runIdToName.get(runFilter.runId) ?? runFilter.runId,
      key: `${runFilter.runId}-${index}`,
    })),
  );

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}>
      {allFilters.map((item) => {
        return (
          <HoverCard
            key={item.key}
            content={
              <div className="w-64 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {item.runName}
                  </div>
                  <div className="space-y-1">
                    <div className="bg-muted rounded-md px-2 py-1 text-sm">
                      {formatFilterForPill(item.filter, t)}
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            {({ getTriggerProps }) => (
              <Badge
                color="filled"
                text={formatFilterForPill(item.filter, t)}
                leadingIcon={ListFilter}
                tabIndex={0}
                {...getTriggerProps()}
              />
            )}
          </HoverCard>
        );
      })}
    </div>
  );
}
