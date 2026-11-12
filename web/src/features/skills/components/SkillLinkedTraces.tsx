import { useState } from "react";
import { type FilterState } from "@langfuse/shared";
import { X } from "@langfuse/icons";
import EventsTable from "@/src/features/events/components/EventsTable";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { TableHeaderControls } from "@/src/components/table/TableHeaderControls";
import { useTableDateRange } from "@/src/hooks/useTableDateRange";
import { rangeToString, type TimeRange } from "@/src/utils/date-range-utils";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

export function SkillLinkedTraces({
  projectId,
  name,
  version,
  timeRange: parentTimeRange,
  fileFilter,
}: {
  projectId: string;
  name: string;
  version?: number;
  timeRange?: TimeRange;
  fileFilter?: {
    skillId: string;
    path: string;
    onClear: () => void;
  };
}) {
  const t = useTranslation(skillMessages);
  const [usage, setUsage] = useState<SkillUsage>("both");
  const selectedUsage = fileFilter ? "loaded" : usage;
  const { timeRange: localTimeRange, setTimeRange } =
    useTableDateRange(projectId);
  const timeRange = parentTimeRange ?? localTimeRange;
  const filters = buildSkillUsageFilters({
    name,
    version,
    usage: selectedUsage,
    fileFilter,
  });

  return (
    <section className="flex min-h-[240px] min-w-0 flex-1 flex-col gap-3 rounded-lg border pt-4">
      {!parentTimeRange ? (
        <TableHeaderControls
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      ) : null}
      <Tabs
        layout="fill"
        value={selectedUsage}
        onValueChange={(value) => {
          if (value === "both" || value === "available" || value === "loaded") {
            setUsage(value);
            if (value !== "loaded") fileFilter?.onClear();
          }
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold">{t("observations")}</h3>
              {fileFilter ? (
                <span className="ph-no-capture max-w-64 min-w-0">
                  <Badge
                    label={t("file")}
                    text={fileFilter.path}
                    trailingIcon={X}
                    color="filled"
                    aria-label={t("clearFileFilter", { path: fileFilter.path })}
                    onDismiss={() => {
                      setUsage("loaded");
                      fileFilter.onClear();
                    }}
                  />
                </span>
              ) : null}
            </div>
            <Tabs.List
              variant="inset"
              size="sm"
              aria-label={t("skillUsageFilter")}
            >
              <Tabs.Trigger
                value="both"
                label={t("any")}
                tooltip={t("observationsWhereSkillAvailableOrLoaded")}
              />
              <Tabs.Trigger
                value="available"
                label={t("availableTab")}
                tooltip={t("observationsOfferingThisSkill")}
              />
              <Tabs.Trigger
                value="loaded"
                label={t("loadedTab")}
                tooltip={t("observationsLoadingSkillFiles")}
              />
            </Tabs.List>
          </div>
          <Tabs.Content value={selectedUsage} layout="fill">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <EventsTable
                key={`${name}:${version}:${rangeToString(timeRange)}:${selectedUsage}:${fileFilter?.path ?? ""}`}
                projectId={projectId}
                skill={{ name, version }}
                externalFilterState={filters}
                isolateTableState
                showSearchBar={false}
                showToolbar={false}
                showFilterSidebar={false}
              />
            </div>
          </Tabs.Content>
        </div>
      </Tabs>
    </section>
  );
}

function buildSkillUsageFilters({
  name,
  version,
  usage,
  fileFilter,
}: {
  name: string;
  version: number | undefined;
  usage: SkillUsage;
  fileFilter: { skillId: string; path: string } | undefined;
}): FilterState {
  const column = {
    both: version === undefined ? "skillNames" : "skillVersions",
    available:
      version === undefined ? "skillNamesAvailable" : "skillVersionsAvailable",
    loaded:
      version === undefined ? "skillsNamesLoaded" : "skillsVersionsLoaded",
  }[usage];
  const skillFilters: FilterState = [
    {
      column,
      type: "arrayOptions",
      operator: "any of",
      value: [version === undefined ? name : `${name}@${version}`],
    },
  ];

  return fileFilter
    ? [
        ...skillFilters,
        {
          column: "skillFilesLoaded",
          type: "arrayOptions",
          operator: "any of",
          value: [`${fileFilter.skillId}/${fileFilter.path}`],
        },
      ]
    : skillFilters;
}

type SkillUsage = "both" | "available" | "loaded";
