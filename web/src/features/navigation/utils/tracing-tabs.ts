export const TRACING_TABS = {
  TRACES: "traces",
  OBSERVATIONS: "observations",
} as const;

export const getTracingTabs = (projectId: string) => [
  {
    value: TRACING_TABS.TRACES,
    label: "Traces",
    labelKey: "traces" as const,
    href: `/project/${projectId}/traces`,
  },
  {
    value: TRACING_TABS.OBSERVATIONS,
    label: "Observations",
    labelKey: "observations" as const,
    href: `/project/${projectId}/observations`,
  },
];
