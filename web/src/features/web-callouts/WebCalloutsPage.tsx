import ContainerPage from "@/src/components/layouts/ContainerPage";
import { StatusBadge } from "@/src/components/ui/StatusBadge/StatusBadge";
import { useWebCallouts } from "@/src/features/web-callouts/useWebCallouts";
import { WebCalloutSettingsPage } from "@/src/features/web-callouts/components/WebCalloutSettingsPage";
import { RouteParamsPendingFallback } from "@/src/components/RouteParamsPendingFallback/RouteParamsPendingFallback";
import { useRouter } from "next/router";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export default function WebCalloutsPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string | undefined;
  const { status } = useWebCallouts(projectId);
  const t = useTranslation(integrationMessages);

  if (!projectId) {
    return <RouteParamsPendingFallback />;
  }

  return (
    <ContainerPage
      headerProps={{
        title: t("webCalloutsTitle"),
        breadcrumb: [
          { name: t("settings"), href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: status && <StatusBadge type={status} />,
      }}
    >
      <WebCalloutSettingsPage projectId={projectId} />
    </ContainerPage>
  );
}
