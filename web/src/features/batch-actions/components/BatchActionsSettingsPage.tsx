import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { batchMessages } from "@/src/features/i18n/messages/batch";
import { ConnectedBatchActionsTable } from "./BatchActionsTable/ConnectedBatchActionsTable";

export function BatchActionsSettingsPage(props: { projectId: string }) {
  const t = useTranslation(batchMessages);
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "datasets:CUD",
  });

  return (
    <>
      <Header title={t("batchActionsPageTitle")} />
      <p className="mb-4 text-sm">{t("batchActionsPageDescription")}</p>
      {hasAccess ? (
        <ConnectedBatchActionsTable projectId={props.projectId} />
      ) : (
        <Alert>
          <Alert.Title>{t("batchActionsAccessDenied")}</Alert.Title>
          <Alert.Description>{t("batchActionsNoPermission")}</Alert.Description>
        </Alert>
      )}
    </>
  );
}
