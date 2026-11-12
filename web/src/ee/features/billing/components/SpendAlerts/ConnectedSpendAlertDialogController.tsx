import { useId, useMemo, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { api, reportNonTrpcError, type RouterOutputs } from "@/src/utils/api";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { Info } from "@langfuse/icons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

// Loose form schema (types only); the translated validation schema is built
// inside SpendAlertDialog with the active locale's messages.
const spendAlertSchema = z.object({
  title: z.string(),
  limit: z.coerce.number(),
});

type SpendAlertFormInput = z.input<typeof spendAlertSchema>;
type SpendAlertFormOutput = z.output<typeof spendAlertSchema>;

type SpendAlertDialogState =
  | { mode: "create" }
  | {
      mode: "edit";
      alert: Pick<
        RouterOutputs["spendAlerts"]["getSpendAlerts"][number],
        "id" | "title" | "threshold"
      >;
    };

export function ConnectedSpendAlertDialogController({
  orgId,
  onSuccess,
  children,
}: {
  orgId: string;
  onSuccess: () => void;
  children: ComponentProps<
    typeof DialogController<SpendAlertDialogState>
  >["children"];
}) {
  const capture = usePostHogClientCapture();
  const createMutation = api.spendAlerts.createSpendAlert.useMutation();
  const updateMutation = api.spendAlerts.updateSpendAlert.useMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const t = useTranslation(enterpriseMessages);

  const onSubmit = async (
    state: SpendAlertDialogState,
    data: SpendAlertFormOutput,
    closeDialog: () => void,
  ) => {
    try {
      if (state.mode === "edit") {
        await updateMutation.mutateAsync({
          orgId,
          id: state.alert.id,
          title: data.title,
          threshold: data.limit,
        });
        capture("spend_alert:updated", {
          orgId,
          alertId: state.alert.id,
          limit: data.limit,
        });
        showSuccessToast({
          operation: "spend_alert.update",
          title: t("spendAlertUpdated"),
          description: "",
        });
      } else {
        await createMutation.mutateAsync({
          orgId,
          title: data.title,
          threshold: data.limit,
        });
        capture("spend_alert:created", {
          orgId,
          limit: data.limit,
        });
        showSuccessToast({
          operation: "spend_alert.create",
          title: t("spendAlertCreated"),
          description: "",
        });
      }
      closeDialog();
      onSuccess();
    } catch (error) {
      reportNonTrpcError(error, "billing");
      showToast({
        type: "ERROR",
        title:
          state.mode === "edit"
            ? t("spendAlertUpdateFailed")
            : t("spendAlertCreateFailed"),
        analytics: classifyTrpcToastError(
          error,
          state.mode === "edit" ? "spend_alert.update" : "spend_alert.create",
        ),
      });
    }
  };

  return (
    <DialogController<SpendAlertDialogState>
      onBeforeClose={() => !isSubmitting}
      renderDialog={({ state, closeDialog }) => (
        <SpendAlertDialog
          state={state}
          isSubmitting={isSubmitting}
          onSubmit={(data) => onSubmit(state, data, closeDialog)}
        />
      )}
    >
      {children}
    </DialogController>
  );
}

function SpendAlertDialog({
  state,
  isSubmitting,
  onSubmit,
}: {
  state: SpendAlertDialogState;
  isSubmitting: boolean;
  onSubmit: (data: SpendAlertFormOutput) => Promise<void>;
}) {
  const formId = useId();
  const t = useTranslation(enterpriseMessages);
  const formSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .min(1, t("spendAlertTitleRequired"))
          .max(100, t("spendAlertTitleTooLong")),
        limit: z.coerce
          .number()
          .positive(t("spendAlertLimitPositive"))
          .max(1000000, t("spendAlertLimitTooHigh")),
      }),
    [t],
  );
  const form = useForm<SpendAlertFormInput, undefined, SpendAlertFormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: state.mode === "edit" ? state.alert.title : "",
      limit:
        state.mode === "edit"
          ? parseFloat(state.alert.threshold.toString())
          : undefined,
    },
  });

  return (
    <Dialog
      size="sm"
      title={
        state.mode === "edit"
          ? t("spendAlertEditTitle")
          : t("spendAlertCreateTitle")
      }
      actions={[
        {
          label:
            state.mode === "edit"
              ? t("spendAlertUpdateAction")
              : t("spendAlertCreateAction"),
          loading: isSubmitting,
          type: "submit",
          form: formId,
        },
      ]}
    >
      <Dialog.Body>
        <p className="text-muted-foreground">{t("spendAlertDescription")}</p>
        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("spendAlertTitleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("spendAlertTitlePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("spendAlertLimitLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max="1000000"
                      placeholder={t("spendAlertLimitPlaceholder")}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      onChange={field.onChange}
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-muted-foreground text-xs">
              <div className="flex flex-row items-center">
                <Info size="sm" __rawClassName="mr-2" />
                <span className="font-bold">{t("spendAlertHowItWorks")}</span>
              </div>
              <ul className="list-disc pl-5">
                <li>{t("spendAlertHowItWorks1")}</li>
                <li>{t("spendAlertHowItWorks2")}</li>
                <li>{t("spendAlertHowItWorks3")}</li>
                <li>{t("spendAlertHowItWorks4")}</li>
              </ul>
            </div>
          </form>
        </Form>
      </Dialog.Body>
    </Dialog>
  );
}
