/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import Header from "@/src/components/layouts/header";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { AutomationForm } from "@/src/features/automations/components/AutomationForm";
import { WebhookSecretRender } from "@/src/features/automations/components/WebhookSecretRender";
import { ProjectNotificationChannelsList } from "@/src/features/notifications/components/ProjectNotificationChannelsList";
import { useProjectNotificationChannels } from "@/src/features/notifications/hooks/useProjectNotificationChannels";
import { cn } from "@/src/utils/tailwind";
import {
  ProjectNotificationEventTypeSchema,
  TriggerEventSource,
  type ActionTypes,
  type ProjectNotificationEventType,
} from "@langfuse/shared";

import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { notificationMessages } from "@/src/features/i18n/messages/notifications";

/** Maps each notification event type to its translated title and description keys. */
const NOTIFICATION_EVENT_TITLE_KEYS = {
  "blob-export-failed": "notificationChannelsBlobExportFailedTitle",
  "posthog-export-failed": "notificationChannelsPosthogExportFailedTitle",
  "evaluator-blocked": "notificationChannelsEvaluatorBlockedTitle",
} as const;

const NOTIFICATION_EVENT_DESCRIPTION_KEYS = {
  "blob-export-failed": "notificationChannelsBlobExportFailedDescription",
  "posthog-export-failed": "notificationChannelsPosthogExportFailedDescription",
  "evaluator-blocked": "notificationChannelsEvaluatorBlockedDescription",
} as const;

/** Project notifications route to webhooks, Slack or PagerDuty; GitHub dispatch is not wired for this event source. */
const PROJECT_NOTIFICATION_ACTION_TYPES: ActionTypes[] = [
  "WEBHOOK",
  "SLACK",
  "PAGERDUTY",
];

const NOTIFIED_EVENT_COPY: Record<
  ProjectNotificationEventType,
  { title: string; description: string }
> = {
  "blob-export-failed": {
    title: "Blob storage export failed",
    description: "Sent when a scheduled blob storage export fails.",
  },
  "posthog-export-failed": {
    title: "PostHog export failed",
    description:
      "Sent when a PostHog export is disabled after a configuration error, such as an unreachable host.",
  },
  "evaluator-blocked": {
    title: "Evaluator deactivated",
    description:
      "Sent when an evaluator is deactivated due to an unrecoverable error, such as a deleted model or LLM connection.",
  },
};

/** NOTIFIED_EVENTS lists the toggleable project-notification events, in schema order. */
export const NOTIFIED_EVENTS = ProjectNotificationEventTypeSchema.options.map(
  (value) => ({ value, ...NOTIFIED_EVENT_COPY[value] }),
);

/**
 * ProjectNotificationChannels is the admin-only "Project Notifications"
 * settings section. It lists configured channels and delegates create/edit to
 * the shared <AutomationForm> scoped to the project-notification event source.
 */
export function ProjectNotificationChannels({
  projectId,
}: {
  projectId: string;
}) {
  const t = useTranslation(notificationMessages);
  const {
    channels,
    isLoading,
    mode,
    editingChannel,
    webhookSecret,
    isDeleting,
    isTogglingEvent,
    isEventEnabled,
    actions,
  } = useProjectNotificationChannels(projectId);

  const hasChannels = Boolean(channels?.length);

  return (
    <div>
      <Header title={t("notificationChannelsTitle")} />
      <p className="text-muted-foreground mb-4 text-sm">
        {t("notificationChannelsDescription")}
      </p>

      {mode === "list" ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <ProjectNotificationChannelsList
              channels={channels}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onAdd={actions.openCreate}
              onEdit={actions.openEdit}
              onDelete={actions.deleteChannel}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold">
                {t("notificationChannelsEvents")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {hasChannels
                  ? t("notificationChannelsEventsDescription")
                  : t("notificationChannelsEventsDescriptionEmpty")}
              </p>
            </div>
            {NOTIFIED_EVENTS.map((event) => (
              <div
                key={event.value}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div
                  className={cn(
                    "flex flex-col gap-0.5",
                    !hasChannels && "opacity-50",
                  )}
                >
                  <p className="text-base font-bold">
                    {t(NOTIFICATION_EVENT_TITLE_KEYS[event.value])}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t(NOTIFICATION_EVENT_DESCRIPTION_KEYS[event.value])}
                  </p>
                </div>
                <Switch
                  checked={isEventEnabled(event.value)}
                  onCheckedChange={(checked) =>
                    actions.setEventEnabled(event.value, checked)
                  }
                  disabled={!hasChannels || isTogglingEvent}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <AutomationForm
          key={editingChannel?.id ?? "create"}
          projectId={projectId}
          isEditing
          lockedEventSource={TriggerEventSource.ProjectNotification}
          allowedActionTypes={PROJECT_NOTIFICATION_ACTION_TYPES}
          automation={editingChannel ?? undefined}
          onSuccess={actions.onFormSuccess}
          onCancel={actions.closeForm}
        />
      )}

      {/* One-time webhook secret reveal after creating a webhook channel. */}
      <Dialog
        open={Boolean(webhookSecret)}
        onOpenChange={(open) => {
          if (!open) actions.dismissWebhookSecret();
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("notificationChannelsWebhookSecretTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("notificationChannelsWebhookSecretDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {webhookSecret && (
              <WebhookSecretRender webhookSecret={webhookSecret} />
            )}
          </DialogBody>
          <DialogFooter>
            <Button onClick={actions.dismissWebhookSecret}>
              {t("notificationChannelsWebhookSecretConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
