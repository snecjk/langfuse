/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { DatasetForm } from "@/src/features/datasets/components/DatasetForm";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

type CreateDatasetTarget =
  | { type: "root" }
  | { type: "folder"; prefix: string };

export interface CreateDatasetDialogProps {
  projectId: string;
  target: CreateDatasetTarget;
}

interface CreateDatasetDialogContentProps extends CreateDatasetDialogProps {
  onFormSuccess: () => void;
}

export function CreateDatasetDialogContent({
  projectId,
  target,
  onFormSuccess,
}: CreateDatasetDialogContentProps) {
  const t = useTranslation(datasetsMessages);
  return (
    <DialogContent className="max-h-[90vh] sm:max-w-2xl md:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{t("createDatasetTitle")}</DialogTitle>
      </DialogHeader>
      <DatasetForm
        mode="create"
        projectId={projectId}
        onFormSuccess={onFormSuccess}
        folderPrefix={target.type === "folder" ? target.prefix : undefined}
      />
    </DialogContent>
  );
}
