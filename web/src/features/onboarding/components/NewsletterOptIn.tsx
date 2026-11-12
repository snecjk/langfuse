/* eslint-disable @typescript-eslint/no-use-before-define */
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "@langfuse/icons";
import { type ReactNode, useState } from "react";
import { z } from "zod";
import { Button } from "@/src/components/design-system/Button/Button";
import { ControlledHoverCard } from "@/src/components/design-system/ControlledHoverCard/ControlledHoverCard";
import { createForm } from "@/src/components/design-system/factories/createForm";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Input } from "@/src/components/design-system/Input/Input";
import { LangfuseWordmark } from "@/src/components/design-system/LangfuseWordmark/LangfuseWordmark";
import { Metric } from "@/src/components/design-system/Metric/Metric";
import { Spinner } from "@/src/components/design-system/Spinner/Spinner";
import { useWatchedPromiseCallback } from "@/src/hooks/useWatchedPromiseCallback";
import {
  getNewsletterFallbackLinks,
  NEWSLETTER_SIGNUP_URL,
  type NewsletterList,
} from "../lib/newsletterSignup";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { onboardingMessages } from "@/src/features/i18n/messages/onboarding";

const newsletterOptInSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email address" })),
});

const NewsletterOptInForm = createForm<NewsletterOptInValues>();

type NewsletterOptInProps =
  | { state: "loading" }
  | { state: "completing" }
  | {
      state: "form";
      lists: NewsletterList[];
      defaultEmail: string;
      onSubscribe: (values: NewsletterOptInValues) => Promise<void>;
      onSkip: () => Promise<void>;
    }
  | {
      state: "unreachable" | "failed";
      lists: NewsletterList[];
      isContinuing: boolean;
      onContinue: () => void;
    };

export function NewsletterOptIn(props: NewsletterOptInProps) {
  const t = useTranslation(onboardingMessages);
  switch (props.state) {
    case "loading":
      return (
        <StatusCard
          title={t("newsletterGettingReady")}
          description={t("newsletterOneMoment")}
        />
      );
    case "completing":
      return (
        <StatusCard
          title={t("newsletterFinishingSetup")}
          description={t("newsletterTakingYouToWorkspace")}
        />
      );
    case "form":
      return (
        <OnboardingCard>
          <NewsletterHeader audience={getAudience(props.lists)} />
          <NewsletterForm
            defaultEmail={props.defaultEmail}
            onSubscribe={props.onSubscribe}
            onSkip={props.onSkip}
          />
        </OnboardingCard>
      );
    case "unreachable":
    case "failed":
      return (
        <OnboardingCard>
          <NewsletterHeader audience={getAudience(props.lists)} />
          <NewsletterFallback
            reason={t(
              props.state === "unreachable"
                ? "newsletterFallbackUnreachable"
                : "newsletterFallbackFailed",
            )}
            lists={props.lists}
            isContinuing={props.isContinuing}
            onContinue={props.onContinue}
          />
        </OnboardingCard>
      );
  }
}

function OnboardingCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col py-6 sm:min-h-full sm:justify-start sm:px-6 sm:py-12 lg:px-8">
      <div className="flex items-center justify-center gap-2 sm:mx-auto sm:w-full sm:max-w-md">
        <LangfuseWordmark />
      </div>

      <div className="bg-card mt-6 flex flex-col gap-6 rounded-lg px-6 py-6 shadow-sm sm:mx-auto sm:mt-16 sm:w-full sm:max-w-[480px] sm:px-12 sm:py-10">
        {children}
      </div>
    </div>
  );
}

function StatusCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <OnboardingCard>
      <div className="flex flex-col items-center py-4 text-center">
        <Spinner size="xl" variant="muted" />
        <h1 className="mt-6 text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      </div>
    </OnboardingCard>
  );
}

/** The ⓘ opens on hover and keyboard focus, and on click or tap for touch screens. */
function NewsletterHeader({ audience }: { audience: Audience }) {
  const t = useTranslation(onboardingMessages);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const openExplainer = () => setIsExplainerOpen(true);
  const explainerLabel = t("newsletterExplainerLabel");
  const description =
    audience === "installer"
      ? t("newsletterInstallerDescription")
      : t("newsletterInvitedDescription");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <h1 className="text-xl font-bold">{t("newsletterStayUpToDate")}</h1>
        <ControlledHoverCard
          open={isExplainerOpen}
          onOpenChange={setIsExplainerOpen}
          content={<NewsletterExplainer audience={audience} />}
          aria-label={explainerLabel}
        >
          {({ getTriggerProps }) => (
            <IconButton
              {...getTriggerProps({ onClick: openExplainer })}
              icon={Info}
              label={explainerLabel}
              size="sm"
              variant="ghost"
            />
          )}
        </ControlledHoverCard>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function NewsletterExplainer({ audience }: { audience: Audience }) {
  const t = useTranslation(onboardingMessages);
  const intro =
    audience === "installer"
      ? t("newsletterInstallerExplainer")
      : t("newsletterInvitedExplainer");

  return (
    <div className="text-muted-foreground flex w-96 max-w-[calc(100vw-1rem)] flex-col gap-2 p-3 text-sm">
      <p>{intro}</p>
      <p>{t("newsletterUnsubscribe")}</p>
      <p>
        {t("newsletterBrowserCheckPrefix")}{" "}
        <span className="font-mono break-words">{NEWSLETTER_SIGNUP_URL}</span>{" "}
        {t("newsletterBrowserCheckSuffix")}
      </p>
      <p>
        {t("newsletterAdminsDisablePrefix")}{" "}
        <span className="font-mono break-words">
          LANGFUSE_DISABLE_SIGNUP_ONBOARDING=true
        </span>
        {t("newsletterAdminsDisableSuffix")}
      </p>
    </div>
  );
}

/** Skip leaves without checking the address; Subscribe (or Enter in the field) validates it first. */
function NewsletterForm({
  defaultEmail,
  onSubscribe,
  onSkip,
}: {
  defaultEmail: string;
  onSubscribe: (values: NewsletterOptInValues) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const t = useTranslation(onboardingMessages);
  const form = NewsletterOptInForm.useForm({
    resolver: zodResolver(newsletterOptInSchema),
    defaultValues: { email: defaultEmail },
  });
  const [skip, isSkipping] = useWatchedPromiseCallback(onSkip, [onSkip]);
  const isSubscribing = form.formState.isSubmitting;

  return (
    <NewsletterOptInForm
      form={form}
      onSubmit={onSubscribe}
      actions={[
        {
          id: "subscribe",
          type: "submit",
          text: t("newsletterSubscribe"),
          loading: isSubscribing,
          disabled: isSkipping,
        },
        {
          id: "skip",
          type: "button",
          text: t("newsletterSkip"),
          variant: "ghost",
          loading: isSkipping,
          disabled: isSubscribing,
          onClick: skip,
        },
      ]}
    >
      <NewsletterOptInForm.Field name="email" label={t("newsletterEmail")}>
        {(field) => (
          <Input
            id={field.id}
            inputMode="email"
            autoComplete="email"
            name={field.name}
            value={field.value}
            onBlur={field.onBlur}
            onChange={field.onChange}
            ref={field.ref}
            aria-describedby={field.inputDescribedById}
            aria-invalid={Boolean(field.error)}
            error={Boolean(field.error)}
          />
        )}
      </NewsletterOptInForm.Field>
    </NewsletterOptInForm>
  );
}

/** Replaces a form that may have had focus, so the reason takes focus for keyboard and screen-reader users. */
function NewsletterFallback({
  reason,
  lists,
  isContinuing,
  onContinue,
}: {
  reason: string;
  lists: NewsletterList[];
  isContinuing: boolean;
  onContinue: () => void;
}) {
  const t = useTranslation(onboardingMessages);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p
          ref={focusOnMount}
          tabIndex={-1}
          className="text-muted-foreground text-sm outline-hidden"
        >
          {reason}
        </p>
        <ul className="flex flex-col gap-2">
          {getNewsletterFallbackLinks(lists).map(({ list, url }) => (
            <li key={list} className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs">
                {t(
                  list === "oss"
                    ? "newsletterFallbackOss"
                    : "newsletterFallbackProduct",
                )}
              </span>
              <Metric href={url} value={url} newTab shouldWrap />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Button
          type="button"
          text={t("newsletterContinue")}
          loading={isContinuing}
          onClick={onContinue}
        />
      </div>
    </div>
  );
}

type Audience = "installer" | "invited";

const getAudience = (lists: NewsletterList[]): Audience =>
  lists.includes("oss") ? "installer" : "invited";

const focusOnMount = (element: HTMLElement | null) => element?.focus();

export type NewsletterOptInValues = z.infer<typeof newsletterOptInSchema>;
