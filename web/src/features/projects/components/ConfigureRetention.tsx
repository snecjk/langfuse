/* eslint-disable no-nested-ternary */
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { api, reportTrpcErrorWithoutToast } from "@/src/utils/api";
import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import Header from "@/src/components/layouts/header";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { LockIcon } from "@langfuse/icons";
import { useQueryProject } from "@/src/features/projects/hooks";
import { useSession } from "next-auth/react";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { projectRetentionSchema } from "@/src/features/auth/lib/projectRetentionSchema";
import { ActionButton } from "@/src/components/ActionButton";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { accountMessages } from "@/src/features/i18n/messages/account";

export default function ConfigureRetention() {
  const t = useTranslation(accountMessages);
  const { update: updateSession } = useSession();
  const utils = api.useUtils();
  const { project } = useQueryProject();
  const capture = usePostHogClientCapture();
  const hasAccess = useHasProjectAccess({
    projectId: project?.id,
    scope: "project:update",
  });
  const hasEntitlement = useHasEntitlement("data-retention");

  const form = useForm({
    resolver: zodResolver(projectRetentionSchema),
    defaultValues: {
      retention: project?.retentionDays ?? 0,
    },
  });
  const setRetention = api.projects.setRetention.useMutation({
    onSuccess: (_) => {
      updateSession();
      // Admins resolve org/project context from these queries, not the session
      utils.organizations.byId.invalidate();
      utils.projects.byId.invalidate();
    },
    onError: (error) => form.setError("retention", { message: error.message }),
  });

  function onSubmit(values: z.infer<typeof projectRetentionSchema>) {
    if (!hasAccess || !project) return;
    capture("project_settings:retention_form_submit");
    setRetention
      .mutateAsync({
        projectId: project.id,
        retention: values.retention || null, // Fallback to null for indefinite retention
      })
      .then(() => {
        form.reset();
      })
      .catch((error) => reportTrpcErrorWithoutToast(error, "projects"));
  }

  const currentRetentionLabel =
    project?.retentionDays === null || project?.retentionDays === undefined
      ? t("indefiniteRetention")
      : `${project.retentionDays}`;
  const nextRetentionLabel =
    Number(form.watch("retention")) === 0
      ? t("indefiniteRetention")
      : `${Number(form.watch("retention"))}`;

  return (
    <div>
      <Header title={t("dataRetention")} />
      <Card className="mb-4 p-3">
        <p className="text-primary mb-4 text-sm">{t("dataRetentionHelp")}</p>
        {Boolean(form.getValues().retention) &&
        form.getValues().retention !== project?.retentionDays ? (
          <p className="text-primary mb-4 text-sm">
            {t("retentionWillChange", {
              from: currentRetentionLabel,
              to: nextRetentionLabel,
            })}
          </p>
        ) : !Boolean(project?.retentionDays) ? (
          <p className="text-primary mb-4 text-sm">
            {t("retainsDataIndefinitely")}
          </p>
        ) : (
          <p className="text-primary mb-4 text-sm">
            {t("currentRetentionDays", { n: currentRetentionLabel })}
          </p>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1"
            id="set-retention-project-form"
          >
            <FormField
              control={form.control}
              name="retention"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1"
                        placeholder={project?.retentionDays?.toString() ?? ""}
                        {...field}
                        value={(field.value as number) ?? ""}
                        className="flex-1"
                        disabled={!hasAccess || !hasEntitlement}
                      />
                      {!hasAccess && (
                        <span title={t("noAccess")}>
                          <LockIcon
                            size="base"
                            __rawClassName="text-muted absolute top-1/2 right-3 -translate-y-1/2 transform"
                          />
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4">
              <ActionButton
                variant="secondary"
                hasAccess={hasAccess}
                hasEntitlement={hasEntitlement}
                loading={setRetention.isPending}
                disabled={form.getValues().retention === null}
                type="submit"
              >
                {t("save")}
              </ActionButton>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
