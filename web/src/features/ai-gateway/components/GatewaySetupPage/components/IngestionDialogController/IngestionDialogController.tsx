import type { ReactNode } from "react";

import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { IngestionDialog } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/IngestionDialogController/components/IngestionDialog/IngestionDialog";
import { useSaveGatewayIngestion } from "@/src/features/ai-gateway/components/GatewaySetupPage/hooks/useSaveGatewayIngestion";
import type {
  GatewayConfig,
  GatewayIngestionSettings,
  GatewayProject,
} from "@/src/features/ai-gateway/components/GatewaySetupPage/types/gatewaySetup";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type IngestionDialogControllerProps = {
  organizationId: string;
  config: GatewayConfig | null;
  projects: GatewayProject[];
  children: (control: { openDialog: () => void }) => ReactNode;
};

export function IngestionDialogController({
  organizationId,
  config,
  projects,
  children,
}: IngestionDialogControllerProps) {
  const t = useTranslation(gatewayMessages);
  const { saveIngestion, isSaving } = useSaveGatewayIngestion(
    organizationId,
    "overview",
  );

  async function handleSave(settings: GatewayIngestionSettings) {
    const isSaved = await saveIngestion(settings);
    if (isSaved) {
      showSuccessToast({
        operation: "aiGateway.updateConfig",
        title: t("ingestionSaved"),
        description: t("ingestionSavedDescription"),
      });
    }
    return isSaved;
  }

  return (
    <DialogController
      renderDialog={({ closeDialog }) => (
        <IngestionDialog
          config={config}
          projects={projects}
          isSaving={isSaving}
          onSave={handleSave}
          onSaved={closeDialog}
        />
      )}
    >
      {children}
    </DialogController>
  );
}
