import { api } from "@/src/utils/api";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { BillingDiscountCodeButton } from "@/src/ee/features/billing/components/BillingDiscountCodeButton";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const BillingDiscountView = ({
  orgId,
  hasStripeCustomer,
}: {
  orgId: string;
  hasStripeCustomer: boolean;
}) => {
  const { data } = api.cloudBilling.getSubscriptionInfo.useQuery(
    { orgId },
    { enabled: hasStripeCustomer },
  );
  const t = useTranslation(enterpriseMessages);

  const discounts = data?.discounts ?? [];

  const formatAmount = (value: number, currency: string | null) => {
    const cur = (currency || "USD").toUpperCase();
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur,
        currencyDisplay: "narrowSymbol",
      }).format(value / 100);
    } catch {
      // Fallback simple formatting
      return `${(value / 100).toFixed(2)} ${cur}`;
    }
  };

  if (!hasStripeCustomer) {
    return (
      <div className="flex items-center">
        <BillingDiscountCodeButton orgId={orgId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1">{t("billingDiscountsLabel")}</span>
        {discounts.map((d) => {
          const labelParts: string[] = [];
          if (d.code) labelParts.push(d.code);
          else if (d.name) labelParts.push(d.name);

          if (d.kind === "percent")
            labelParts.push(t("billingPercentOff", { value: d.value }));
          else
            labelParts.push(
              t("billingAmountOff", {
                value: formatAmount(d.value, d.currency),
              }),
            );

          return (
            <Badge key={d.id} color="filled" text={labelParts.join(" · ")} />
          );
        })}
        <BillingDiscountCodeButton orgId={orgId} />
      </div>
    </div>
  );
};
