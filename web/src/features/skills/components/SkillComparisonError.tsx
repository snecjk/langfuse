import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

export function SkillComparisonError({ retry }: { retry: () => void }) {
  const t = useTranslation(skillMessages);
  return (
    <div role="alert" className="flex flex-col items-start gap-2 text-sm">
      <p>{t("couldNotLoadComparison")}</p>
      <Button text={t("retry")} variant="secondary" onClick={retry} />
    </div>
  );
}
