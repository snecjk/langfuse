import { MultiSelectTagInput } from "@/src/components/design-system/MultiSelectTagInput/MultiSelectTagInput";
import { useAllModels } from "@/src/features/dashboard/components/hooks";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboards";
import { type FilterState } from "@langfuse/shared";
import { type ViewVersion } from "@langfuse/shared/query";
import { useEffect, useState } from "react";

export const ModelSelectorPopover = ({
  allModels,
  selectedModels,
  setSelectedModels,
}: {
  allModels: { model: string }[];
  selectedModels: string[];
  setSelectedModels: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const t = useTranslation(dashboardMessages);
  return (
    <div className="w-80 max-w-full">
      <MultiSelectTagInput
        value={selectedModels}
        options={allModels.map(({ model }) => ({
          value: model,
          label: model || "none",
        }))}
        onValueChange={setSelectedModels}
        placeholder={t("selectModels")}
        searchPlaceholder={t("searchModels")}
        emptyMessage={t("noModelFound")}
        selectAllLabel={t("selectAll")}
      />
    </div>
  );
};

export const useModelSelection = (
  projectId: string,
  globalFilterState: FilterState,
  fromTimestamp: Date,
  toTimestamp: Date,
  metricsVersion: ViewVersion,
  options?: {
    enabled?: boolean;
    queryId: string;
  },
) => {
  const allModels = useAllModels(
    projectId,
    globalFilterState,
    fromTimestamp,
    toTimestamp,
    metricsVersion,
    options,
  );

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [firstAllModelUpdate, setFirstAllModelUpdate] = useState(true);

  useEffect(() => {
    if (firstAllModelUpdate && allModels.length > 0) {
      setSelectedModels(allModels.slice(0, 10).map((model) => model.model));
      setFirstAllModelUpdate(false);
    }
  }, [allModels, firstAllModelUpdate]);

  return {
    allModels,
    selectedModels,
    setSelectedModels,
  };
};
