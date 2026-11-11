export const SCORES_TABS = {
  SCORES: "scores",
  ANALYTICS: "analytics",
} as const;

export const getScoresTabs = (projectId: string) => [
  {
    value: SCORES_TABS.SCORES,
    label: "Scores",
    labelKey: "scores" as const,
    href: `/project/${projectId}/scores`,
  },
  {
    value: SCORES_TABS.ANALYTICS,
    label: "Analytics",
    labelKey: "analytics" as const,
    href: `/project/${projectId}/scores/analytics`,
  },
];
