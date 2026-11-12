/* eslint-disable @repo/no-style-props, @repo/no-abstracted-overlay-trigger, @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
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
import { useBillingInformation } from "./useBillingInformation";
import { api } from "@/src/utils/api";
import { useState } from "react";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { nanoid } from "nanoid";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const StripeCancellationButton = ({
  orgId,
  variant,
  className,
}: {
  orgId: string;
  variant: "secondary" | "default";
  className?: string;
}) => {
  const { cancellation } = useBillingInformation();
  const [loading, setLoading] = useState(false);
  const [_opId, setOpId] = useState<string | null>(null);
  const t = useTranslation(enterpriseMessages);

  const cancelMutation = api.cloudBilling.cancelStripeSubscription.useMutation({
    onSuccess: () => {
      showSuccessToast({
        operation: "subscription.cancel",
        title: t("billingSubscriptionCancelled"),
        description: "",
      });
      setLoading(false);
      setOpId(null);
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error) => {
      setLoading(false);
      setOpId(null);
      showToast({
        type: "ERROR",
        title: t("billingCancelSubscriptionFailed"),
        analytics: classifyTrpcToastError(error, "subscription.cancel"),
      });
    },
  });

  const reactivateMutation =
    api.cloudBilling.reactivateStripeSubscription.useMutation({
      onSuccess: () => {
        showSuccessToast({
          operation: "subscription.reactivate",
          title: t("billingSubscriptionReactivated"),
          description: "",
        });
        setLoading(false);
        setOpId(null);
        setTimeout(() => window.location.reload(), 500);
      },
      onError: (error) => {
        setLoading(false);
        setOpId(null);
        showToast({
          type: "ERROR",
          title: t("billingReactivateSubscriptionFailed"),
          analytics: classifyTrpcToastError(error, "subscription.reactivate"),
        });
      },
    });

  const onReactivate = async () => {
    try {
      setLoading(true);
      // idempotency key for mutation operations with the stripe api
      let opId = _opId;
      if (!opId) {
        opId = nanoid();
        setOpId(opId);
      }
      await reactivateMutation.mutateAsync({ orgId, opId });
    } catch (error) {
      showToast({
        type: "ERROR",
        title: t("billingReactivateSubscriptionFailed"),
        analytics: classifyTrpcToastError(error, "subscription.reactivate"),
      });
    }
  };

  const onCancel = async () => {
    try {
      setLoading(true);
      // idempotency key for mutation operations with the stripe api
      let opId = _opId;
      if (!opId) {
        opId = nanoid();
        setOpId(opId);
      }
      await cancelMutation.mutateAsync({ orgId, opId });
    } catch (error) {
      showToast({
        type: "ERROR",
        title: t("billingCancelSubscriptionFailed"),
        analytics: classifyTrpcToastError(error, "subscription.cancel"),
      });
    }
  };

  // Reactivate with confirm dialog
  if (cancellation?.isCancelled) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            disabled={loading}
            title={t("billingReactivateSubscription")}
            className={className}
          >
            {loading ? t("billingWorking") : t("billingReactivateSubscription")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {t("billingConfirmReactivationTitle")}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="text-sm">
            <p>{t("billingConfirmReactivationBody")}</p>
            <p>{t("billingConfirmReactivationBody2")}</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("retryMigrationCancel")}</Button>
            </DialogClose>
            <Button variant="default" onClick={onReactivate} disabled={loading}>
              {loading
                ? t("billingReactivating")
                : t("billingConfirmReactivation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Cancel with confirm dialog
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          disabled={loading}
          title={t("billingCancelSubscription")}
        >
          {t("billingCancelSubscription")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("billingConfirmCancellationTitle")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="text-sm">
          <p>{t("billingConfirmCancellationBody")}</p>
          <p>{t("billingConfirmCancellationBody2")}</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("billingKeepSubscription")}</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onCancel} disabled={loading}>
            {loading ? t("billingCancelling") : t("billingConfirmCancellation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
