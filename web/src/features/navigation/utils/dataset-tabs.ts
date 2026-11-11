export const DATASET_TABS = {
  ITEMS: "items",
  EXPERIMENTS: "experiments",
} as const;

export const getDatasetTabs = (projectId: string, datasetId: string) => {
  return [
    {
      value: DATASET_TABS.ITEMS,
      label: "Items",
      labelKey: "items" as const,
      href: `/project/${projectId}/datasets/${encodeURIComponent(datasetId)}/items`,
    },
    {
      value: DATASET_TABS.EXPERIMENTS,
      label: "Experiments",
      labelKey: "experiments" as const,
      href: `/project/${projectId}/datasets/${encodeURIComponent(datasetId)}/experiments`,
    },
  ];
};
