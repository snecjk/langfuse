import {
  SplashScreen,
  type ValueProposition,
} from "@/src/components/ui/SplashScreen";
import { ThumbsUp, Star, LineChart, Code } from "@langfuse/icons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { evaluationsMessages } from "@/src/features/i18n/messages/evaluations";

export function ScoresOnboarding() {
  const t = useTranslation(evaluationsMessages);
  const valuePropositions: ValueProposition[] = [
    {
      title: t("scoreOnboardingFeedback"),
      description: t("scoreOnboardingFeedbackDesc"),
      icon: ThumbsUp,
    },
    {
      title: t("scoreOnboardingModelEval"),
      description: t("scoreOnboardingModelEvalDesc"),
      icon: Star,
    },
    {
      title: t("scoreOnboardingQuality"),
      description: t("scoreOnboardingQualityDesc"),
      icon: LineChart,
    },
    {
      title: t("scoreOnboardingCustom"),
      description: t("scoreOnboardingCustomDesc"),
      icon: Code,
    },
  ];

  return (
    <SplashScreen
      title={t("scoresOnboardingTitle")}
      description={t("scoresOnboardingDescription")}
      valuePropositions={valuePropositions}
      secondaryAction={{
        label: t("learnMore"),
        href: "https://langfuse.com/docs/evaluation/evaluation-methods/custom-scores",
      }}
      videoSrc="https://static.langfuse.com/prod-assets/onboarding/scores-overview-v1.mp4"
    />
  );
}
