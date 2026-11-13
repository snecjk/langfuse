import { ZodModelConfig } from "@langfuse/shared";
import z from "zod";

/**
 * Builds the experiment form's validation schema with translated messages.
 * Called at render time so error messages follow the active interface locale;
 * the resolver is re-created when the locale changes.
 */
export const createExperimentDataSchema = (
  t: (key: ExperimentValidationKey) => string,
) =>
  z.object({
    name: z
      .string()
      .min(1, t("experimentNameRequired"))
      .transform((str) => str.trim()),
    runName: z.string().min(1, t("runNameRequired")),
    promptId: z.string().min(1, t("promptRequired")),
    datasetId: z.string().min(1, t("datasetRequired")),
    datasetVersion: z.coerce.date().optional(),
    description: z.string().max(1000).optional(),
    modelConfig: z.object({
      provider: z.string().min(1, t("providerRequired")),
      model: z.string().min(1, t("modelRequired")),
      modelParams: ZodModelConfig,
    }),
    structuredOutputSchema: z.record(z.string(), z.unknown()).optional(),
  });

export type ExperimentValidationKey =
  | "experimentNameRequired"
  | "runNameRequired"
  | "promptRequired"
  | "datasetRequired"
  | "providerRequired"
  | "modelRequired";

export type CreateExperiment = z.infer<
  ReturnType<typeof createExperimentDataSchema>
>;
