import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import Page from "@/src/components/layouts/Page";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboard";

export default function NewDashboardPage() {
  const router = useRouter();
  const { projectId } = router.query as { projectId: string };
  const t = useTranslation(dashboardMessages);

  // State for new dashboard
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");

  // Check project access
  const hasCUDAccess = useHasProjectAccess({
    projectId,
    scope: "dashboards:CUD",
  });

  // Mutation for creating a new dashboard
  const createDashboard = api.dashboard.createDashboard.useMutation({
    onSuccess: (data) => {
      showSuccessToast({
        operation: "dashboard.create",
        title: t("dashboardCreated"),
        description: t("dashboardCreatedDesc"),
      });
      // Navigate to the newly created dashboard
      router.push(`/project/${projectId}/dashboards/${data.id}`);
    },
    onError: (error) => {
      showErrorToast(
        t("errorCreateDashboard"),
        error.message,
        classifyTrpcToastError(error, "dashboard.create"),
      );
    },
  });

  // Handle form submission
  const handleCreateDashboard = () => {
    if (dashboardName.trim()) {
      createDashboard.mutate({
        projectId,
        name: dashboardName,
        description: dashboardDescription,
      });
    } else {
      showErrorToast(t("dashboardNameRequired"), {
        operation: "dashboard.create",
        errorOrigin: "frontend",
        errorCategory: "user_input",
      });
    }
  };

  return (
    <Page
      withPadding
      headerProps={{
        title: t("createDashboard"),
        help: {
          description: "Create a new dashboard for your project",
        },
        actionButtonsRight: (
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/project/${projectId}/dashboards`)}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreateDashboard}
              disabled={
                !dashboardName.trim() ||
                createDashboard.isPending ||
                !hasCUDAccess
              }
              loading={createDashboard.isPending}
            >
              {t("createDashboard")}
            </Button>
          </>
        ),
      }}
    >
      <div className="mx-auto my-8 max-w-xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="dashboard-name">{t("dashboardName")}</Label>
          <Input
            id="dashboard-name"
            value={dashboardName}
            onChange={(e) => {
              setDashboardName(e.target.value);
            }}
            placeholder={t("dashboardNamePlaceholder")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dashboard-description">{t("description")}</Label>
          <Textarea
            id="dashboard-description"
            value={dashboardDescription}
            onChange={(e) => {
              setDashboardDescription(e.target.value);
            }}
            placeholder={t("dashboardDescriptionPlaceholder")}
            rows={4}
          />
        </div>

        <div className="text-muted-foreground text-sm">
          <p>
            After creating the dashboard, you can add widgets to visualize your
            data.
          </p>
        </div>
      </div>
    </Page>
  );
}
