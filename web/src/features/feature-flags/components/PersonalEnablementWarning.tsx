import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

type PersonalEnablementWarningProps = {
  canOpenPersonalPreviews: boolean;
  onOpenPersonalPreviews: () => void;
};

export function PersonalEnablementWarning({
  canOpenPersonalPreviews,
  onOpenPersonalPreviews,
}: PersonalEnablementWarningProps) {
  const t = useTranslation(enterpriseMessages);
  if (!canOpenPersonalPreviews) {
    return (
      <p className="text-destructive text-xs">
        {t("featurePreviewsPersonalWarning")}
      </p>
    );
  }

  return (
    <p className="text-destructive text-xs">
      {t("featurePreviewsPersonalWarningPrefix")}{" "}
      <Button
        variant="text"
        size="sm"
        text={t("featurePreviewsPersonalWarningLink")}
        onClick={onOpenPersonalPreviews}
      />{" "}
      {t("featurePreviewsPersonalWarningSuffix")}
    </p>
  );
}
