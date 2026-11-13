import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { coreMessages } from "@/src/features/i18n/messages/core";
import { api } from "@/src/utils/api";
import {
  getDatasetTabs,
  DATASET_TABS,
} from "@/src/features/navigation/utils/dataset-tabs";
import { DatasetItemsTable } from "@/src/features/datasets/components/DatasetItemsTable";
import { DetailPageNav } from "@/src/features/navigate-detail-pages/DetailPageNav";
import { NewDatasetItemButton } from "@/src/features/datasets/components/NewDatasetItemButton";
import { UploadDatasetCsvButton } from "@/src/features/datasets/components/UploadDatasetCsvButton";
import { Button } from "@/src/components/ui/button";
import { History, MoreVertical } from "@langfuse/icons";
import Page from "@/src/components/layouts/Page";
import { DatasetItemsOnboarding } from "@/src/components/onboarding/DatasetItemsOnboarding";
import { SidePanel, SidePanelContent } from "@/src/components/ui/side-panel";
import { DatasetVersionHistoryPanel } from "@/src/features/datasets/components/DatasetVersionHistoryPanel";
import { DatasetVersionWarningBanner } from "@/src/features/datasets/components/DatasetVersionWarningBanner";
import { useState } from "react";
import { useDatasetVersion } from "@/src/features/datasets/hooks/useDatasetVersion";
import { getDatasetBreadcrumb } from "@/src/features/datasets/utils/getDatasetBreadcrumb";
import { RouteParamsPendingFallback } from "@/src/components/RouteParamsPendingFallback/RouteParamsPendingFallback";
import { useReadyRouteParams } from "@/src/hooks/useReadyRouteParams";
import { DatasetActionMenu } from "@/src/features/datasets/components/DatasetActionMenu";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

export default function DatasetItemsPage() {
  const route = useReadyRouteParams(["projectId", "datasetId"]);
  if (!route.ready) return <RouteParamsPendingFallback />;
  return (
    <DatasetItemsView
      projectId={route.params.projectId}
      datasetId={route.params.datasetId}
    />
  );
}

function DatasetItemsView({
  projectId,
  datasetId,
}: {
  projectId: string;
  datasetId: string;
}) {
  const t = useTranslation(coreMessages);
  const dt = useTranslation(datasetsMessages);
  const { selectedVersion, resetToLatest } = useDatasetVersion();
  const isViewingOldVersion = selectedVersion !== null;

  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);

  const dataset = api.datasets.byId.useQuery(
    {
      datasetId,
      projectId,
    },
    { enabled: Boolean(projectId) && Boolean(datasetId) },
  );

  const totalDatasetItemCount = api.datasets.countItemsByDatasetId.useQuery(
    {
      projectId,
      datasetId,
    },
    { enabled: Boolean(projectId) && Boolean(datasetId) },
  );

  const showOnboarding =
    totalDatasetItemCount.isSuccess && totalDatasetItemCount.data === 0;

  // Fetch change counts since selected version
  const changeCounts = api.datasets.countChangesSinceVersion.useQuery(
    {
      projectId,
      datasetId,
      version: selectedVersion!,
    },
    {
      enabled: selectedVersion !== null,
    },
  );

  const handlePanelOpenChange = (open: boolean) => {
    setIsVersionPanelOpen(open);
  };

  const breadcrumb = getDatasetBreadcrumb(
    projectId,
    datasetId,
    dataset.data?.name,
    dt("datasets"),
  );

  return (
    <Page
      headerProps={{
        title: dataset.data?.name ?? "",
        itemType: "DATASET",
        breadcrumb,
        tabsProps: {
          tabs: getDatasetTabs(projectId, datasetId),
          activeTab: DATASET_TABS.ITEMS,
        },
        actionButtonsRight: (
          <>
            {!showOnboarding && (
              <>
                <NewDatasetItemButton
                  projectId={projectId}
                  datasetId={datasetId}
                />
                <UploadDatasetCsvButton
                  projectId={projectId}
                  datasetId={datasetId}
                />
              </>
            )}
            <DetailPageNav
              currentId={datasetId}
              path={(entry) =>
                `/project/${projectId}/datasets/${entry.id}/items/`
              }
              listKey="datasets"
            />
            <DatasetActionMenu
              projectId={projectId}
              datasetId={datasetId}
              datasetName={dataset.data?.name ?? ""}
              datasetDescription={dataset.data?.description ?? undefined}
              datasetMetadata={dataset.data?.metadata}
              datasetInputSchema={dataset.data?.inputSchema ?? undefined}
              datasetExpectedOutputSchema={
                dataset.data?.expectedOutputSchema ?? undefined
              }
            >
              {({ getTriggerProps }) => (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t("datasetActions")}
                  {...getTriggerProps()}
                >
                  <MoreVertical size="base" color="default" />
                </Button>
              )}
            </DatasetActionMenu>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsVersionPanelOpen(!isVersionPanelOpen)}
              title={t("versionHistory")}
            >
              <History size="base" color="default" />
            </Button>
          </>
        ),
      }}
    >
      {showOnboarding ? (
        <DatasetItemsOnboarding projectId={projectId} datasetId={datasetId} />
      ) : (
        <div className="grid flex-1 grid-cols-[1fr_auto] overflow-hidden">
          <div className="flex h-full flex-col overflow-hidden">
            {isViewingOldVersion && selectedVersion && (
              <DatasetVersionWarningBanner
                selectedVersion={selectedVersion}
                resetToLatest={resetToLatest}
                changeCounts={changeCounts.data}
              />
            )}
            <DatasetItemsTable projectId={projectId} datasetId={datasetId} />
          </div>
          <SidePanel
            id="version-history-panel"
            openState={{
              open: isVersionPanelOpen,
              onOpenChange: handlePanelOpenChange,
            }}
            mobileTitle={t("versionHistory")}
          >
            <SidePanelContent className="h-full">
              <DatasetVersionHistoryPanel
                projectId={projectId}
                datasetId={datasetId}
              />
            </SidePanelContent>
          </SidePanel>
        </div>
      )}
    </Page>
  );
}
