import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { evaluationsMessages } from "@/src/features/i18n/messages/evaluations";
import { useRouter } from "next/router";
import ScoresTable from "@/src/features/scores/ScoresTable";
import { TablePeekViewTraceDetail } from "@/src/components/table/peek/TablePeekViewTraceDetail";
import Page from "@/src/components/layouts/Page";
import { api } from "@/src/utils/api";
import { ScoresOnboarding } from "@/src/components/onboarding/ScoresOnboarding";
import {
  getScoresTabs,
  SCORES_TABS,
} from "@/src/features/navigation/utils/scores-tabs";
import { useReadPath } from "@/src/features/events/hooks/useReadPath";

export default function ScoresPage() {
  const t = useTranslation(evaluationsMessages);
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { isV4 } = useReadPath();

  // Check if the user has any scores
  const { data: hasAnyScore, isLoading } = api.scores.hasAny.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
      refetchInterval: 10_000,
    },
  );

  const showOnboarding = !isLoading && !hasAnyScore;

  return (
    <Page
      headerProps={{
        title: t("scores"),
        help: {
          description: t("scoreHelp"),
          href: "https://langfuse.com/docs/evaluation/overview",
        },
        tabsProps: {
          tabs: getScoresTabs(projectId),
          activeTab: SCORES_TABS.SCORES,
        },
      }}
      scrollable={showOnboarding}
    >
      {/* Show onboarding screen if user has no scores */}
      {showOnboarding ? (
        <ScoresOnboarding />
      ) : (
        <ScoresTable
          projectId={projectId}
          showControlsInPageHeader
          showAllEnvironments={router.query.showAllEnvironments === "true"}
          renderTracePeek={({ closePeek, expandPeek }) => (
            <TablePeekViewTraceDetail
              projectId={projectId}
              itemType="TRACE"
              tableName="scores"
              closePeek={closePeek}
              expandPeek={expandPeek}
              isV4={isV4}
            />
          )}
        />
      )}
    </Page>
  );
}
