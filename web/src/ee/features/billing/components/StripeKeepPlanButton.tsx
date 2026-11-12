/* eslint-disable @repo/no-abstracted-overlay-trigger, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
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
import { api } from "@/src/utils/api";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { nanoid } from "nanoid";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const StripeKeepPlanButton = ({
  orgId,
  stripeProductId,
  onProcessing,
  processing,
}: {
  orgId: string;
  stripeProductId: string;
  onProcessing: (id: string | null) => void;
  processing: boolean;
}) => {
  const [_opId, setOpId] = useState<string | null>(null);
  const t = useTranslation(enterpriseMessages);

  const clearSchedule = api.cloudBilling.clearPlanSwitchSchedule.useMutation({
    onSuccess: () => {
      showSuccessToast({
        operation: "billing_plan.keep",
        title: t("billingKeptCurrentPlan"),
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
        title: t("billingKeepPlanFailed"),
        analytics: classifyTrpcToastError(error, "billing_plan.keep"),
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default">
          {t("billingKeepPlan")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("billingConfirmKeepPlanTitle")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="text-sm">
          <p>{t("billingConfirmKeepPlanBody")}</p>
          <p>{t("billingConfirmKeepPlanBody2")}</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("billingGoBack")}</Button>
          </DialogClose>
          <Button
            variant="default"
            onClick={() => {
              onProcessing(stripeProductId);
              // idempotency key for mutation operations with the stripe api
              let opId = _opId;
              if (!opId) {
                opId = nanoid();
                setOpId(opId);
              }
              clearSchedule.mutate({ orgId, opId });
            }}
            disabled={processing}
          >
            {processing ? t("billingKeeping") : t("billingConfirmKeepPlan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
