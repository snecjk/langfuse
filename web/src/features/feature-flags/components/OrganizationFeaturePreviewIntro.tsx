import { Button } from "@/src/components/design-system/Button/Button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

type OrganizationFeaturePreviewIntroProps = {
  canOpenPersonalPreviews: boolean;
  onOpenPersonalPreviews: () => void;
};

export function OrganizationFeaturePreviewIntro({
  canOpenPersonalPreviews,
  onOpenPersonalPreviews,
}: OrganizationFeaturePreviewIntroProps) {
  const t = useTranslation(enterpriseMessages);
  return (
    <div className="flex flex-col gap-1">
      {canOpenPersonalPreviews ? (
        <p className="text-muted-foreground text-sm">
          {[
            <Button
              key="personal-previews"
              variant="text"
              text={t("featurePreviewsAdminIntroPersonal")}
              onClick={onOpenPersonalPreviews}
            />,
            t("featurePreviewsAdminIntroShared"),
          ]}
        </p>
      ) : null}
      <p className="text-muted-foreground text-sm">
        {t("featurePreviewsAdminIntro")}
      </p>
    </div>
  );
}
