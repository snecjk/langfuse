export const DASHBOARD_TABS = {
  DASHBOARDS: "dashboards",
  WIDGETS: "widgets",
} as const;

export const getDashboardTabs = (projectId: string) => [
  {
    value: DASHBOARD_TABS.DASHBOARDS,
    label: "Dashboards",
    labelKey: "dashboards" as const,
    href: `/project/${projectId}/dashboards`,
  },
  {
    value: DASHBOARD_TABS.WIDGETS,
    label: "Widgets",
    labelKey: "widgets" as const,
    href: `/project/${projectId}/widgets`,
  },
];
