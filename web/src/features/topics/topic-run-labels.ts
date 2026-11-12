import { type Status } from "@/src/components/ui/StatusBadge/StatusBadge";
import {
  type TopicExecutionStatus,
  type TopicOperation,
} from "@langfuse/shared/topics";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type Translator = ReturnType<typeof useTranslation<typeof topicsMessages>>;

export function operationLabel(
  operation: TopicOperation,
  t: Translator,
): string {
  return operation === "process" ? t("operationProcess") : t("operationUpdate");
}

export function executionLabel(
  status: TopicExecutionStatus,
  t: Translator,
): string {
  switch (status) {
    case "queued":
      return t("statusQueued");
    case "running":
      return t("statusRunning");
    case "completed":
      return t("statusComplete");
    case "completed_with_errors":
      return t("statusDoneWithIssues");
    case "failed":
      return t("statusFailed");
  }
}

/** StatusBadge types, so run statuses share the app-wide status colours. */
export const executionBadgeTypes: Record<TopicExecutionStatus, Status> = {
  queued: "queued",
  running: "running",
  completed: "completed",
  completed_with_errors: "partial",
  failed: "failed",
};

export const busy = (status: string) =>
  status === "queued" || status === "running";
