// Langfuse Cloud only

import { buildLocalIsoDatePresentation } from "@/src/utils/dates";

import { useBillingInformation } from "@/src/ee/features/billing/components/useBillingInformation";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const BillingCurrentPlanLabel = () => {
  const { planLabel, cancellation } = useBillingInformation();
  const t = useTranslation(enterpriseMessages);
  const locale = useInterfaceLocale();
  const preparedCancellationDate = buildLocalIsoDatePresentation({
    date: cancellation?.date,
    accuracy: "day",
    locale,
  });

  return (
    <div>
      {t("billingCurrentPlan", { plan: planLabel })}{" "}
      {cancellation?.isCancelled && preparedCancellationDate && (
        <>
          <span>
            {t("billingCancellationEnds", { date: "" }).split(/\{date\}/)[0]}
          </span>
          <span title={preparedCancellationDate.title}>
            {preparedCancellationDate.display}
          </span>
          <span>
            {t("billingCancellationEnds", { date: "" }).split(/\{date\}/)[1]}
          </span>
        </>
      )}
    </div>
  );
};
