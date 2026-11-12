// The step new users see after signing up: the survey on Cloud, the newsletter opt-in on self-hosted.

import Head from "next/head";
import { ConnectedOnboardingSurvey } from "@/src/features/onboarding/components/ConnectedOnboardingSurvey";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { onboardingMessages } from "@/src/features/i18n/messages/onboarding";

export default function OnboardingPage() {
  const t = useTranslation(onboardingMessages);
  return (
    <>
      <Head>
        <title>{t("onboardingTitle")}</title>
      </Head>
      <ConnectedOnboardingSurvey />
    </>
  );
}
