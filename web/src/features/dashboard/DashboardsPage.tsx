import { useRouter } from "next/router";
import Page from "@/src/components/layouts/Page";
import { ConnectedDashboardTable } from "@/src/features/dashboard/components/DashboardTable/ConnectedDashboardTable";
import { ActionButton } from "@/src/components/ActionButton";
import { PlusIcon } from "@langfuse/icons";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import {
  getDashboardTabs,
  DASHBOARD_TABS,
} from "@/src/features/navigation/utils/dashboard-tabs";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboard";

export default function DashboardsPage() {
  const router = useRouter();
  const { projectId } = router.query as { projectId: string };
  const t = useTranslation(dashboardMessages);
  const hasCUDAccess = useHasProjectAccess({
    projectId,
    scope: "dashboards:CUD",
  });

  return (
    <Page
      headerProps={{
        title: t("dashboards"),
        help: {
          description: t("manageCreateDashboards"),
          href: "https://langfuse.com/docs/metrics/features/custom-dashboards",
        },
        tabsProps: {
          tabs: getDashboardTabs(projectId),
          activeTab: DASHBOARD_TABS.DASHBOARDS,
        },
        actionButtonsRight: (
          <ActionButton
            icon={<PlusIcon size="base" color="default" aria-hidden="true" />}
            hasAccess={hasCUDAccess}
            href={`/project/${projectId}/dashboards/new`}
            trackingEventName="dashboard:new_dashboard_form_open"
            variant="default"
          >
            {t("newDashboard")}
          </ActionButton>
        ),
      }}
    >
      <ConnectedDashboardTable />
    </Page>
  );
}
