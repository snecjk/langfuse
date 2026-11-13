/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { CodeMirrorEditor } from "@/src/components/editor/CodeMirrorEditor";
import { api } from "@/src/utils/api";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { getFormattedPayload } from "@/src/features/experiments/utils/format";
import { type Prisma } from "@langfuse/shared";
import { Spinner } from "@/src/components/design-system/Spinner/Spinner";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

const RemoteExperimentTriggerSchema = z.object({
  payload: z.string(),
});

type RemoteExperimentTriggerForm = z.infer<
  typeof RemoteExperimentTriggerSchema
>;

export const RemoteExperimentTriggerModal = ({
  projectId,
  datasetId,
  remoteExperimentConfig,
  setShowTriggerModal,
}: {
  projectId: string;
  datasetId: string;
  remoteExperimentConfig: {
    url: string;
    payload?: Prisma.JsonValue;
  };
  setShowTriggerModal: (show: boolean) => void;
}) => {
  const dataset = api.datasets.byId.useQuery({
    projectId,
    datasetId,
  });
  const t = useTranslation(experimentMessages);

  const form = useForm<RemoteExperimentTriggerForm>({
    resolver: zodResolver(RemoteExperimentTriggerSchema),
    defaultValues: {
      payload: getFormattedPayload(remoteExperimentConfig.payload),
    },
  });

  const runRemoteExperimentMutation =
    api.datasets.triggerRemoteExperiment.useMutation({
      onSuccess: (data) => {
        if (data.success && data.skipped) {
          showErrorToast(
            t("triggerDisabled"),
            t("triggerDisabledHelp"),
            {
              operation: "remote_experiment.trigger",
              errorOrigin: "backend",
              errorCategory: "product_state",
            },
            "WARNING",
          );
        } else if (data.success) {
          showSuccessToast({
            operation: "remote_experiment.trigger",
            title: t("remoteExperimentTriggered"),
            description: t("remoteExperimentTriggeredHelp"),
          });
        } else {
          showErrorToast(
            t("triggerRemoteFailed"),
            data.error || t("triggerRemoteFailedHelp"),
            {
              operation: "remote_experiment.trigger",
              errorOrigin: "backend",
              errorCategory: "internal",
            },
          );
        }
        setShowTriggerModal(false);
      },
    });

  const onSubmit = (data: RemoteExperimentTriggerForm) => {
    if (data.payload.trim()) {
      try {
        JSON.parse(data.payload);
      } catch {
        form.setError("payload", {
          message: t("invalidJson"),
        });
        return;
      }
    }

    runRemoteExperimentMutation.mutate({
      projectId,
      datasetId,
      payload: data.payload,
    });
  };

  return (
    <>
      <DialogHeader>
        <Button
          variant="ghost"
          onClick={() => setShowTriggerModal(false)}
          className="inline-block self-start"
        >
          {t("back")}
        </Button>
        <DialogTitle>{t("runRemoteDatasetRun")}</DialogTitle>
        <DialogDescription>
          {t("sendInfoTo", { url: remoteExperimentConfig.url })}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogBody>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="payload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("config")}</FormLabel>
                    <FormDescription>
                      {t("confirmConfig", {
                        name: dataset.data?.name ?? "",
                      })}
                    </FormDescription>
                    <FormControl>
                      <CodeMirrorEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        editable
                        mode="json"
                        minHeight={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTriggerModal(false)}
                disabled={runRemoteExperimentMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={runRemoteExperimentMutation.isPending}
              >
                {runRemoteExperimentMutation.isPending && (
                  <div className="mr-2">
                    <Spinner size="sm" />
                  </div>
                )}
                {t("run")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
