import { Pencil, RefreshCw, Trash2 } from "@langfuse/icons";

import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import type { GatewayConnection } from "@/src/features/ai-gateway/types/gatewayProvider";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type ManagedProviderCardActionsProps = {
  connection: GatewayConnection;
  isRetrying: boolean;
  onEdit: (connection: GatewayConnection) => void;
  onRetry: (connection: GatewayConnection) => void;
  onDelete: (connection: GatewayConnection) => void;
};

export function ManagedProviderCardActions({
  connection,
  isRetrying,
  onEdit,
  onRetry,
  onDelete,
}: ManagedProviderCardActionsProps) {
  const t = useTranslation(gatewayMessages);
  const handleEdit = () => onEdit(connection);
  const handleRetry = () => onRetry(connection);
  const handleDelete = () => onDelete(connection);

  return (
    <>
      <Tooltip label={t("refreshModels")}>
        {({ getTriggerProps }) => (
          <IconButton
            {...getTriggerProps()}
            icon={RefreshCw}
            label={t("refreshModelsFor", { name: connection.name })}
            size="sm"
            disabled={isRetrying}
            onClick={handleRetry}
          />
        )}
      </Tooltip>
      <Tooltip label={t("editCredential")}>
        {({ getTriggerProps }) => (
          <IconButton
            {...getTriggerProps()}
            icon={Pencil}
            label={t("editFor", { name: connection.name })}
            size="sm"
            onClick={handleEdit}
          />
        )}
      </Tooltip>
      <Tooltip label={t("deleteCredential")}>
        {({ getTriggerProps }) => (
          <IconButton
            {...getTriggerProps()}
            icon={Trash2}
            label={t("deleteFor", { name: connection.name })}
            size="sm"
            onClick={handleDelete}
          />
        )}
      </Tooltip>
    </>
  );
}
