import { signIn } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ErrorPageWithSentry } from "@/src/components/error-page";
import { Spinner } from "@/src/components/layouts/Spinner";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authMessages } from "@/src/features/i18n/messages/auth";

export default function SsoInitiatePage() {
  const t = useTranslation(authMessages);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) {
      return;
    }

    const provider = router.query.provider as string | undefined;

    // If provider is missing or empty, show error
    if (!provider || provider === "") {
      setError(t("ssoInitiateNoProvider"));
      return;
    }

    // Automatically trigger sign-in with the provider
    signIn(provider)
      .then(() => {
        // signIn will redirect automatically on success
        // No need to do anything here
      })
      .catch((error) => {
        console.error("SSO initiation error:", error);
        setError(
          error instanceof Error ? error.message : t("ssoInitiateFailed"),
        );
      });
  }, [router.isReady, router.query.provider, t]);

  // Show error page if sign-in failed
  if (error) {
    return (
      <>
        <Head>
          <title>{t("ssoInitiateFailedTitle")} | Langfuse</title>
        </Head>
        <ErrorPageWithSentry
          title={t("ssoInitiateFailedTitle")}
          message={error}
        />
      </>
    );
  }

  // Show loading spinner while processing
  return (
    <>
      <Head>
        <title>{t("signingInPageTitle")}</title>
      </Head>
      <Spinner message={t("ssoInitiateRedirecting")} />
    </>
  );
}
