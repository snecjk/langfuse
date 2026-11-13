import { useState } from "react";
import { ExternalLink } from "@langfuse/icons";
import { ExpandToggle } from "@/src/components/design-system/ExpandToggle/ExpandToggle";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import Link from "next/link";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

type ValidationError = {
  datasetItemId: string;
  field: "input" | "expectedOutput";
  errors: Array<{
    path: string;
    message: string;
    keyword?: string;
  }>;
};

type DatasetSchemaValidationErrorProps = {
  projectId: string;
  datasetId: string;
  errors: ValidationError[];
};

export const DatasetSchemaValidationError: React.FC<
  DatasetSchemaValidationErrorProps
> = ({ projectId, datasetId, errors }) => {
  const t = useTranslation(datasetsMessages);
  const [isExpanded, setIsExpanded] = useState(false);

  const errorCount = errors.length;
  const hasMoreThan10 = errorCount === 10; // Backend limits to 10 errors

  return (
    <div className="mt-4">
      <Alert variant="destructive">
        <Alert.Title>{t("schemaValidationFailedTitle")}</Alert.Title>
        <Alert.Description>
          <div className="mt-2 flex flex-col gap-3">
            <p className="text-sm">
              {hasMoreThan10
                ? t("validationFailedCapped")
                : t("validationFailedCount", { count: errorCount })}
            </p>

            <ExpandToggle
              variant="icon"
              expanded={isExpanded}
              label={t("showErrorDetails")}
              expandedLabel={t("hideErrorDetails")}
              onExpandedChange={setIsExpanded}
            />

            {isExpanded && (
              <div className="border-destructive/20 bg-destructive/5 mt-3 space-y-3 rounded-md border p-3">
                {errors.map((error, idx) => (
                  <div
                    key={`${error.datasetItemId}-${error.field}`}
                    className="border-destructive/10 space-y-1 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          #{idx + 1}
                        </span>
                        <Link
                          href={`/project/${projectId}/datasets/${datasetId}/items/${encodeURIComponent(error.datasetItemId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm font-bold hover:underline"
                        >
                          {t("itemWithId", { id: error.datasetItemId })}
                          <ExternalLink size="sm" />
                        </Link>
                      </div>
                      <span className="bg-destructive/20 rounded px-2 py-0.5 text-xs font-bold">
                        {error.field === "input"
                          ? t("input")
                          : t("expectedOutput")}
                      </span>
                    </div>

                    <ul className="ml-6 space-y-1 text-sm">
                      {error.errors.map((err, errIdx) => (
                        <li key={errIdx} className="text-destructive">
                          <span className="text-muted-foreground font-mono text-xs">
                            {t("pathLabel", { path: err.path })}
                          </span>
                          : {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {hasMoreThan10 && (
                  <p className="text-muted-foreground pt-2 text-xs">
                    {t("fixValidationErrors")}
                  </p>
                )}
              </div>
            )}
          </div>
        </Alert.Description>
      </Alert>
    </div>
  );
};
