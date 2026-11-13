import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { type ExperimentDetailsStepProps } from "@/src/features/experiments/types/stepProps";
import { StepHeader } from "@/src/features/experiments/components/shared/StepHeader";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export const ExperimentDetailsStep: React.FC<ExperimentDetailsStepProps> = ({
  formState,
}) => {
  const { form } = formState;
  const t = useTranslation(experimentMessages);
  return (
    <div className="space-y-6">
      <StepHeader
        title={t("experimentRunDetailsTitle")}
        description={t("experimentRunDetailsHelp")}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("experimentName")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("enterExperimentName")}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("descriptionOptional")}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={t("describeExperiment")}
                className="min-h-[100px] w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
