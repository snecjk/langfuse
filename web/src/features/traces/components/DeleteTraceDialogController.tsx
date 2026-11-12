import { useRouter } from "next/router";
import { type ReactNode, useMemo, useState } from "react";

import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { api } from "@/src/utils/api";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tracingMessages } from "@/src/features/i18n/messages/tracing";

export function DeleteTraceDialogController({
  projectId,
  traceId,
  traceName,
  redirectUrl,
  onAfterDelete,
  children,
}: {
  projectId: string;
  traceId: string;
  traceName?: string | null;
  redirectUrl?: string;
  onAfterDelete?: (deletedTraceId: string) => void;
  children: (control: {
    disabled: { reason: string } | undefined;
    openDialog: () => void;
  }) => ReactNode;
}) {
  const t = useTranslation(tracingMessages);
  const router = useRouter();
  const capture = usePostHogClientCapture();
  const utils = api.useUtils();
  const [isDeleted, setIsDeleted] = useState(false);
  const hasAccess = useHasProjectAccess({ projectId, scope: "traces:delete" });
  const hasEntitlement = useHasEntitlement("trace-deletion");
  const deleteMutation = api.traces.deleteMany.useMutation();

  const disabled = useMemo(() => {
    if (!hasAccess) {
      return { reason: t("noDeletePermission") };
    }
    if (!hasEntitlement) {
      return { reason: t("noDeleteEntitlement") };
    }
    return undefined;
  }, [hasAccess, hasEntitlement, t]);

  return (
    <ConfirmationDialogController<{
      projectId: string;
      traceId: string;
      traceName?: string | null;
      redirectUrl?: string;
      onAfterDelete?: (deletedTraceId: string) => void;
    }>
      title={(target) =>
        t("traceDeleteConfirmTitle", {
          traceName: target.traceName || target.traceId,
        })
      }
      text={t("traceDeleteConfirmText")}
      confirmationText={(target) => target.traceName || ""}
      confirmLabel={t("deleteTrace")}
      variant="destructive"
      loading={deleteMutation.isPending || isDeleted}
      error={deleteMutation.error?.message}
      onConfirm={async (target) => {
        await deleteMutation.mutateAsync({
          traceIds: [target.traceId],
          projectId: target.projectId,
        });
        setIsDeleted(true);
        showSuccessToast({
          operation: "trace.delete",
          title: t("traceDeletedTitle"),
          description: t("traceDeletedDesc"),
        });
        capture("trace:delete", { source: "trace" });
        if (target.redirectUrl) {
          router.push(target.redirectUrl).catch(() => undefined);
          return;
        }
        utils.invalidate();
        target.onAfterDelete?.(target.traceId);
      }}
    >
      {({ openDialog }) =>
        children({
          disabled,
          openDialog: () => {
            capture("trace:delete_form_open", { source: "trace detail" });
            setIsDeleted(false);
            deleteMutation.reset();
            openDialog({
              projectId,
              traceId,
              traceName,
              redirectUrl,
              onAfterDelete,
            });
          },
        })
      }
    </ConfirmationDialogController>
  );
}
