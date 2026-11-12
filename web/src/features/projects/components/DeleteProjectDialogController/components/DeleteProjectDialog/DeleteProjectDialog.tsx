import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "@langfuse/icons";
import { useId } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";

type DeleteProjectForm = {
  name: string;
};

export type DeleteProjectDialogProps = {
  confirmMessage: string;
  isPending: boolean;
  onSubmit: () => void;
  /** Set when the project receives this organization's AI Gateway traces. */
  gatewayOrganizationName?: string;
};

export function DeleteProjectDialog(props: DeleteProjectDialogProps) {
  const t = useTranslation(settingsMessages);
  const formId = useId();
  const formSchema = z.object({
    name: z.string().includes(props.confirmMessage, {
      message: `Please confirm with "${props.confirmMessage}"`,
    }),
  });

  const form = useForm<DeleteProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Dialog
      title={t("deleteProject")}
      closeLabel={t("cancel")}
      actions={[
        {
          label: t("deleteProjectAction"),
          type: "submit",
          form: formId,
          variant: "destructive",
          loading: props.isPending,
        },
      ]}
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(props.onSubmit)}>
          <Dialog.Body>
            {props.gatewayOrganizationName ? (
              <Alert variant="warning" icon={AlertTriangle}>
                <Alert.Title>{t("gatewayDisabled")}</Alert.Title>
                <Alert.Description>
                  {t("gatewayDeleteWarning", {
                    organization: props.gatewayOrganizationName,
                  })}
                </Alert.Description>
              </Alert>
            ) : null}
            <p>{t("deletionTimeHelp")}</p>
            <p>{t("confirmInput", { value: props.confirmMessage })}</p>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={props.confirmMessage} {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name
                      ? t("confirmValue", { value: props.confirmMessage })
                      : undefined}
                  </FormMessage>
                </FormItem>
              )}
            />
          </Dialog.Body>
        </form>
      </Form>
    </Dialog>
  );
}
