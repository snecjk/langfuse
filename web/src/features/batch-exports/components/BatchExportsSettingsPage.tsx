import Header from "@/src/components/layouts/header";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { ConnectedBatchExportsTable } from "@/src/features/batch-exports/components/BatchExportsTable/ConnectedBatchExportsTable";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { batchMessages } from "@/src/features/i18n/messages/batch";

export function BatchExportsSettingsPage(props: { projectId: string }) {
  const t = useTranslation(batchMessages);
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "batchExports:read",
  });

  return (
    <>
      <Header title={t("exportsPageTitle")} />
      <p className="mb-4 text-sm">{t("exportsPageDescription")}</p>
      {hasAccess ? (
        <ConnectedBatchExportsTable projectId={props.projectId} />
      ) : (
        <Alert>
          <Alert.Title>{t("exportsAccessDenied")}</Alert.Title>
          <Alert.Description>{t("exportsNoPermission")}</Alert.Description>
        </Alert>
      )}
    </>
  );
}
