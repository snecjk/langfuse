/* eslint-disable @repo/no-abstracted-overlay-trigger, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Button } from "@/src/components/ui/button";
import { ConnectedVerifiedDomainsSettingsTable } from "./VerifiedDomainsSettingsTable/ConnectedVerifiedDomainsSettingsTable";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import Header from "@/src/components/layouts/header";
import { useHasEntitlement } from "@/src/features/entitlements/hooks";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { api } from "@/src/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "@langfuse/icons";
import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

const addDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(3)
    .max(253)
    .transform((v) => v.toLowerCase())
    .refine((v) =>
      /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(
        v,
      ),
    ),
});

type AddDomainInput = z.infer<typeof addDomainSchema>;

export const VerifiedDomainsSettings = ({ orgId }: { orgId: string }) => {
  const hasEntitlement = useHasEntitlement("cloud-multi-tenant-sso");
  const hasAccess = useHasOrganizationAccess({
    organizationId: orgId,
    scope: "organization:update",
  });
  const t = useTranslation(enterpriseMessages);

  const domainSchema = useMemo(
    () =>
      addDomainSchema.refine((value) => Boolean(value.domain), {
        message: t("verifiedDomainRequired"),
      }),
    [t],
  );

  const heading = (
    <>
      <Header title={t("verifiedDomainsTitle")} />
      <p className="text-muted-foreground mb-4 text-sm">
        {t("verifiedDomainsDescription")}
      </p>
    </>
  );

  if (!hasEntitlement) {
    return (
      <div>
        {heading}
        <Alert icon={AlertCircle}>
          <Alert.Title>{t("notAvailable")}</Alert.Title>
          <Alert.Description>{t("notAvailableDomainsPlan")}</Alert.Description>
        </Alert>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        {heading}
        <Alert>
          <Alert.Title>{t("accessDenied")}</Alert.Title>
          <Alert.Description>{t("noPermissionDomains")}</Alert.Description>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title={t("verifiedDomainsTitle")}
        actionButtons={
          <AddDomainButton orgId={orgId} domainSchema={domainSchema} />
        }
      />
      <p className="text-muted-foreground text-sm">
        {t("verifiedDomainsDescription")}
      </p>
      <ConnectedVerifiedDomainsSettingsTable orgId={orgId} />
    </div>
  );
};

function AddDomainButton({
  orgId,
  domainSchema,
}: {
  orgId: string;
  domainSchema: typeof addDomainSchema;
}) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const t = useTranslation(enterpriseMessages);

  const form = useForm<AddDomainInput>({
    resolver: zodResolver(domainSchema) as Resolver<AddDomainInput>,
    defaultValues: { domain: "" },
  });

  const createMutation = api.verifiedDomain.create.useMutation({
    onSuccess: () => {
      utils.verifiedDomain.list.invalidate({ orgId });
      showSuccessToast({
        operation: "verified_domain.add",
        title: t("verifiedDomainAdded"),
        description: t("verifiedDomainAddedDescription"),
      });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      form.setError("domain", { message: err.message });
    },
  });

  function onSubmit(values: AddDomainInput) {
    createMutation.mutate({ orgId, domain: values.domain });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("verifiedDomainAddButton")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("verifiedDomainAddTitle")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("verifiedDomainLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("verifiedDomainPlaceholder")}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                {t("retryMigrationCancel")}
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {t("verifiedDomainAddButton")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
