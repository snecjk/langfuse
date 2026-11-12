import { useRouter } from "next/router";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import Page from "@/src/components/layouts/Page";
import { ActionButton } from "@/src/components/ActionButton";
import { PlusIcon } from "@langfuse/icons";
import { ConnectedDashboardWidgetTable } from "@/src/features/widgets/components/WidgetTable/ConnectedDashboardWidgetTable";
import {
  getDashboardTabs,
  DASHBOARD_TABS,
} from "@/src/features/navigation/utils/dashboard-tabs";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { widgetMessages } from "@/src/features/i18n/messages/widgets";

export default function WidgetsPage() {
  const router = useRouter();
  const { projectId } = router.query as { projectId: string };
  const t = useTranslation(widgetMessages);
  const hasCUDAccess = useHasProjectAccess({
    projectId,
    scope: "prompts:CUD",
  });

  return (
    <Page
      headerProps={{
        title: t("widgets"),
        help: {
          description: t("widgetsHelp"),
          href: "https://langfuse.com/docs/metrics/features/custom-dashboards",
        },
        tabsProps: {
          tabs: getDashboardTabs(projectId),
          activeTab: DASHBOARD_TABS.WIDGETS,
        },
        actionButtonsRight: (
          <ActionButton
            icon={<PlusIcon size="base" color="default" aria-hidden="true" />}
            hasAccess={hasCUDAccess}
            href={`/project/${projectId}/widgets/new`}
            trackingEventName="dashboard:new_widget_form_open"
            variant="default"
          >
            {t("newWidget")}
          </ActionButton>
        ),
      }}
    >
      <ConnectedDashboardWidgetTable />
    </Page>
  );
}
