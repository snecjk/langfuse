/* eslint-disable @repo/no-style-props */
import { Info } from "@langfuse/icons";
import { format } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

type DatasetVersionWarningBannerProps = {
  selectedVersion: Date;
  resetToLatest: () => void;
  className?: string;
  changeCounts?: {
    upserts: number;
    deletes: number;
  };
};

export function DatasetVersionWarningBanner({
  selectedVersion,
  resetToLatest,
  className = "",
  changeCounts,
}: DatasetVersionWarningBannerProps) {
  const t = useTranslation(datasetsMessages);
  const totalChanges = changeCounts
    ? changeCounts.upserts + changeCounts.deletes
    : 0;
  const hasChanges = totalChanges > 0;

  return (
    <div
      className={`border-accent-dark-blue/10 bg-accent-light-blue/30 flex items-start gap-3 border-b p-3 ${className}`}
    >
      <Info size="base" __rawClassName="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm wrap-break-word">
            {t("viewingVersionFrom")}{" "}
            <span className="text-foreground font-bold">
              {format(selectedVersion, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </p>
          <Button
            onClick={resetToLatest}
            variant="link"
            className="h-auto shrink-0 p-0 text-sm underline-offset-4"
          >
            {t("returnToLatest")}
          </Button>
        </div>
        {changeCounts && hasChanges && (
          <p className="text-muted-foreground text-xs">
            {t("changesSinceVersion", { count: totalChanges })}
            {changeCounts.upserts > 0 &&
              `, ${t("upsertsSinceVersion", { count: changeCounts.upserts })}`}
            {changeCounts.deletes > 0 &&
              `, ${t("deletesSinceVersion", { count: changeCounts.deletes })}`}
          </p>
        )}
      </div>
    </div>
  );
}
