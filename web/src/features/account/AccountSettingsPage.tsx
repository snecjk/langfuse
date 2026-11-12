/* eslint-disable @repo/no-abstracted-overlay-trigger, @typescript-eslint/no-deprecated, @typescript-eslint/no-use-before-define -- Legacy UI usage retained during migration to design-system components. */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { settingsMessages } from "@/src/features/i18n/messages/settings";
import Header from "@/src/components/layouts/header";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { api, reportNonTrpcError } from "@/src/utils/api";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { useSession } from "next-auth/react";
import { signOutCleanly } from "@/src/features/auth/lib/signOut";
import { SettingsDangerZone } from "@/src/components/SettingsDangerZone";
import { StringNoHTML } from "@langfuse/shared";
import Link from "next/link";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";

const displayNameSchema = z.object({
  name: StringNoHTML.min(1, "Name cannot be empty").max(
    100,
    "Name must be at most 100 characters",
  ),
});

function UpdateDisplayName() {
  const t = useTranslation(settingsMessages);
  const localizeNameError = (message: string | undefined) => {
    if (message === "Name cannot be empty") return t("nameEmpty");
    if (message === "Name must be at most 100 characters")
      return t("nameTooLong");
    return message;
  };
  const { data: session, update: updateSession } = useSession();
  const utils = api.useUtils();

  const form = useForm({
    resolver: zodResolver(displayNameSchema),
    defaultValues: {
      name: "",
    },
  });

  const updateDisplayName = api.userAccount.updateDisplayName.useMutation({
    onSuccess: async () => {
      await updateSession();
      await utils.invalidate();
      form.reset();
      showSuccessToast({
        operation: "account.display_name_update",
        title: t("displayNameUpdated"),
        description: t("displayNameUpdatedHelp"),
      });
    },
    onError: (error) => form.setError("name", { message: error.message }),
  });

  function onSubmit(values: z.infer<typeof displayNameSchema>) {
    updateDisplayName.mutate({ name: values.name });
  }

  return (
    <div>
      <Header title={t("displayName")} />
      <Card className="p-3">
        {form.getValues().name !== "" ? (
          <p className="text-primary mb-4 text-sm">
            {t("displayNameChanging", {
              from: session?.user?.name ?? "",
              to: form.watch().name ?? "",
            })}
          </p>
        ) : (
          <p className="text-primary mb-4 text-sm">
            {t("displayNameCurrent", { name: session?.user?.name ?? "" })}
          </p>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={session?.user?.name ?? ""}
                      {...field}
                      className="flex-1"
                    />
                  </FormControl>
                  <FormMessage>
                    {localizeNameError(form.formState.errors.name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button
              variant="secondary"
              type="submit"
              loading={updateDisplayName.isPending}
              disabled={form.getValues().name === ""}
              className="mt-4"
            >
              Save
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}

function DeleteAccountButton() {
  const t = useTranslation(settingsMessages);
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const { data: canDeleteData } = api.userAccount.checkCanDelete.useQuery();
  const deleteAccount = api.userAccount.delete.useMutation();

  const formSchema = z.object({
    email: z.string().refine((val) => val === userEmail, {
      message: `Please enter your email address: ${userEmail}`,
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const canDelete = canDeleteData?.canDelete ?? false;
  const blockingOrganizations = canDeleteData?.blockingOrganizations ?? [];

  const onSubmit = async () => {
    if (!canDelete) return;
    try {
      await deleteAccount.mutateAsync();
      showSuccessToast({
        operation: "account.delete",
        title: t("accountDeleted"),
        description: t("accountDeletedHelp"),
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await signOutCleanly();
    } catch (error) {
      reportNonTrpcError(error, "account");
      showErrorToast(
        t("failedDeleteAccount"),
        error instanceof Error ? error.message : t("unexpectedError"),
        classifyTrpcToastError(error, "account.delete"),
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive-secondary">{t("deleteAccount")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("deleteAccount")}
          </DialogTitle>
          <DialogDescription>
            {!canDelete && blockingOrganizations.length > 0 ? (
              <div>
                <p className="mb-2">{t("deleteAccountBlocked")}</p>
                <ul className="list-inside list-disc space-y-1">
                  {blockingOrganizations.map((org) => (
                    <li key={org.id}>
                      <Link
                        href={`/organization/${org.id}/settings`}
                        className="text-primary hover:text-primary/80 font-bold underline"
                      >
                        {org.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-2">{t("deleteAccountBlockedHelp")}</p>
              </div>
            ) : (
              t("confirmEmailInput", { email: userEmail })
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {canDelete && (
              <DialogBody>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={userEmail} {...field} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.email
                          ? t("confirmEmail", { email: userEmail })
                          : undefined}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </DialogBody>
            )}
            <DialogFooter>
              <Button
                type="submit"
                variant="destructive"
                loading={deleteAccount.isPending}
                disabled={!canDelete}
                className="w-full"
              >
                {t("deleteAccount")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SignOutAllSessionsButton() {
  const t = useTranslation(settingsMessages);
  const signOutAllSessions = api.userAccount.signOutAllSessions.useMutation();

  const onConfirm = async () => {
    try {
      await signOutAllSessions.mutateAsync();
      showSuccessToast({
        operation: "account.revoke_sessions",
        title: t("allSessionsSignedOut"),
        description: t("allSessionsInvalidated"),
      });
    } catch (error) {
      reportNonTrpcError(error, "account");
      showErrorToast(
        t("signOutAllFailed"),
        error instanceof Error ? error.message : t("unexpectedError"),
        classifyTrpcToastError(error, "account.revoke_sessions"),
      );
      throw error;
    }

    // Sessions are already revoked server-side at this point, so a failure to
    // clear local state must not be reported as a failed revocation.
    try {
      await signOutCleanly();
    } catch (error) {
      reportNonTrpcError(error, "account");
    }
  };

  return (
    <ConfirmationDialogController
      title={t("signOutAll")}
      text={t("signOutAllConfirm")}
      confirmLabel={t("signOutAll")}
      variant="destructive"
      loading={signOutAllSessions.isPending}
      onConfirm={onConfirm}
    >
      {({ openDialog }) => (
        <Button variant="destructive-secondary" onClick={openDialog}>
          {t("signOutAll")}
        </Button>
      )}
    </ConfirmationDialogController>
  );
}

type AccountSettingsPage = {
  title: string;
  slug: string;
  show?: boolean | (() => boolean);
  cmdKKeywords?: string[];
} & ({ content: React.ReactNode } | { href: string });

export function useAccountSettingsPages(): AccountSettingsPage[] {
  const t = useTranslation(settingsMessages);
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  return getAccountSettingsPages({ userEmail, t });
}

const getAccountSettingsPages = ({
  userEmail,
  t,
}: {
  userEmail: string;
  t: (
    key: keyof typeof settingsMessages.en,
    parameters?: Record<string, string | number>,
  ) => string;
}): AccountSettingsPage[] => [
  {
    title: t("general"),
    slug: "index",
    cmdKKeywords: [
      "account",
      "user",
      "profile",
      "email",
      "password",
      "name",
      "display",
      "delete",
      "remove",
    ],
    content: (
      <div className="flex flex-col gap-6">
        <div>
          <Header title={t("email")} />
          <Card className="p-3">
            <p className="text-primary text-sm">
              {t("emailAddress")}
              <b>{userEmail}</b>
            </p>
          </Card>
        </div>
        <UpdateDisplayName />
        <div>
          <Header title={t("password")} />
          <Card className="p-3">
            <p className="text-primary mb-4 text-sm">{t("passwordHelp")}</p>
            <Button asChild variant="secondary">
              <Link href="/auth/reset-password">{t("changePassword")}</Link>
            </Button>
          </Card>
        </div>
        <SettingsDangerZone
          items={[
            {
              title: t("signOutSessionsTitle"),
              description: t("signOutSessionsHelp"),
              button: <SignOutAllSessionsButton />,
            },
            {
              title: t("deleteYourAccount"),
              description: t("deleteAccountHelp"),
              button: <DeleteAccountButton />,
            },
          ]}
        />
      </div>
    ),
  },
];
