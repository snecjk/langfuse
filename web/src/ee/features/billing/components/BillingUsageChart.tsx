// Langfuse Cloud only

import { Card } from "@/src/components/ui/card";
import { numberFormatter, compactNumberFormatter } from "@/src/utils/numbers";
import { type Plan } from "@langfuse/shared";
import type { RouterOutput } from "@/src/utils/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const BillingUsageChart = ({
  usage,
  hobbyPlanLimit,
  plan,
}: {
  usage: Exclude<RouterOutput["cloudBilling"]["getUsage"], null> | undefined;
  hobbyPlanLimit: number;
  plan: Plan;
}) => {
  const t = useTranslation(enterpriseMessages);
  const usageType = usage?.usageType
    ? usage.usageType.charAt(0).toUpperCase() + usage.usageType.slice(1)
    : t("billingEventsFallback");

  return (
    <div>
      <Card className="p-3">
        {usage !== undefined ? (
          <>
            <p className="text-muted-foreground text-sm">
              {usage.billingPeriod
                ? t("billingUsageConsumedPeriod", { type: usageType })
                : t("billingUsageConsumed30d", { type: usageType })}
            </p>
            <div className="text-3xl font-bold">
              {numberFormatter(usage.usageCount, 0)}
            </div>
            {plan === "cloud:hobby" && (
              <>
                <div className="mt-4 flex justify-between">
                  <span className="text-sm">{`${numberFormatter((usage.usageCount / hobbyPlanLimit) * 100)}%`}</span>
                  <span className="text-sm">
                    {t("billingPlanLimit", {
                      limit: compactNumberFormatter(hobbyPlanLimit),
                    })}
                  </span>
                </div>
                <div
                  className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={Math.min(
                    (usage.usageCount / hobbyPlanLimit) * 100,
                    100,
                  )}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (usage.usageCount / hobbyPlanLimit) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-sm">
            {t("billingLoading")}
          </span>
        )}
      </Card>
    </div>
  );
};
