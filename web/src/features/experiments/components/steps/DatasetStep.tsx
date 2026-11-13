import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Info, CircleCheck } from "@langfuse/icons";
import { type DatasetStepProps } from "@/src/features/experiments/types/stepProps";
import { StepHeader } from "@/src/features/experiments/components/shared/StepHeader";
import { api } from "@/src/utils/api";
import { format } from "date-fns";
import { DatasetPicker } from "@/src/features/experiments/components/steps/DatasetPicker";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";
import { describeVariableMismatch } from "@/src/features/experiments/fns/describeVariableMismatch";

export const DatasetStep: React.FC<DatasetStepProps> = ({
  projectId,
  formState,
  datasetState,
  promptInfo,
}) => {
  const { form } = formState;
  const {
    datasets,
    selectedDatasetId,
    expectedColumnsForDataset: expectedColumns,
    validationResult,
  } = datasetState;
  const { selectedPromptName, selectedPromptVersion } = promptInfo;
  const t = useTranslation(experimentMessages);
  const locale = useInterfaceLocale();

  // Fetch dataset versions when a dataset is selected
  const { data: datasetVersions } = api.datasets.listDatasetVersions.useQuery(
    {
      projectId,
      datasetId: selectedDatasetId || "",
    },
    {
      enabled: !!selectedDatasetId,
    },
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title={t("datasetSelectionTitle")}
        description={t("datasetSelectionHelp")}
      />

      <FormField
        control={form.control}
        name="datasetId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("dataset")}</FormLabel>
            <div className="flex items-center gap-2">
              <DatasetPicker
                datasets={datasets ?? []}
                selectedDatasetId={field.value}
                onSelect={(datasetId) => {
                  field.onChange(datasetId);
                  form.clearErrors("datasetId");
                }}
              />

              {selectedPromptName && selectedPromptVersion !== null && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8">
                      {t("expectedColumns")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="leading-none font-bold">
                        {t("expectedDatasetStructure")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {t("basedOnPrompt", {
                          name: selectedPromptName,
                          version: selectedPromptVersion,
                        })}
                      </p>
                      <div className="space-y-1 pt-2">
                        <p className="text-sm font-bold">
                          {t("inputVariables")}
                        </p>
                        <ul className="list-inside list-disc text-sm">
                          {expectedColumns.inputVariables.map((variable) => (
                            <li key={variable}>{variable}</li>
                          ))}
                        </ul>
                        <p className="text-sm font-bold">
                          {t("expectedOutputLabel")}
                        </p>
                        <ul className="list-inside list-disc text-sm">
                          <li>
                            {expectedColumns.outputVariableName} (
                            {expectedColumns.outputVariableType})
                          </li>
                        </ul>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedDatasetId && datasetVersions && datasetVersions.length > 0 && (
        <FormField
          control={form.control}
          name="datasetVersion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("datasetVersion")}</FormLabel>
              <Select
                onValueChange={(value) => {
                  if (value === "latest") {
                    field.onChange(undefined);
                  } else {
                    field.onChange(new Date(value));
                  }
                }}
                value={field.value ? field.value.toISOString() : "latest"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("latestVersion")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="latest">
                    {t("latestVersionDefault")}
                  </SelectItem>
                  {datasetVersions.map((version) => (
                    <SelectItem
                      key={version.toISOString()}
                      value={version.toISOString()}
                    >
                      {format(version, "MMM d, yyyy 'at' h:mm a")}{" "}
                      {t("utcLabel")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t("datasetVersionHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {selectedDatasetId && (
        <>
          {validationResult?.isValid === false && (
            <Card className="border-dark-yellow bg-light-yellow relative overflow-hidden rounded-md shadow-none group-data-[collapsible=icon]:hidden">
              <CardHeader className="p-2">
                <CardTitle className="text-dark-yellow flex items-center justify-between text-sm">
                  <span>{t("invalidConfiguration")}</span>
                  <Info size="base" />
                </CardTitle>
                <CardDescription className="text-foreground">
                  {validationResult.reason === "variable-mismatch"
                    ? describeVariableMismatch(
                        validationResult.variables ?? [],
                        locale,
                      )
                    : validationResult.message}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {validationResult?.isValid === true && (
            <Card className="border-dark-green bg-light-green relative overflow-hidden rounded-md shadow-none group-data-[collapsible=icon]:hidden">
              <CardHeader className="p-2">
                <CardTitle className="text-dark-green flex items-center justify-between text-sm">
                  <span>{t("validConfiguration")}</span>
                  <CircleCheck size="base" />
                </CardTitle>
                <div className="text-sm">
                  {t("matchesVariables")}
                  <ul className="my-2 ml-2 list-inside list-disc">
                    {Object.entries(validationResult.variablesMap ?? {}).map(
                      ([variable, count]) => (
                        <li key={variable}>
                          {t("itemVariableCount", {
                            variable,
                            count,
                            total: validationResult?.isValid
                              ? validationResult.totalItems
                              : t("unknownTotal"),
                          })}
                        </li>
                      ),
                    )}
                  </ul>
                  {t("missingVariablesNote")}
                </div>
              </CardHeader>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
