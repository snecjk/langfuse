import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authFormsMessages } from "@/src/features/i18n/messages/auth-forms";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Head from "next/head";
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
import { PasswordInput } from "@/src/components/design-system/PasswordInput/PasswordInput";
import { LangfuseWordmark } from "@/src/components/design-system/LangfuseWordmark/LangfuseWordmark";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft } from "@langfuse/icons";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { RequestResetPasswordEmailButton } from "@/src/features/auth-credentials/components/RequestResetPasswordEmailButton";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { ErrorPage } from "@/src/components/error-page";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { passwordSchema } from "@/src/features/auth/lib/signupSchema";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import {
  PASSWORD_RESET_EMAIL_CODE_MAX_AGE_SECONDS,
  PASSWORD_SETUP_EMAIL_STORAGE_KEY,
  SIGNUP_EMAIL_CODE_MAX_AGE_SECONDS,
} from "@/src/features/auth-credentials/lib/credentialsUtils";
import { getOnboardingTargetPath } from "@/src/features/onboarding/lib/demoCallbackRedirect";
import { env } from "@/src/env.mjs";
import { TURNSTILE_ACTIONS } from "@/src/features/auth/constants";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/src/features/auth/components/TurnstileWidget";

type FormTranslator = ReturnType<
  typeof useTranslation<typeof authFormsMessages>
>;
const resetPasswordSchema = (t: FormTranslator) =>
  z
    .object({
      token: z.string().regex(/^\d{6}$/, {
        message: t("codeDigits"),
      }),
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

export function ResetPasswordPage({
  passwordResetAvailable,
  initialEmail = "",
  intent = "reset",
}: {
  passwordResetAvailable: boolean;
  initialEmail?: string;
  intent?: "reset" | "setup";
}) {
  const t = useTranslation(authFormsMessages);
  const session = useSession();
  const router = useRouter();
  const { isLangfuseCloud, region } = useLangfuseCloudRegion();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [codeRequested, setCodeRequested] = useState(
    // The intent check keeps a URL-supplied initialEmail from opening the code
    // step for an address no email was ever sent to.
    intent === "setup" && Boolean(initialEmail),
  );

  const capture = usePostHogClientCapture();

  const isSetMode =
    intent === "setup" || session.data?.user?.hasPassword === false;
  const codeMinutesValid =
    (isSetMode
      ? SIGNUP_EMAIL_CODE_MAX_AGE_SECONDS
      : PASSWORD_RESET_EMAIL_CODE_MAX_AGE_SECONDS) / 60;
  const setupTargetPath =
    isSetMode && router.isReady
      ? getOnboardingTargetPath({
          targetPath: router.query.targetPath,
          isLangfuseCloud,
        })
      : undefined;
  const setupPasswordPath = setupTargetPath
    ? `/auth/setup-password?targetPath=${encodeURIComponent(setupTargetPath)}`
    : "/auth/setup-password";

  const mutResetPassword = api.credentials.resetPassword.useMutation();
  const effectiveEmail = session.data?.user?.email ?? email;
  const turnstileSiteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const [turnstileAction, setTurnstileAction] = useState<
    typeof TURNSTILE_ACTIONS.login | typeof TURNSTILE_ACTIONS.passwordReset
  >(TURNSTILE_ACTIONS.login);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (intent !== "setup" || initialEmail) return;

    const storedEmail = sessionStorage.getItem(
      PASSWORD_SETUP_EMAIL_STORAGE_KEY,
    );
    if (storedEmail) {
      setEmail(storedEmail);
      setCodeRequested(true);
    }
  }, [initialEmail, intent]);

  async function onSubmit(
    values: z.infer<ReturnType<typeof resetPasswordSchema>>,
  ) {
    setFormError(null);
    setIsSuccess(false);
    if (!z.email().safeParse(effectiveEmail).success) {
      setFormError(t("validEmail"));
      return;
    }
    capture(
      isSetMode
        ? "auth:set_password_form_submit"
        : "auth:update_password_form_submit",
    );
    try {
      await mutResetPassword.mutateAsync({
        email: effectiveEmail,
        token: values.token,
        password: values.password,
        intent,
      });

      if (isSetMode) {
        sessionStorage.removeItem(PASSWORD_SETUP_EMAIL_STORAGE_KEY);
      }

      let target = setupTargetPath ?? "/";
      // Self-hosted: only a new sign-up, which lands on the setup-password page; /onboarding forwards on when the step is off.
      const goesThroughOnboarding = isLangfuseCloud
        ? isSetMode && region !== "DEV"
        : intent === "setup";
      if (goesThroughOnboarding) {
        target = setupTargetPath
          ? `/onboarding?targetPath=${encodeURIComponent(setupTargetPath)}`
          : "/onboarding";
      }
      // A password update revokes every existing JWT, including this
      // browser's, so the current session always has to be re-established.
      const signInResult = await signIn("credentials", {
        email: effectiveEmail,
        password: values.password,
        redirect: false,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      turnstileRef.current?.reset();
      if (!signInResult?.ok) {
        target = "/auth/sign-in";
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(target);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setFormError(error.message);
      } else {
        console.error(error);
        setFormError(t("unknownError"));
      }
    }
  }

  if (!passwordResetAvailable)
    return (
      <ErrorPage
        title={t("notAvailable")}
        message={t("resetUnavailable")}
        additionalButton={{
          label: t("setupInstructions"),
          href: "https://langfuse.com/self-hosting/security/authentication-and-sso#auth-email-password",
        }}
      />
    );

  const title = isSetMode ? t("setYourPassword") : t("resetYourPassword");
  const pageTitle = isSetMode ? t("setPassword") : t("resetPassword");
  const submitLabel = isSetMode ? t("setPassword") : t("updatePassword");
  const successMessage = isSetMode ? t("setSuccess") : t("resetSuccess");

  return (
    <>
      <Head>
        <title>{pageTitle} | Langfuse</title>
      </Head>
      <div className="flex flex-1 flex-col py-6 sm:min-h-full sm:justify-center sm:px-6 sm:py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/">
            <div className="mx-auto w-fit">
              <LangfuseWordmark />
            </div>
          </Link>
          <h2 className="text-primary mt-4 text-center text-2xl leading-9 font-bold tracking-tight">
            {title}
          </h2>
          {!isSetMode && session.status !== "authenticated" && (
            <div className="mt-2 flex justify-center">
              <Button asChild variant="ghost">
                <Link href="/auth/sign-in">
                  <ArrowLeft
                    size="base"
                    color="default"
                    __rawClassName="mr-2"
                  />
                  {t("backToSignIn")}
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card mt-10 rounded-lg px-6 py-10 shadow-sm sm:mx-auto sm:w-full sm:max-w-[480px] sm:px-12">
          <div className="space-y-6">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jsdoe@example.com"
                      disabled={session.status === "authenticated"}
                      allowPasswordManager
                      autoComplete="email"
                      value={effectiveEmail}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </FormControl>
                </FormItem>
                {codeRequested ? (
                  <>
                    <p className="text-muted-foreground text-sm">
                      {t("codeInstructions", { minutes: codeMinutesValid })}
                    </p>
                    <FormField
                      control={form.control}
                      name="token"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>{t("verificationCode")}</FormLabel>
                          <FormControl>
                            <Input
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              placeholder={t("codePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {localizeFormMessage(fieldState.error?.message, t)}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            {isSetMode ? t("password") : t("newPassword")}
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              allowPasswordManager
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {localizeFormMessage(fieldState.error?.message, t)}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            {isSetMode
                              ? t("confirmPassword")
                              : t("confirmNewPassword")}
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              allowPasswordManager
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {localizeFormMessage(fieldState.error?.message, t)}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    {turnstileSiteKey ? (
                      <TurnstileWidget
                        ref={turnstileRef}
                        siteKey={turnstileSiteKey}
                        action={turnstileAction}
                        onTokenChange={setTurnstileToken}
                      />
                    ) : null}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          mutResetPassword.isPending ||
                          (Boolean(turnstileSiteKey) &&
                            (turnstileAction !== TURNSTILE_ACTIONS.login ||
                              !turnstileToken))
                        }
                        loading={mutResetPassword.isPending}
                      >
                        {submitLabel}
                      </Button>
                    </div>
                    {formError ? (
                      <div className="text-destructive text-center text-sm font-bold">
                        {localizeFormMessage(formError, t)}
                      </div>
                    ) : null}
                    <div className="flex flex-col">
                      <RequestResetPasswordEmailButton
                        email={effectiveEmail}
                        callbackUrl={isSetMode ? setupPasswordPath : undefined}
                        onEmailSent={() => {
                          setCodeRequested(true);
                          setTurnstileToken(undefined);
                          setTurnstileAction(TURNSTILE_ACTIONS.login);
                        }}
                        label={t("sendAnotherCode")}
                        variant="secondary"
                        sharedTurnstile={
                          turnstileSiteKey
                            ? {
                                token: turnstileToken,
                                action: turnstileAction,
                                onPreparePasswordReset: () => {
                                  setTurnstileToken(undefined);
                                  setTurnstileAction(
                                    TURNSTILE_ACTIONS.passwordReset,
                                  );
                                },
                                onRejectToken: () => {
                                  turnstileRef.current?.reset();
                                },
                              }
                            : undefined
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <RequestResetPasswordEmailButton
                      email={effectiveEmail}
                      callbackUrl={isSetMode ? setupPasswordPath : undefined}
                      onEmailSent={() => setCodeRequested(true)}
                    />
                  </div>
                )}
              </form>
            </Form>
            {isSuccess && (
              <div className="text-center text-sm font-bold">
                {successMessage}
              </div>
            )}
          </div>
        </div>
        {!isSetMode && session.status !== "authenticated" && (
          <div className="text-muted-foreground mx-auto mt-10 max-w-lg text-center text-xs">
            {t("resetFooter")}{" "}
            <Link href="/auth/sign-in" className="underline">
              {t("signInLower")}
            </Link>
            .
          </div>
        )}
      </div>
    </>
  );
}

function localizeFormMessage(
  message: string | null | undefined,
  t: ReturnType<typeof useTranslation<typeof authFormsMessages>>,
) {
  const key = (
    Object.keys(authFormsMessages.en) as Array<
      keyof typeof authFormsMessages.en
    >
  ).find(
    (key) =>
      authFormsMessages.en[key] === message ||
      authFormsMessages["zh-CN"][key] === message,
  );
  return key ? t(key) : message;
}
