import type { DatasetItemDomain } from "@langfuse/shared";
import DiffViewer from "@/src/components/DiffViewer";
import { Accordion } from "@/src/components/design-system/Accordion/Accordion";
import { stringifyDatasetItemData } from "../utils/datasetItemUtils";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

type DatasetItemDiffViewProps = {
  selectedVersion: DatasetItemDomain;
  latestVersion: DatasetItemDomain;
};

export const DatasetItemDiffView = ({
  selectedVersion,
  latestVersion,
}: DatasetItemDiffViewProps) => {
  const t = useTranslation(datasetsMessages);
  return (
    <div className="space-y-4">
      <div className="w-full">
        <Accordion type="multiple" defaultValue={["input", "output"]}>
          <Accordion.Item value="input">
            <Accordion.Trigger>{t("input")}</Accordion.Trigger>
            <Accordion.Content>
              <div className="pb-4">
                <DiffViewer
                  oldString={stringifyDatasetItemData(selectedVersion.input)}
                  newString={stringifyDatasetItemData(latestVersion.input)}
                  oldLabel={t("selectedVersionLabel")}
                  newLabel={t("latestVersionLabel")}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="output">
            <Accordion.Trigger>{t("expectedOutput")}</Accordion.Trigger>
            <Accordion.Content>
              <div className="pb-4">
                <DiffViewer
                  oldString={stringifyDatasetItemData(
                    selectedVersion.expectedOutput,
                  )}
                  newString={stringifyDatasetItemData(
                    latestVersion.expectedOutput,
                  )}
                  oldLabel={t("selectedVersionLabel")}
                  newLabel={t("latestVersionLabel")}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="metadata">
            <Accordion.Trigger>{t("metadata")}</Accordion.Trigger>
            <Accordion.Content>
              <div className="pb-4">
                <DiffViewer
                  oldString={stringifyDatasetItemData(selectedVersion.metadata)}
                  newString={stringifyDatasetItemData(latestVersion.metadata)}
                  oldLabel={t("selectedVersionLabel")}
                  newLabel={t("latestVersionLabel")}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
};
