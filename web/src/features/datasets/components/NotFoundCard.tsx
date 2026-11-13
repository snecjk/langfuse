import { Card } from "@/src/components/ui/card";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

export const NotFoundCard = ({
  itemType,
  singleLine = false,
}: {
  itemType: "trace" | "observation";
  singleLine?: boolean;
}) => {
  const t = useTranslation(datasetsMessages);
  const itemTypeName = itemType === "trace" ? t("trace") : t("observation");
  if (singleLine) {
    return (
      <Card className="flex h-full w-full items-center justify-start overflow-hidden rounded-sm px-2">
        <p
          className="text-muted-foreground truncate text-xs"
          title={t("traceUnavailable", { itemType: itemTypeName })}
        >
          {t("traceUnavailable", { itemType: itemTypeName })}
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-sm p-3">
      <h2 className="mb-1.5 text-sm font-bold">{t("notFound")}</h2>
      <p className="text-muted-foreground max-w-xs text-center text-xs">
        {t("traceUnavailable", { itemType: itemTypeName })}
      </p>
    </Card>
  );
};
