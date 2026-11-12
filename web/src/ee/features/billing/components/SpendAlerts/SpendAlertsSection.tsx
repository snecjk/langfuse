import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "@langfuse/icons";
import { ConnectedSpendAlertsTable } from "./ConnectedSpendAlertsTable";
import { ConnectedSpendAlertDialogController } from "./ConnectedSpendAlertDialogController";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

interface SpendAlertsSectionProps {
  orgId: string;
}

export function SpendAlertsSection({ orgId }: SpendAlertsSectionProps) {
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const t = useTranslation(enterpriseMessages);

  return (
    <ConnectedSpendAlertDialogController
      orgId={orgId}
      onSuccess={() => setRefetchTrigger((prev) => prev + 1)}
    >
      {({ openDialog }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between pt-4">
            <div>
              <h3 className="font-bold">{t("spendAlertsTitle")}</h3>
              <p className="text-muted-foreground max-w-prose text-sm">
                {t("spendAlertsDescription")}
              </p>
              <p className="text-muted-foreground max-w-prose text-sm"></p>
            </div>

            <Button onClick={() => openDialog({ mode: "create" })}>
              <Plus size="base" __rawClassName="mr-2" />
              {t("spendAlertsCreate")}
            </Button>
          </div>

          <ConnectedSpendAlertsTable orgId={orgId} key={refetchTrigger} />
        </div>
      )}
    </ConnectedSpendAlertDialogController>
  );
}
