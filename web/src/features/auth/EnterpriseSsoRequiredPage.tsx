import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { LangfuseWordmark } from "@/src/components/design-system/LangfuseWordmark/LangfuseWordmark";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { env } from "@/src/env.mjs";
import { reportError } from "@/src/utils/reportError";
import { isJsonParseSyntaxError } from "@/src/features/auth/lib/expectedAuthErrors";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authMessages } from "@/src/features/i18n/messages/auth";

const enterpriseSsoFormSchema = z.object({
  email: z.email(),
});

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  "github-enterprise": "GitHub Enterprise",
  gitlab: "GitLab",
  "azure-ad": "Azure AD",
  okta: "Okta",
  authentik: "Authentik",
  onelogin: "OneLogin",
  auth0: "Auth0",
  cognito: "Cognito",
  keycloak: "Keycloak",
  jumpcloud: "JumpCloud",
  workos: "WorkOS",
  wordpress: "WordPress",
  custom: "Custom OAuth",
};

export default function EnterpriseSsoRequiredPage() {
  const t = useTranslation(authMessages);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailFromQuery =
    typeof router.query.email === "string" ? router.query.email : "";
  const attemptedProvider =
    typeof router.query.attemptedProvider === "string"
      ? router.query.attemptedProvider
      : undefined;
  const callbackUrl =
    typeof router.query.callbackUrl === "string"
      ? router.query.callbackUrl
      : undefined;

  const friendlyProviderName = useMemo(() => {
    if (!attemptedProvider) return undefined;
    return (
      PROVIDER_LABELS[attemptedProvider] ?? attemptedProvider.replace(/-/g, " ")
    );
  }, [attemptedProvider]);

  const form = useForm<z.infer<typeof enterpriseSsoFormSchema>>({
    resolver: zodResolver(enterpriseSsoFormSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  useEffect(() => {
    if (emailFromQuery) {
      form.setValue("email", emailFromQuery);
    }
  }, [emailFromQuery, form]);

  async function onSubmit(values: z.infer<typeof enterpriseSsoFormSchema>) {
    setError(null);
    setLoading(true);

    const domain = values.email.split("@")[1]?.toLowerCase();
    if (!domain) {
      form.setError("email", { message: t("invalidEmail") });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth/check-sso`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        },
      );

      if (response.ok) {
        const { providerId } = (await response.json()) as {
          providerId: string;
        };
        await signIn(providerId, {
          callbackUrl,
        });
        return;
      }

      if (response.status === 404) {
        setError(t("enterpriseSsoNoConfiguration"));
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      // A server message stays verbatim: it is the diagnosis, not chrome.
      setError(data?.message ?? t("enterpriseSsoStartFailed"));
    } catch (err) {
      reportError(err, {
        area: "auth.enterpriseSso",
        expected: isJsonParseSyntaxError(err),
        extra: { context: "auth.enterpriseSso" },
      });
      setError(t("enterpriseSsoCheckFailed"));
    } finally {
      setLoading(false);
    }
  }

  const description = friendlyProviderName
    ? t("enterpriseSsoTriedProvider", { provider: friendlyProviderName })
    : t("enterpriseSsoRequiresProvider");

  return (
    <>
      <Head>
        <title>{t("enterpriseSsoPageTitle")}</title>
      </Head>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto w-fit">
            <LangfuseWordmark />
          </div>
          <h1 className="text-primary mt-6 text-center text-2xl font-bold">
            {t("enterpriseSsoRequiredTitle")}
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            {description} {t("enterpriseSsoEnterCompanyEmail")}
          </p>
        </div>

        <div className="bg-card mt-10 rounded-lg px-6 py-8 shadow-sm sm:mx-auto sm:w-full sm:max-w-md">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("enterpriseSsoEmail")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="jsdoe@example.com"
                        allowPasswordManager
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {t("enterpriseSsoSubmit")}
              </Button>
            </form>
          </Form>
          {error ? (
            <div className="text-destructive mt-4 text-center text-sm font-bold">
              {error}
              <br />
              <a
                href="mailto:support@langfuse.com"
                className="text-link hover:text-link-hover"
              >
                support@langfuse.com
              </a>{" "}
              {t("supportError")}
            </div>
          ) : null}
          <div className="text-muted-foreground mt-6 text-center text-sm">
            <Link
              href="/auth/sign-in"
              className="text-link hover:text-link-hover"
            >
              {t("enterpriseSsoBackToSignIn")}
            </Link>
          </div>
        </div>

        <div className="text-muted-foreground mt-4 text-center text-xs">
          {t("enterpriseSsoNeedHelp")}{" "}
          <a
            href="mailto:support@langfuse.com"
            className="text-link hover:text-link-hover"
          >
            support@langfuse.com
          </a>
          .
        </div>
      </div>
    </>
  );
}
