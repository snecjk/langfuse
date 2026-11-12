import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import { formatLocalIsoDate } from "@/src/utils/dates";
import { BillingCurrentPlanLabel } from "./BillingCurrentPlanLabel";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const BillingPlanPeriodView = () => {
  const router = useRouter();
  const orgId = router.query.organizationId as string | undefined;
  const t = useTranslation(enterpriseMessages);

  const { data, isLoading } = api.cloudBilling.getSubscriptionInfo.useQuery(
    { orgId: orgId ?? "" },
    { enabled: Boolean(orgId) },
  );

  return (
    <div className="text-muted-foreground flex flex-col gap-1 text-sm">
      <BillingCurrentPlanLabel />
      <p>
        {t("billingPeriod", {
          range:
            !isLoading && data?.billingPeriod
              ? `${formatLocalIsoDate(data.billingPeriod.start, false, "day")} - ${formatLocalIsoDate(data.billingPeriod.end, false, "day")}`
              : "",
        })}
      </p>
    </div>
  );
};
