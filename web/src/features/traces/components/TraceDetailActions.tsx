import { Download, FileText, MoreVertical, TrashIcon } from "@langfuse/icons";
import type { EntityDetailHeaderAction } from "@/src/components/ObservabilityEntityDetailHeader/ObservabilityEntityDetailHeader";
import type { DropdownMenuItemDefinition } from "@/src/components/design-system/DropdownMenu/DropdownMenu";
import { useShareMenuItems } from "@/src/components/useShareMenuItems";
import { FeatureReleaseStatus } from "@/src/components/design-system/FeatureReleaseStatus/FeatureReleaseStatus";
import { ConnectedDetailHeaderActionsMenuController } from "@/src/features/traces/components/DetailHeaderActionsMenuController";
import { DeleteTraceDialogController } from "@/src/features/traces/components/DeleteTraceDialogController";
import { TraceTranscriptDialogController } from "@/src/features/traces/components/TraceTranscriptDialogController";
import { useDownloadTraceAsJson } from "@/src/features/traces/hooks/useDownloadTraceAsJson";
import { type useTraceDetailData } from "@/src/features/traces/hooks/useTraceDetailData";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tracingMessages } from "@/src/features/i18n/messages/tracing";

type TraceDetailData = NonNullable<
  ReturnType<typeof useTraceDetailData>["data"]
>;

type TraceDetailActionsProps = {
  trace: TraceDetailData | undefined;
  traceContext: "fullscreen" | "peek";
  shareUrl?: string;
  timestamp?: Date;
  deleteRedirectUrl?: string;
  onAfterDelete?: (deletedTraceId: string) => void;
  isPlaceholderData?: boolean;
  children: (actions: readonly EntityDetailHeaderAction[]) => React.ReactNode;
};

/** Owns trace workflows; the shared header renders their action definitions. */
export function TraceDetailActions({
  trace,
  children,
  ...props
}: TraceDetailActionsProps) {
  const t = useTranslation(tracingMessages);
  if (!trace)
    return children([
      {
        id: "download-json",
        type: "button",
        label: t("downloadJson"),
        icon: Download,
        iconOnly: true,
        disabled: true,
        onClick: () => {},
      },
      {
        id: "trace-options",
        type: "dropdown",
        label: t("moreActions"),
        icon: MoreVertical,
        iconOnly: true,
        placement: "trailing",
        disabled: true,
        items: [],
      },
    ]);
  return (
    <TraceTranscriptDialogController
      projectId={trace.projectId}
      traceId={trace.id}
      timestamp={trace.timestamp}
    >
      {({ openDialog }) => (
        <LoadedTraceDetailActions
          trace={trace}
          {...props}
          onShowTranscript={openDialog}
        >
          {children}
        </LoadedTraceDetailActions>
      )}
    </TraceTranscriptDialogController>
  );
}

function LoadedTraceDetailActions({
  trace,
  traceContext,
  shareUrl,
  timestamp,
  deleteRedirectUrl,
  onAfterDelete,
  isPlaceholderData,
  onShowTranscript,
  children,
}: Omit<TraceDetailActionsProps, "trace"> & {
  trace: TraceDetailData;
  onShowTranscript?: () => void;
}) {
  const t = useTranslation(tracingMessages);
  const shareItems = useShareMenuItems({
    kind: "trace",
    projectId: trace.projectId,
    objectId: trace.id,
    isPublic: trace.public,
    shareUrl,
    timestamp,
  });
  const [handleDownload, isDownloading] = useDownloadTraceAsJson({
    trace,
    observations: trace.observations,
    traceContext,
  });
  return (
    <DeleteTraceDialogController
      projectId={trace.projectId}
      traceId={trace.id}
      traceName={trace.name}
      redirectUrl={deleteRedirectUrl}
      onAfterDelete={onAfterDelete}
    >
      {({ disabled: deleteDisabled, openDialog: openDeleteDialog }) => (
        <ConnectedDetailHeaderActionsMenuController
          idItems={[
            { id: trace.id, name: t("traceId") },
            ...(trace.name ? [{ id: trace.name, name: t("traceName") }] : []),
          ]}
          projectId={trace.projectId}
          renderMenu={(copyItems) => {
            const items: DropdownMenuItemDefinition[] = [
              ...shareItems,
              ...copyItems,
              ...(onShowTranscript
                ? [
                    {
                      type: "item" as const,
                      id: "show-trace-transcript",
                      title: t("showTraceTranscript"),
                      icon: FileText,
                      badge: <FeatureReleaseStatus status="internal" />,
                      onClick: onShowTranscript,
                    },
                  ]
                : []),
              { id: "delete-separator", type: "separator" },
              {
                type: "item",
                id: "delete",
                title: t("deleteTrace"),
                icon: TrashIcon,
                variant: "destructive",
                disabled: deleteDisabled,
                onClick: openDeleteDialog,
              },
            ];
            return children([
              {
                id: "download-json",
                type: "button",
                label: t("downloadJson"),
                icon: Download,
                isLoading: isDownloading,
                iconOnly: true,
                disabled: isDownloading || isPlaceholderData,
                onClick: () => {
                  handleDownload();
                },
              },
              {
                id: JSON.stringify([
                  "trace-options",
                  trace.id,
                  isPlaceholderData,
                ]),
                type: "dropdown",
                label: t("moreActions"),
                icon: MoreVertical,
                iconOnly: true,
                placement: "trailing",
                disabled: isPlaceholderData,
                items,
              },
            ]);
          }}
        />
      )}
    </DeleteTraceDialogController>
  );
}
