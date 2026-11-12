import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { TriangleAlert } from "@langfuse/icons";
import { useId } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

type TransferProjectDialogOrganization = {
  id: string;
  name: string;
};

export interface TransferProjectDialogProps {
  projectName: string;
  organizationName: string;
  organizations: TransferProjectDialogOrganization[];
  isPending: boolean;
  onConfirm: (organizationId: string) => void;
}

export function TransferProjectDialog({
  projectName,
  organizationName,
  organizations,
  isPending,
  onConfirm,
}: TransferProjectDialogProps) {
  const t = useTranslation(settingsMessages);
  const formId = useId();
  const confirmMessage = `${organizationName}/${projectName}`
    .replaceAll(" ", "-")
    .toLowerCase();
  const formSchema = z.object({
    name: z.string().includes(confirmMessage, {
      message: `Please confirm with "${confirmMessage}"`,
    }),
    organizationId: z.string().min(1, {
      message: "Please select an organization",
    }),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organizationId: "",
    },
  });

  return (
    <Dialog
      title={t("transferProject")}
      closeLabel={t("cancel")}
      actions={[
        {
          label: t("transferProjectAction"),
          type: "submit",
          form: formId,
          variant: "destructive",
          loading: isPending,
          disabled: organizations.length === 0,
        },
      ]}
    >
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(({ organizationId }) =>
            onConfirm(organizationId),
          )}
        >
          <Dialog.Body>
            <Alert variant="warning" icon={TriangleAlert}>
              <Alert.Title>{t("transferWarning")}</Alert.Title>
              <Alert.Description>
                {t("transferWarningHelp")}
                <ul className="list-disc pl-4">
                  <li>{t("transferMembersWarning")}</li>
                  <li>{t("transferUnchanged")}</li>
                </ul>
              </Alert.Description>
            </Alert>
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("selectNewOrganization")}</FormLabel>
                  <FormControl>
                    <SelectInput
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                      placeholder={t("selectOrganization")}
                      emptyMessage={t("noEligibleOrganizations")}
                      options={organizations.map((organization) => ({
                        value: organization.id,
                        label: organization.name,
                      }))}
                    />
                  </FormControl>
                  <FormDescription>{t("transferHelp")}</FormDescription>
                  <FormMessage>
                    {form.formState.errors.organizationId
                      ? t("selectOrganizationError")
                      : undefined}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirm")}</FormLabel>
                  <FormControl>
                    <Input placeholder={confirmMessage} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("confirmInput", { value: confirmMessage })}
                  </FormDescription>
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
    </Dialog>
  );
}
