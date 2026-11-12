import { useSession } from "next-auth/react";
import { type ReactNode } from "react";

import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tracingMessages } from "@/src/features/i18n/messages/tracing";
import { JSONView } from "@/src/components/ui/CodeJsonViewer";
import { api } from "@/src/utils/api";

type TraceTranscriptSource = {
  projectId: string;
  traceId: string;
  timestamp: Date;
};

export function TraceTranscriptDialogController({
  children,
  ...source
}: TraceTranscriptSource & {
  children: (control: { openDialog: (() => void) | undefined }) => ReactNode;
}) {
  const t = useTranslation(tracingMessages);
  const { data: session } = useSession();
  if (session?.user?.admin !== true) {
    return children({ openDialog: undefined });
  }

  return (
    <DialogController<TraceTranscriptSource>
      renderDialog={({ state }) => (
        <Dialog
          title={t("traceTranscriptDialogTitle")}
          size="lg"
          closeOnInteractionOutside
        >
          <Dialog.Body>
            <div className="ph-no-capture flex flex-col gap-4">
              <TraceTranscriptInspector source={state} />
            </div>
          </Dialog.Body>
        </Dialog>
      )}
    >
      {({ openDialog }) => children({ openDialog: () => openDialog(source) })}
    </DialogController>
  );
}

function TraceTranscriptInspector({
  source,
}: {
  source: TraceTranscriptSource;
}) {
  const t = useTranslation(tracingMessages);
  const query = api.events.transcriptByTraceId.useQuery({
    ...source,
    context: "other",
  });

  if (query.error) {
    return (
      <Alert variant="destructive" size="sm">
        <Alert.Description>
          <p className="break-words">{query.error.message}</p>
        </Alert.Description>
      </Alert>
    );
  }
  if (!query.data) return <p className="text-xs">{t("loadingTranscript")}</p>;

  return (
    <>
      {query.data.cutoff && (
        <Alert variant="warning" size="sm">
          <Alert.Description>{t("transcriptIncomplete")}</Alert.Description>
        </Alert>
      )}
      {query.data.transcript ? (
        <JSONView
          title="Transcript"
          json={query.data.transcript}
          preserveStrings
        />
      ) : (
        <p className="text-muted-foreground text-xs">
          {t("noTranscriptAvailable")}
        </p>
      )}
    </>
  );
}
