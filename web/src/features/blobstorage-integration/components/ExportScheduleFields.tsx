import { useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import {
  BlobStorageExportMode,
  BlobStorageIntegrationFileType,
} from "@langfuse/shared";
import { type BlobStorageFormControl } from "@/src/features/blobstorage-integration/components/formValues";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

// Frequency, file type, and export mode (with the custom start date when the
// mode requires one).
export const ExportScheduleFields = ({
  control,
}: {
  control: BlobStorageFormControl;
}) => {
  const watchedExportMode = useWatch({ control, name: "exportMode" });
  const t = useTranslation(integrationMessages);

  return (
    <>
      <FormField
        control={control}
        name="exportFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("exportFrequency")}</FormLabel>
            <FormControl>
              <SelectInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("selectFrequency")}
                options={[
                  { value: "every_20_minutes", label: t("frequency20Min") },
                  { value: "hourly", label: t("frequencyHourly") },
                  { value: "daily", label: t("frequencyDaily") },
                  { value: "weekly", label: t("frequencyWeekly") },
                ]}
              />
            </FormControl>
            <FormDescription>{t("exportFrequencyHelp")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="fileType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fileType")}</FormLabel>
            <FormControl>
              <SelectInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("selectFileType")}
                options={[
                  {
                    value: BlobStorageIntegrationFileType.PARQUET,
                    label: "Parquet",
                  },
                  {
                    value: BlobStorageIntegrationFileType.JSONL,
                    label: "JSONL",
                  },
                  {
                    value: BlobStorageIntegrationFileType.CSV,
                    label: "CSV",
                  },
                  {
                    value: BlobStorageIntegrationFileType.JSON,
                    label: "JSON",
                  },
                ]}
              />
            </FormControl>
            <FormDescription>
              {field.value === BlobStorageIntegrationFileType.PARQUET
                ? t("fileTypeParquetHelp")
                : t("fileTypeHelp")}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="exportMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("exportModeField")}</FormLabel>
            <FormControl>
              <SelectInput
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("selectExportMode")}
                options={[
                  {
                    value: BlobStorageExportMode.FULL_HISTORY,
                    label: t("exportModeFullHistory"),
                  },
                  {
                    value: BlobStorageExportMode.FROM_TODAY,
                    label: t("today"),
                  },
                  {
                    value: BlobStorageExportMode.FROM_CUSTOM_DATE,
                    label: t("customDate"),
                  },
                ]}
              />
            </FormControl>
            <FormDescription>{t("exportModeHelp")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchedExportMode === BlobStorageExportMode.FROM_CUSTOM_DATE && (
        <FormField
          control={control}
          name="exportStartDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("exportStartDateField")}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  max={(() => {
                    const t = new Date();
                    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
                  })()}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : null;
                    field.onChange(date);
                  }}
                  placeholder={t("exportStartDatePlaceholder")}
                />
              </FormControl>
              <FormDescription>{t("exportStartDateHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
