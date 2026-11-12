/* eslint-disable no-nested-ternary */
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { useSession } from "next-auth/react";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { useReadPath } from "@/src/features/events/hooks/useReadPath";
import { V4_PREVIEW_LABEL } from "@/src/features/events/lib/v4PreviewLabel";
import { featurePreviewLabels } from "@/src/features/feature-flags/available-flags";
import { useInternalFeaturesEnabled } from "@/src/features/feature-flags/hooks/useInternalFeaturesEnabled";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

import {
  FeaturePreviewModal,
  type PreviewFlag,
  type PreviewState,
} from "./FeaturePreviewModal";

type ControlledFeaturePreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ControlledFeaturePreviewModal({
  open,
  onOpenChange,
}: ControlledFeaturePreviewModalProps) {
  const authSession = useSession();
  const internalViewEnabled = useInternalFeaturesEnabled();
  const { isV4 } = useReadPath();
  const capture = usePostHogClientCapture();
  const t = useTranslation(enterpriseMessages);
  const setFeaturePreviewEnabled =
    api.userAccount.setFeaturePreviewEnabled.useMutation({
      onSuccess: async (_data, variables) => {
        await authSession.update();
        capture("user_settings:feature_preview_toggled", {
          feature: variables.flag,
          isEnabled: variables.enabled,
        });
        showSuccessToast({
          operation: "user_feature_preview.update",
          title: t("featurePreviewUpdated"),
          description: t("featurePreviewUpdatedDescription", {
            name: featurePreviewLabels[variables.flag],
            state: variables.enabled
              ? t("featurePreviewStateEnabled")
              : t("featurePreviewStateDisabled"),
          }),
        });
      },
      onError: (error) => {
        showErrorToast(
          t("featurePreviewUpdateFailed"),
          error.message,
          classifyTrpcToastError(error, "user_feature_preview.update"),
        );
      },
    });

  const onToggle = (flag: PreviewFlag) => (enabled: boolean) =>
    setFeaturePreviewEnabled.mutate({ flag, enabled });

  const isTopicsEnabled =
    internalViewEnabled ||
    authSession.data?.user?.featureFlags.langfuseTopics === true;

  const isModernSessionEnabled =
    isV4 &&
    (authSession.data?.user?.featureFlags.sessionViewV2 === true ||
      authSession.data?.environment.enableExperimentalFeatures === true);

  const state: Partial<Record<PreviewFlag, PreviewState>> = {
    ...(internalViewEnabled ||
    authSession.data?.user?.featureFlags.unifiedTraceSessionView === true
      ? {
          unifiedTraceSessionView: {
            enabled:
              isV4 &&
              authSession.data?.user?.featureFlags.unifiedTraceSessionView ===
                true,
            disabled: !isV4,
            warningReason: !isV4
              ? t("featurePreviewUnavailableV4", { label: V4_PREVIEW_LABEL })
              : undefined,
            onToggle: onToggle("unifiedTraceSessionView"),
            isToggling: setFeaturePreviewEnabled.isPending,
          },
        }
      : {}),
    ...(isTopicsEnabled
      ? {
          langfuseTopics: {
            enabled: isTopicsEnabled,
            disabled: internalViewEnabled,
            warningReason: internalViewEnabled
              ? t("featurePreviewTopicsInternal")
              : undefined,
            onToggle: onToggle("langfuseTopics"),
            isToggling: setFeaturePreviewEnabled.isPending,
          },
        }
      : {}),
    sessionViewV2: {
      enabled: isModernSessionEnabled,
      disabled:
        !isV4 ||
        authSession.data?.environment.enableExperimentalFeatures === true,
      warningReason: !isV4
        ? t("featurePreviewSessionV4", { label: V4_PREVIEW_LABEL })
        : authSession.data?.environment.enableExperimentalFeatures === true
          ? t("featurePreviewExperimentalEnv")
          : undefined,
      onToggle: onToggle("sessionViewV2"),
      isToggling: setFeaturePreviewEnabled.isPending,
    },
    sessionViewV2Timeline: {
      enabled:
        isModernSessionEnabled &&
        (authSession.data?.user?.featureFlags.sessionViewV2Timeline === true ||
          authSession.data?.environment.enableExperimentalFeatures === true),
      disabled:
        !isModernSessionEnabled ||
        authSession.data?.environment.enableExperimentalFeatures === true,
      warningReason: !isV4
        ? t("featurePreviewSessionV4", { label: V4_PREVIEW_LABEL })
        : !isModernSessionEnabled
          ? t("featurePreviewSessionRequires")
          : authSession.data?.environment.enableExperimentalFeatures === true
            ? t("featurePreviewExperimentalEnv")
            : undefined,
      onToggle: onToggle("sessionViewV2Timeline"),
      isToggling: setFeaturePreviewEnabled.isPending,
    },
  };

  return (
    <FeaturePreviewModal
      open={open}
      onOpenChange={onOpenChange}
      state={state}
    />
  );
}
