/* eslint-disable @typescript-eslint/no-use-before-define */
import { useRef, useState } from "react";
import { api, type RouterOutputs } from "@/src/utils/api";
import {
  type TopicExecutionStatus,
  type TopicFacet,
  type TopicFacetRef,
  type TopicRule,
  type TopicTimeRange,
} from "@langfuse/shared/topics";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

/**
 * Data and the `topics.trigger` (`operation: "update"`) write behind the
 * Regenerate topics dialog. Facets follow the Topics rule at their latest
 * version, the one automatic processing summarizes with. Call it above the
 * dialog content so the request and its error outlive a close.
 */
export function useRegenerateTopics({
  projectId,
  facets,
  canWrite,
  timeRange,
  executions,
  executionsError,
}: {
  projectId: string;
  facets: TopicFacet[];
  canWrite: boolean;
  timeRange: TopicTimeRange | null;
  executions: TopicExecutionList | undefined;
  executionsError: string | null;
}) {
  const t = useTranslation(topicsMessages);
  const settings = api.topics.modelSettings.useQuery({ projectId });
  const rules = api.topics.rules.useQuery({ projectId });
  const configured = Boolean(
    settings.data?.summary &&
    settings.data.embedding &&
    settings.data.clustering,
  );
  const rule = rules.data?.length === 1 ? rules.data[0] : null;
  const prerequisiteReason = (() => {
    if (rules.error)
      return t("couldNotLoadActiveFacets", { message: rules.error.message });
    if (!rules.isSuccess) return t("checkingActiveFacets");
    if (executionsError)
      return t("couldNotCheckRuns", { message: executionsError });
    if (executions === undefined) return t("checkingRuns");
    return null;
  })();
  const candidates = rules.isSuccess ? ruleFacets(facets, rule) : [];
  const runInProgress = Boolean(
    executions?.some((execution) => isBusy(execution.status)),
  );
  const pausedMessage = settings.data?.blockedAt
    ? (settings.data.blockMessage ?? "")
    : null;
  const disabledReason =
    prerequisiteReason ??
    regenerateDisabledReason({
      canWrite,
      settings: settings.isPending
        ? "loading"
        : {
            configured,
            pausedMessage,
          },
      runInProgress,
      hasTimeRange: timeRange !== null,
      facetCount: candidates.length,
      t,
    });
  // Survives reopening the dialog so a retried identical request reuses its
  // requestId and cannot start a second run.
  const request = useRef<{ key: string; id: string } | null>(null);
  const trigger = api.topics.trigger.useMutation();
  const [error, setError] = useState<string | null>(null);
  /** Resolves to the new execution id, or null after recording `error`. */
  async function submit(values: RegenerateRequest) {
    if (!timeRange) return null;
    setError(null);
    const input = {
      projectId,
      operation: "update" as const,
      timeRange,
      ...values,
    };
    const key = JSON.stringify(input);
    if (request.current?.key !== key)
      request.current = { key, id: crypto.randomUUID() };
    try {
      const result = await trigger.mutateAsync({
        ...input,
        requestId: request.current.id,
      });
      request.current = null;
      return result.id;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t("couldNotRegenerate"),
      );
      return null;
    }
  }
  function clearError() {
    if (!trigger.isPending) setError(null);
  }
  return {
    timeRange,
    facets: candidates,
    disabledReason,
    prerequisiteReason,
    isSubmitting: trigger.isPending,
    error,
    clearError,
    submit,
  };
}

function ruleFacets(facets: TopicFacet[], rule: TopicRule | null) {
  return facets.flatMap((facet) => {
    const version = facet.versions[0];
    if (!version || (rule && !rule.facetIds.includes(facet.id))) return [];
    return [{ facet, version }];
  });
}

function regenerateDisabledReason({
  canWrite,
  settings,
  runInProgress,
  hasTimeRange,
  facetCount,
  t,
}: {
  canWrite: boolean;
  settings: "loading" | { configured: boolean; pausedMessage: string | null };
  runInProgress: boolean;
  hasTimeRange: boolean;
  facetCount: number;
  t: T;
}): string | null {
  if (!canWrite) return t("regenerateNeedsPermission");
  if (settings === "loading") return t("checkingSetup");
  if (settings.pausedMessage !== null)
    return [t("topicsPausedPrefix"), settings.pausedMessage]
      .filter(Boolean)
      .join(" ");
  if (!settings.configured) return t("chooseModelsToRegenerate");
  if (runInProgress) return t("runInProgressRegenerate");
  if (!hasTimeRange) return t("chooseValidTimeRange");
  if (facetCount === 0) return t("turnOnFacetToRegenerate");
  return null;
}

const isBusy = (status: TopicExecutionStatus) =>
  status === "queued" || status === "running";

type TopicExecutionList = RouterOutputs["topics"]["executions"];
export type RegenerateRequest = {
  facets: TopicFacetRef[];
  exploratory: boolean;
  minimumTraceCount: number;
};
export type RegenerateTopics = ReturnType<typeof useRegenerateTopics>;
