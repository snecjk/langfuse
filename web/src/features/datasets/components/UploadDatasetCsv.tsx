/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { z } from "zod";
import { parseCsvClient } from "@/src/features/datasets/lib/csv/helpers";
import { DialogBody } from "@/src/components/ui/dialog";
import { Dropzone } from "@/src/components/design-system/Dropzone/Dropzone";
import type { CsvPreviewResult } from "@/src/features/datasets/lib/csv/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

export const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1 * 10; // 10MB
const ACCEPTED_FILE_TYPES = ["text/csv"] as const;

const FileSchema = z.object({
  type: z.enum([...ACCEPTED_FILE_TYPES]),
  size: z.number().min(1),
});

export const UploadDatasetCsv = ({
  setPreview,
  setCsvFile,
}: {
  setPreview: (preview: CsvPreviewResult | null) => void;
  setCsvFile: (file: File | null) => void;
}) => {
  const t = useTranslation(datasetsMessages);
  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const result = FileSchema.safeParse(file);
    if (!result.success) {
      showErrorToast(t("invalidFileType"), t("invalidFileTypeHelp"), {
        operation: "dataset_items.import",
        errorOrigin: "frontend",
        errorCategory: "user_input",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showErrorToast(t("fileTooLarge"), t("fileTooLargeHelp"), {
        operation: "dataset_items.import",
        errorOrigin: "frontend",
        errorCategory: "resource_limit",
      });
      return;
    }

    try {
      setCsvFile(file);
      const preview = await parseCsvClient(file, {
        isPreview: true,
        collectSamples: true,
      });

      if (!Boolean(preview.columns.length)) {
        showErrorToast(t("invalidCsv"), t("invalidCsvHelp"), {
          operation: "dataset_items.import",
          errorOrigin: "frontend",
          errorCategory: "user_input",
        });
        return;
      }

      setPreview(preview);
    } catch (error) {
      showErrorToast(
        t("csvParseFailed"),
        error instanceof Error ? error.message : t("csvParseFailed"),
        {
          operation: "dataset_items.import",
          errorOrigin: "frontend",
          errorCategory: "user_input",
        },
      );
    }
  };

  return (
    <DialogBody className="border-t">
      <Card className="h-full items-center justify-center border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">{t("addItemsToDataset")}</CardTitle>
          <CardDescription>{t("addItemsHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dropzone
            onDrop={handleFiles}
            accept={{ "text/csv": [".csv"] }}
            isDisabled={false}
            maxFiles={1}
            maxSize={MAX_FILE_SIZE_BYTES}
            minSize={undefined}
            onError={undefined}
            src={undefined}
            variant="panel"
          />
        </CardContent>
      </Card>
    </DialogBody>
  );
};
