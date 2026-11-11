export const EVALS_TABS = {
  CONFIGS: "configs",
  TEMPLATES: "templates",
} as const;

export const getEvalsTabs = (projectId: string) => [
  {
    value: EVALS_TABS.CONFIGS,
    label: "Running Evaluators",
    labelKey: "runningEvaluators" as const,
    href: `/project/${projectId}/evals/legacy`,
  },
  {
    value: EVALS_TABS.TEMPLATES,
    label: "Evaluator Library",
    labelKey: "evaluatorLibrary" as const,
    href: `/project/${projectId}/evals/templates`,
  },
];
