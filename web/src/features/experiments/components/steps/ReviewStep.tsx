import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import { InfoIcon } from "@langfuse/icons";
import { type ReviewStepProps } from "@/src/features/experiments/types/stepProps";
import { StepHeader } from "@/src/features/experiments/components/shared/StepHeader";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formState,
  navigationState,
  errorMessage,
  summary,
}) => {
  const { form } = formState;
  const { setActiveStep } = navigationState;
  const t = useTranslation(experimentMessages);
  const {
    selectedPromptName,
    selectedPromptVersion,
    selectedDataset,
    modelParams,
    activeEvaluatorNames,
    structuredOutputEnabled,
    selectedSchemaName,
    validationResult,
  } = summary;
  const formValues = form.getValues();

  return (
    <div className="space-y-6">
      <StepHeader
        title={t("reviewTitle")}
        description={t("reviewHelp")}
        errorMessage={errorMessage}
      />

      {/* Two-column grid layout */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* Prompt Card - Top Left */}
        <Card
          className="hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setActiveStep("prompt")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("prompt")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t("nameLabel")}:</span>
              <span className="font-bold">{selectedPromptName}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t("version")}:</span>
              <span className="font-bold">v{selectedPromptVersion}</span>
            </div>
          </CardContent>
        </Card>

        {/* Model Card - Top Right */}
        <Card
          className="hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setActiveStep("prompt")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("model")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t("provider")}:</span>
              <span>{modelParams.provider.value}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t("model")}:</span>
              <span>{modelParams.model.value}</span>
            </div>
            {modelParams.temperature.enabled && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">
                  {t("temperature")}:
                </span>
                <span>{modelParams.temperature.value}</span>
              </div>
            )}
            {modelParams.max_tokens.enabled && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">{t("maxTokens")}:</span>
                <span>{modelParams.max_tokens.value}</span>
              </div>
            )}
            {structuredOutputEnabled && selectedSchemaName && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">
                  {t("structuredOutputLabel")}
                </span>
                <span>{selectedSchemaName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dataset Card - Middle Left */}
        <Card
          className="hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setActiveStep("dataset")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("dataset")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t("nameLabel")}:</span>
              <span className="font-bold">{selectedDataset?.name}</span>
            </div>
            {validationResult?.isValid && (
              <div className="flex gap-2">
                <span className="text-muted-foreground">{t("items")}:</span>
                <span>{validationResult.totalItems}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluators Card - Middle Right (only if there are evaluators) */}
        {activeEvaluatorNames.length > 0 && (
          <Card
            className="hover:bg-accent cursor-pointer transition-colors"
            onClick={() => setActiveStep("evaluators")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("evaluatorsCount", {
                  count: activeEvaluatorNames.length,
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activeEvaluatorNames.map((name) => (
                  <Badge key={name} color="filled" text={name} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Run Details Card - Bottom (Full Width) */}
        <Card
          className="hover:bg-accent cursor-pointer transition-colors md:col-span-2"
          onClick={() => setActiveStep("details")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t("experimentRunDetailsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">
                {t("experimentName")}:
              </span>
              <span className="font-bold">{formValues.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("runName")}</span>
              <span className="font-bold">{formValues.runName}</span>
              <Tooltip label={t("runNameHelp")}>
                {({ getTriggerProps }) => (
                  <InfoIcon {...getTriggerProps()} size="base" color="muted" />
                )}
              </Tooltip>
            </div>
            {formValues.description && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">
                  {t("description")}:
                </span>
                <span className="text-sm">{formValues.description}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
