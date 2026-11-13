import type { DatasetItemDomain } from "@langfuse/shared";
import {
  stringifyDatasetItemData,
  type DatasetSchema,
} from "../utils/datasetItemUtils";
import { DatasetItemFields } from "@/src/features/datasets/components/DatasetItemFields";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";
import { type DatasetItemRenderMode } from "@/src/features/datasets/components/DatasetItemField";

type DatasetItemViewModeContentProps = {
  item: DatasetItemDomain | null;
  isLoading: boolean;
  dataset: DatasetSchema | null;
  renderMode: DatasetItemRenderMode;
};

/**
 * Renders the latest version of a dataset item in view mode.
 * Handles loading and not-found states.
 */
export const DatasetItemViewModeContent = ({
  item,
  isLoading,
  dataset,
  renderMode,
}: DatasetItemViewModeContentProps) => {
  const t = useTranslation(datasetsMessages);
  if (isLoading) {
    return <div className="text-muted-foreground text-sm">{t("loading")}</div>;
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-bold">{t("itemNotFoundTitle")}</p>
          <p className="mt-2 text-sm">{t("itemNotFoundHelp")}</p>
        </div>
      </div>
    );
  }

  return (
    <DatasetItemFields
      values={{
        input: stringifyDatasetItemData(item.input),
        expectedOutput: stringifyDatasetItemData(item.expectedOutput),
        metadata: stringifyDatasetItemData(item.metadata),
      }}
      dataset={dataset}
      editable={false}
      renderMode={renderMode}
      projectId={item.projectId}
      datasetItemId={item.id}
    />
  );
};
