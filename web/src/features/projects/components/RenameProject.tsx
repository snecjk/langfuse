import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
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
import { projectNameSchema } from "@/src/features/auth/lib/projectNameSchema";
import Header from "@/src/components/layouts/header";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { LockIcon } from "@langfuse/icons";
import { useQueryProject } from "@/src/features/projects/hooks";
import { useSession } from "next-auth/react";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";

export default function RenameProject() {
  const t = useTranslation(settingsMessages);
  const localizeNameError = (message: string | undefined) => {
    if (message === "Must have at least 3 characters")
      return t("projectNameShort");
    if (message === "Must have at most 60 characters")
      return t("projectNameLong");
    return message;
  };
  const { update: updateSession } = useSession();
  const utils = api.useUtils();
  const { project } = useQueryProject();
  const capture = usePostHogClientCapture();
  const hasAccess = useHasProjectAccess({
    projectId: project?.id,
    scope: "project:update",
  });

  const form = useForm({
    resolver: zodResolver(projectNameSchema),
    defaultValues: {
      name: "",
    },
  });
  const renameProject = api.projects.update.useMutation({
    onSuccess: (_) => {
      updateSession();
      // Admins resolve org/project context from these queries, not the session
      utils.organizations.byId.invalidate();
      utils.projects.byId.invalidate();
    },
    onError: (error) => form.setError("name", { message: error.message }),
  });

  function onSubmit(values: z.infer<typeof projectNameSchema>) {
    if (!hasAccess || !project) return;
    capture("project_settings:rename_form_submit");
    renameProject
      .mutateAsync({
        projectId: project.id,
        newName: values.name,
      })
      .then(() => {
        form.reset();
      })
      .catch((error) => reportTrpcErrorWithoutToast(error, "projects"));
  }

  return (
    <div>
      <Header title={t("projectName")} />
      <Card className="mb-4 p-3">
        {form.getValues().name !== "" ? (
          <p className="text-primary mb-4 text-sm">
            {t("renamingProject", {
              from: project?.name ?? "",
              to: form.watch().name ?? "",
            })}
          </p>
        ) : (
          <p className="text-primary mb-4 text-sm">
            {t("currentProjectName", { name: project?.name ?? "" })}
          </p>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1"
            id="rename-project-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={project?.name ?? ""}
                        {...field}
                        className="flex-1"
                        disabled={!hasAccess}
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
                  <FormMessage>
                    {localizeNameError(form.formState.errors.name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
            {hasAccess && (
              <Button
                variant="secondary"
                type="submit"
                loading={renameProject.isPending}
                disabled={form.getValues().name === "" || !hasAccess}
                className="mt-4"
              >
                {t("save")}
              </Button>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
}
