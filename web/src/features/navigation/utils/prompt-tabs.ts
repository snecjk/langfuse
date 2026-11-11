export const PROMPT_TABS = {
  VERSIONS: "versions",
  METRICS: "metrics",
} as const;

export const getPromptTabs = (projectId: string, promptName: string) => [
  {
    value: PROMPT_TABS.VERSIONS,
    label: "Versions",
    labelKey: "versions" as const,
    href: `/project/${projectId}/prompts/${encodeURIComponent(promptName)}`,
  },
  {
    value: PROMPT_TABS.METRICS,
    label: "Metrics",
    labelKey: "metrics" as const,
    href: `/project/${projectId}/prompts/${encodeURIComponent(promptName)}/metrics`,
  },
];
