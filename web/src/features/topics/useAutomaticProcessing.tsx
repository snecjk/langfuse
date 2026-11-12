import { getEvaluatorBlockMetadata } from "@langfuse/shared";
import { type TopicRule } from "@langfuse/shared/topics";
import { api, type RouterOutputs } from "@/src/utils/api";
import { type AutomaticProcessingState } from "./prepare-topics-actions";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

type StoredSettings = RouterOutputs["topics"]["modelSettings"];

/**
 * Automatic processing status and its single write. The paused notice's
 * "Keep off" and the dialog's Save share it, so writes never overlap.
 */
export function useAutomaticProcessing({
  projectId,
  rule,
  stored,
  t,
}: {
  projectId: string;
  rule: TopicRule | null;
  stored: StoredSettings | undefined;
  t: T;
}) {
  const mutation = useSetAutomaticProcessing(projectId);
  return {
    state: automaticProcessingState(stored, rule, t),
    clearPause: () => mutation.mutate({ projectId, enabled: false }),
    save: (input: { enabled: boolean; sampling: number }) =>
      mutation.mutateAsync({ projectId, ...input }),
    saving: mutation.isPending,
  };
}

function useSetAutomaticProcessing(projectId: string) {
  const utils = api.useUtils();
  return api.topics.setAutomaticProcessing.useMutation({
    onSuccess: () =>
      Promise.all([
        utils.topics.modelSettings.invalidate({ projectId }),
        utils.topics.rules.invalidate({ projectId }),
      ]),
  });
}

function automaticProcessingState(
  stored: StoredSettings | undefined,
  rule: TopicRule | null,
  t: T,
): AutomaticProcessingState {
  if (!stored || stored.enabled === null || !rule)
    return { status: "unconfigured" };
  if (stored.blockMessage)
    return {
      status: "paused",
      shortLabel: stored.blockReason
        ? getEvaluatorBlockMetadata(stored.blockReason).shortLabel
        : t("paused"),
    };
  if (stored.enabled) return { status: "on" };
  return { status: "off" };
}
