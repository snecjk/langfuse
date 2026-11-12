import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { accountMessages } from "@/src/features/i18n/messages/account";

export type DeleteOrganizationDialogProps = {
  confirmMessage: string;
  hasProjects: boolean;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
};

export function DeleteOrganizationDialog({
  confirmMessage,
  hasProjects,
  isPending,
  onConfirm,
}: DeleteOrganizationDialogProps) {
  const t = useTranslation(accountMessages);
  const formId = useId();
  const formSchema = z.object({
    name: z.string().includes(confirmMessage, {
      message: `Please confirm with "${confirmMessage}"`,
    }),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = () => {
    if (hasProjects) return;
    return onConfirm();
  };

  return (
    <Dialog
      title={t("deleteOrganizationDialogTitle")}
      actions={[
        {
          label: t("deleteOrganizationDialogLabel"),
          type: "submit",
          form: formId,
          variant: "destructive",
          loading: isPending,
          disabled: hasProjects,
        },
      ]}
    >
      {hasProjects ? (
        <Dialog.Body>
          <p>{t("deleteOrgHasProjectsHelp")}</p>
        </Dialog.Body>
      ) : (
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Dialog.Body>
              <p>{t("confirmInput", { value: confirmMessage })}</p>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={confirmMessage} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name
                        ? t("confirmValue", { value: confirmMessage })
                        : undefined}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </Dialog.Body>
          </form>
        </Form>
      )}
    </Dialog>
  );
}
