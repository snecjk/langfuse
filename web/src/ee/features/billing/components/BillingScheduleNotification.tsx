// Langfuse Cloud only

import { InfoIcon } from "@langfuse/icons";
import type { UseBillingInformationResult } from "./useBillingInformation";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

type BillingScheduleNotificationProps =
  | {
      type: "cancellation";
      planLabel: string;
      cancellation: NonNullable<UseBillingInformationResult["cancellation"]>;
    }
  | {
      type: "scheduled-plan-switch";
      planLabel: string;
      scheduledPlanSwitch: NonNullable<
        UseBillingInformationResult["scheduledPlanSwitch"]
      >;
    };

export const BillingScheduleNotification = (
  props: BillingScheduleNotificationProps,
) => {
  const t = useTranslation(enterpriseMessages);
  if (props.type === "cancellation") {
    return (
      <div className="mt-6 mb-4 flex overflow-x-auto rounded-lg border border-blue-200 bg-blue-100 py-2 text-sm text-blue-900 contrast-more:border-current ltr:pr-4 rtl:pl-4 dark:border-blue-200/30 dark:bg-blue-900/30 dark:text-blue-200 contrast-more:dark:border-current">
        <div className="flex items-center gap-2 pl-3 leading-7">
          <InfoIcon size="base" />
          {t("billingCancellationNotice", {
            plan: props.planLabel,
            date: props.cancellation.formatted ?? "",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-4 flex overflow-x-auto rounded-lg border border-blue-200 bg-blue-100 py-2 text-sm text-blue-900 contrast-more:border-current ltr:pr-4 rtl:pl-4 dark:border-blue-200/30 dark:bg-blue-900/30 dark:text-blue-200 contrast-more:dark:border-current">
      <div className="flex gap-2 pl-3">
        <InfoIcon size="base" __rawClassName="mt-1" />
        <div>
          <div>
            {t("billingScheduledSwitchNotice", {
              current: props.planLabel,
              next: props.scheduledPlanSwitch.newPlanLabel ?? "",
              date: props.scheduledPlanSwitch.formatted ?? "",
            })}
          </div>
          {props.scheduledPlanSwitch.message && (
            <div className="mt-2 text-blue-800 dark:text-blue-300">
              {props.scheduledPlanSwitch.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
