export const EVALS_V2_TABS = {
  EVALUATORS: "evaluators",
  RULES: "rules",
} as const;

export const getEvalsV2Tabs = (projectId: string) => [
  {
    value: EVALS_V2_TABS.EVALUATORS,
    label: "Evaluators",
    labelKey: "evaluators" as const,
    href: `/project/${projectId}/evals`,
  },
  {
    value: EVALS_V2_TABS.RULES,
    label: "Rules",
    labelKey: "rules" as const,
    href: `/project/${projectId}/evals/rules`,
  },
];
