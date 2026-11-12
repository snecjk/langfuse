import { Plus } from "@langfuse/icons";

import { Button } from "@/src/components/ui/button";
import { ProviderDialogController } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/ProviderDialogController/ProviderDialogController";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type GatewayProvidersHeaderActionsProps = {
  organizationId: string;
};

/** "Add provider" in the page header of the Providers tab; managers only. */
export function GatewayProvidersHeaderActions({
  organizationId,
}: GatewayProvidersHeaderActionsProps) {
  const t = useTranslation(gatewayMessages);
  return (
    <ProviderDialogController
      organizationId={organizationId}
      surface="overview"
    >
      {({ openAddDialog }) => (
        <Button onClick={openAddDialog}>
          <Plus size="base" __rawClassName="mr-1.5" />
          {t("addProvider")}
        </Button>
      )}
    </ProviderDialogController>
  );
}
