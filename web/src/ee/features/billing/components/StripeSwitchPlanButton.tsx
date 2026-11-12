/* eslint-disable no-nested-ternary, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
/* eslint-disable @repo/no-abstracted-overlay-trigger */
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { ActionButton } from "@/src/components/ActionButton";
import { planLabels } from "@langfuse/shared";
import { api } from "@/src/utils/api";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { nanoid } from "nanoid";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const StripeSwitchPlanButton = ({
  orgId,
  currentPlan,
  newPlanTitle,
  isLegacySubscription,
  isUpgrade,
  stripeProductId,
  onProcessing,
  processing,
}: {
  orgId: string;
  currentPlan: keyof typeof planLabels | undefined;
  newPlanTitle: string | undefined;
  isLegacySubscription: boolean;
  isUpgrade: boolean;
  stripeProductId: string;
  onProcessing: (id: string | null) => void;
  processing: boolean;
}) => {
  const [_opId, setOpId] = useState<string | null>(null);
  const t = useTranslation(enterpriseMessages);

  const mutChangePlan =
    api.cloudBilling.changeStripeSubscriptionProduct.useMutation({
      onSuccess: () => {
        showSuccessToast({
          operation: "billing_plan.change",
          title: t("billingPlanChanged"),
          description: "",
        });
        onProcessing(null);
        setOpId(null);
        setTimeout(() => window.location.reload(), 500);
      },
      onError: (error) => {
        onProcessing(null);
        setOpId(null);
        showToast({
          type: "ERROR",
          title: t("billingChangePlanFailed"),
          analytics: classifyTrpcToastError(error, "billing_plan.change"),
        });
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">{t("billingChangePlan")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("billingConfirmChangeTitle", {
              current: planLabels[currentPlan ?? "cloud:hobby"],
              next: newPlanTitle ?? "",
            })}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="text-sm">
          {isLegacySubscription ? (
            <>
              <p>{t("billingConfirmChangeLegacy1")}</p>
              <p>{t("billingConfirmChangeLegacy2")}</p>
              <p>{t("billingConfirmChangeLegacy3")}</p>
            </>
          ) : isUpgrade ? (
            <>
              <p>{t("billingConfirmChangeUpgrade1")}</p>
              <p>{t("billingConfirmChangeUpgrade2")}</p>
              <p>{t("billingConfirmChangeUpgrade3")}</p>
            </>
          ) : (
            <>
              <p>{t("billingConfirmChangeDowngrade1")}</p>
              <p>{t("billingConfirmChangeDowngrade2")}</p>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("retryMigrationCancel")}</Button>
          </DialogClose>
          <ActionButton
            onClick={() => {
              onProcessing(stripeProductId);
              // idempotency key for mutation operations with the stripe api
              let opId = _opId;
              if (!opId) {
                opId = nanoid();
                setOpId(opId);
              }
              mutChangePlan.mutate({ orgId, stripeProductId, opId });
            }}
            loading={processing}
          >
            {t("billingConfirm")}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
