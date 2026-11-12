/* eslint-disable no-nested-ternary, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import startCase from "lodash/startCase";
import { ChartTypeIllustration } from "@/src/features/widgets/components/ChartTypeIllustration";
import {
  HOME_DASHBOARD_PRESET_IDS,
  type HomeDashboardPresetId,
} from "@langfuse/shared";
import {
  isSuggestedWidgetView,
  type ViewVersion,
} from "@langfuse/shared/query";
import { getHomePresetMetadata } from "@/src/features/dashboard/components/home-preset-registry";
import { useReadPath } from "@/src/features/events/hooks/useReadPath";
import { type DashboardWidgetChartType } from "@langfuse/shared/src/db";
import { InAppAgentWidgetComposer } from "@/src/features/in-app-agent/components/InAppAgentWidgetComposer";
import { useInAppAiAgent } from "@/src/features/in-app-agent/components/InAppAiAgentProvider";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { widgetMessages } from "@/src/features/i18n/messages/widgets";

export type WidgetItem = {
  id: string;
  name: string;
  description: string;
  view: string;
  chartType: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Maps a chart type to the widget message key that names it. */
const CHART_TYPE_LABEL_KEYS: Record<string, string> = {
  LINE_TIME_SERIES: "chartTypeLine",
  AREA_TIME_SERIES: "chartTypeArea",
  BAR_TIME_SERIES: "chartTypeBarTimeSeries",
  HORIZONTAL_BAR: "chartTypeHorizontalBar",
  VERTICAL_BAR: "chartTypeVerticalBar",
  PIE: "chartTypePie",
  NUMBER: "chartTypeBigNumber",
  HISTOGRAM: "chartTypeHistogram",
  PIVOT_TABLE: "chartTypePivotTable",
};

const getChartTypeDisplayNameKey = (
  chartType: DashboardWidgetChartType,
): string => CHART_TYPE_LABEL_KEYS[chartType] ?? "chartTypeBigNumber";

const rowClassName =
  "flex w-full items-center gap-4 rounded-lg border p-3 text-left hover:bg-accent/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";

function RowIllustration({ type }: { type: string }) {
  return (
    <div className="bg-muted/40 flex h-14 w-[5.5rem] shrink-0 items-center justify-center rounded-md">
      <ChartTypeIllustration
        type={type as DashboardWidgetChartType | "CUSTOM"}
        className="h-11 w-16"
      />
    </div>
  );
}

function WidgetRow({
  widget,
  onClick,
  chartTypeLabel,
}: {
  widget: WidgetItem;
  onClick: () => void;
  chartTypeLabel: (chartType: string) => string;
}) {
  return (
    <button type="button" onClick={onClick} className={rowClassName}>
      <RowIllustration type={widget.chartType} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold" title={widget.name}>
          {widget.name}
        </div>
        {widget.description ? (
          <div
            className="text-muted-foreground truncate text-xs"
            title={widget.description}
          >
            {widget.description}
          </div>
        ) : null}
        <div className="text-muted-foreground/80 mt-0.5 text-xs">
          {chartTypeLabel(widget.chartType)} ·{" "}
          {startCase(widget.view.toLowerCase())}
        </div>
      </div>
    </button>
  );
}

interface SelectWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelectWidget: (widget: WidgetItem) => void;
  /** Adds a Langfuse Home card as a preset placement. */
  onSelectPreset?: (presetId: HomeDashboardPresetId) => void;
  dashboardId: string;
}

export function SelectWidgetDialog({
  open,
  onOpenChange,
  projectId,
  onSelectWidget,
  onSelectPreset,
  dashboardId,
}: SelectWidgetDialogProps) {
  const router = useRouter();
  const capture = usePostHogClientCapture();
  const t = useTranslation(widgetMessages);
  const { isAvailable, openAssistant, submit } = useInAppAiAgent();

  const openCapturedRef = useRef(false);
  useEffect(() => {
    if (open && !openCapturedRef.current) {
      capture("dashboard:add_widget_dialog_open", {
        dashboard_id: dashboardId,
      });
    }
    openCapturedRef.current = open;
  }, [open, dashboardId, capture]);

  // Fetch widgets (project-owned and Langfuse-maintained)
  const widgets = api.dashboardWidgets.all.useQuery(
    {
      projectId,
      orderBy: {
        column: "updatedAt",
        order: "DESC",
      },
    },
    {
      enabled: Boolean(projectId) && open,
    },
  );

  // Suggestions obey the same view allowlist the widget editor uses for new
  // definitions, so v4 users are never offered a v3 trace-based widget.
  // Legacy trace widgets stay listed and editable under /widgets. (LFE-14444)
  const { isV4, isResolved } = useReadPath();
  const suggestedVersion: ViewVersion = isV4 ? "v2" : "v1";
  const allProjectWidgets = widgets.data?.widgets ?? [];
  const projectWidgets = allProjectWidgets.filter((widget) =>
    isSuggestedWidgetView(widget.view, suggestedVersion),
  );
  const hiddenWidgetCount = allProjectWidgets.length - projectWidgets.length;
  // Replaces the generic empty state when it hid every widget, so the two can
  // never contradict each other.
  const hiddenWidgetsNote =
    hiddenWidgetCount > 0
      ? t(
          hiddenWidgetCount === 1
            ? "hiddenTraceWidgetsPlural"
            : "hiddenTraceWidgets",
          { count: hiddenWidgetCount },
        )
      : null;

  const selectWidget = (widget: WidgetItem) => {
    capture("dashboard:widget_added", {
      kind: "project_widget",
      widget_id: widget.id,
      chart_type: widget.chartType,
      view: widget.view,
      dashboard_id: dashboardId,
    });
    onSelectWidget(widget);
    onOpenChange(false);
  };

  const chartTypeLabel = (chartType: string): string =>
    t(
      getChartTypeDisplayNameKey(
        chartType as DashboardWidgetChartType,
      ) as Parameters<typeof t>[0],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t("addWidget")}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {/* !isResolved: an unresolved session reads as v3, which would
              briefly offer the unfiltered list to a v4 user. */}
          {widgets.isPending || !isResolved ? (
            <div className="py-8 text-center">{t("loadingWidgets")}</div>
          ) : widgets.isError ? (
            <div className="text-destructive py-8 text-center">
              {widgets.error.message}
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-1">
              {isAvailable && (
                <InAppAgentWidgetComposer
                  onSubmitted={() => onOpenChange(false)}
                  openAssistant={openAssistant}
                  submit={submit}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  capture("dashboard:new_widget_form_open", {
                    source: "add_widget_dialog",
                    dashboard_id: dashboardId,
                  });
                  router.push(
                    `/project/${projectId}/widgets/new?dashboardId=${dashboardId}`,
                  );
                }}
                className={`${rowClassName} border-dashed`}
              >
                <RowIllustration type="CUSTOM" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{t("customChart")}</div>
                  <div className="text-muted-foreground text-xs">
                    {t("customChartHelp")}
                  </div>
                </div>
              </button>

              <Tabs
                // Open on the project tab when it has something to say — a
                // hidden-widget note included, so it is not missed.
                defaultValue={
                  projectWidgets.length > 0 || hiddenWidgetsNote
                    ? "project"
                    : "home-cards"
                }
                onValueChange={(tab) =>
                  capture("dashboard:add_widget_tab_switch", { tab })
                }
              >
                <Tabs.List variant="inset" size="md">
                  <Tabs.Trigger
                    value="project"
                    label={t("yourWidgets", { count: projectWidgets.length })}
                  />
                  {onSelectPreset && (
                    <Tabs.Trigger
                      value="home-cards"
                      label={t("homeCards", {
                        count: HOME_DASHBOARD_PRESET_IDS.length,
                      })}
                    />
                  )}
                </Tabs.List>
                <div className="mt-2">
                  <Tabs.Content value="project">
                    <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto p-1">
                      {projectWidgets.map((widget) => (
                        <WidgetRow
                          key={widget.id}
                          widget={widget as WidgetItem}
                          chartTypeLabel={chartTypeLabel}
                          onClick={() => selectWidget(widget as WidgetItem)}
                        />
                      ))}
                      {projectWidgets.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                          {hiddenWidgetsNote ?? t("noSavedWidgets")}
                        </div>
                      ) : hiddenWidgetsNote ? (
                        <div className="text-muted-foreground px-1 py-2 text-xs">
                          {hiddenWidgetsNote}
                        </div>
                      ) : null}
                    </div>
                  </Tabs.Content>
                </div>
                {onSelectPreset && (
                  <div className="mt-2">
                    <Tabs.Content value="home-cards">
                      <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto p-1">
                        {HOME_DASHBOARD_PRESET_IDS.map((presetId) => {
                          const meta = getHomePresetMetadata(
                            presetId,
                            suggestedVersion,
                          );
                          return (
                            <button
                              key={presetId}
                              type="button"
                              onClick={() => {
                                capture("dashboard:widget_added", {
                                  kind: "home_preset",
                                  preset_id: presetId,
                                  dashboard_id: dashboardId,
                                });
                                onSelectPreset(presetId);
                                onOpenChange(false);
                              }}
                              className={rowClassName}
                            >
                              <RowIllustration type={meta.illustration} />
                              <div className="min-w-0 flex-1">
                                <div
                                  className="truncate font-bold"
                                  title={meta.name}
                                >
                                  {meta.name}
                                </div>
                                <div
                                  className="text-muted-foreground truncate text-xs"
                                  title={meta.description}
                                >
                                  {meta.description}
                                </div>
                                <div className="text-muted-foreground/80 mt-0.5 text-xs">
                                  {t("homeCardFixed")}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Tabs.Content>
                  </div>
                )}
              </Tabs>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
