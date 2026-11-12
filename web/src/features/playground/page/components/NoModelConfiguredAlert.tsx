import { AlertCircle, Settings } from "@langfuse/icons";
import Link from "next/link";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

interface NoModelConfiguredAlertProps {
  projectId: string;
}

export function NoModelConfiguredAlert({
  projectId,
}: NoModelConfiguredAlertProps) {
  const t = useTranslation(skillMessages);
  return (
    <div className="px-4 pt-4">
      <Alert variant="warning" icon={AlertCircle}>
        <Alert.Title>{t("noLLMConnectionConfigured")}</Alert.Title>
        <Alert.Description>
          {t("configureModelFirstPart1")}{" "}
          <Link
            href={`/project/${projectId}/settings/llm-connections`}
            className="font-bold underline underline-offset-4 hover:text-yellow-900 dark:hover:text-yellow-300"
          >
            <Settings size="sm" __rawClassName="inline" />{" "}
            {t("llmConnectionSettings")}
          </Link>{" "}
          {t("configureModelFirstPart2")}
        </Alert.Description>
      </Alert>
    </div>
  );
}
