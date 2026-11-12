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
import { Input } from "@/src/components/ui/input";
import { api } from "@/src/utils/api";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showToast } from "@/src/features/notifications/showToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { nanoid } from "nanoid";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export const BillingDiscountCodeButton = ({ orgId }: { orgId: string }) => {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [opId, setOpId] = useState<string | null>(null);
  const t = useTranslation(enterpriseMessages);

  const utils = api.useUtils();

  const mutation = api.cloudBilling.applyPromotionCode.useMutation({
    onSuccess: async () => {
      showSuccessToast({
        operation: "billing_discount.apply",
        title: t("billingPromotionCodeApplied"),
        description: "",
      });
      setProcessing(false);
      setOpen(false);
      setCode("");
      setOpId(null);
      await Promise.all([
        utils.cloudBilling.getSubscriptionInfo.invalidate(),
        utils.cloudBilling.getInvoices.invalidate(),
      ]);
    },
    onError: (err) => {
      setProcessing(false);
      const analytics = classifyTrpcToastError(err, "billing_discount.apply");
      showToast({
        type: "ERROR",
        title: err.message || t("billingPromotionCodeFailed"),
        analytics:
          analytics.trpcCode === "BAD_REQUEST"
            ? {
                ...analytics,
                errorOrigin: "backend",
                errorCategory: "user_input",
              }
            : analytics,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("billingPromotionCodeAdd")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t("billingPromotionCodeTitle")}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3 text-sm">
          <p>{t("billingPromotionCodeHelp")}</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="PROMO2025"
            disabled={processing}
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={processing}>
              {t("retryMigrationCancel")}
            </Button>
          </DialogClose>
          <Button
            variant="default"
            disabled={processing || !code.trim()}
            onClick={() => {
              setProcessing(true);
              let id = opId;
              if (!id) {
                id = nanoid();
                setOpId(id);
              }
              mutation.mutate({ orgId, code: code.trim(), opId: id });
            }}
          >
            {processing ? t("billingApplying") : t("billingApply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
