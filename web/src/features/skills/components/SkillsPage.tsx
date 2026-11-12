/* eslint-disable react/no-unstable-nested-components */
import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart4,
  ChevronDown,
  ExternalLink,
  Download,
  FileCode2,
  GitBranch,
  TriangleAlert,
  Plus,
  Terminal,
  Trash,
  Zap,
} from "@langfuse/icons";
import {
  NumberParam,
  ObjectParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import Page from "@/src/components/layouts/Page";
import { useReadPath } from "@/src/features/events/hooks/useReadPath";
import { Button } from "@/src/components/ui/button";
import { Button as DesignSystemButton } from "@/src/components/design-system/Button/Button";
import { DropdownMenu } from "@/src/components/design-system/DropdownMenu/DropdownMenu";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { PaginationBar } from "@/src/features/i18n/components/PaginationBar/PaginationBar";
import { SplashScreen } from "@/src/components/ui/SplashScreen";
import {
  Table,
  type AsyncTableData,
} from "@/src/components/design-system/table/Table";
import { createLinkTableColumn } from "@/src/components/design-system/table/columns/createLinkTableColumn";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import { createNumberTableColumn } from "@/src/components/design-system/table/columns/createNumberTableColumn";
import { createDateTableColumn } from "@/src/components/design-system/table/columns/createDateTableColumn";
import { createBadgeListTableColumn } from "@/src/components/design-system/table/columns/createBadgeListTableColumn";
import {
  DataTableControls,
  DataTableControlsProvider,
} from "@/src/components/table/data-table-controls";
import { FilterToggleButton } from "@/src/components/table/FilterToggleButton";
import { ResizableFilterLayout } from "@/src/components/table/resizable-filter-layout";
import { useSidebarFilterState } from "@/src/features/filters/hooks/useSidebarFilterState";
import { TableSearchBar } from "@/src/features/search-bar/components/TableSearchBar";
import { toObservedOptions } from "@/src/features/search-bar/lib/observed-options";
import { useFullTextSearch } from "@/src/features/search-bar/hooks/useFullTextSearch";
import useProjectIdFromURL from "@/src/hooks/useProjectIdFromURL";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { api } from "@/src/utils/api";
import { type RouterOutput } from "@/src/utils/types";
import {
  SKILLS_FIELD_REGISTRY,
  skillsFilterConfig,
} from "../constants/skillsFilterConfig";
import { ImportSkillsDialog } from "./ImportSkillsDialog";
import { InstallSkillDialog } from "./InstallSkillDialog";
import { useSkillInstallOptions } from "../hooks/useSkillInstallOptions";
import {
  DEFAULT_SKILL_LIST_ORDER_BY,
  SkillListOrderBySchema,
} from "../constants/skillsSorting";
import { FeatureReleaseStatus } from "@/src/components/design-system/FeatureReleaseStatus/FeatureReleaseStatus";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

type SkillRow = RouterOutput["skills"]["all"]["data"][number];

export function SkillsPage() {
  const t = useTranslation(skillMessages);
  const { isV3Legacy } = useReadPath();
  const projectId = useProjectIdFromURL() ?? "";
  const canCreate = useHasProjectAccess({ projectId, scope: "skills:CUD" });
  const { query: filterOptions } = useSkillInstallOptions(projectId, "");

  return (
    <DialogController
      renderDialog={() => (
        <InstallSkillDialog
          projectId={projectId}
          initialValues={{
            by: "all",
            name: "",
            version: null,
            label: "production",
            tag: filterOptions.data?.tags[0]?.value ?? "my-tag",
          }}
          labels={["production", "latest"]}
          tags={filterOptions.data?.tags.map((tag) => tag.value) ?? []}
        />
      )}
    >
      {({ openDialog }) => (
        <Page
          headerProps={{
            title: t("skills"),
            titleBadges: (
              <>
                <FeatureReleaseStatus status="beta" />
                {isV3Legacy && (
                  <Badge
                    text={t("skillTracingRequiresV4")}
                    title={t("skillTracingRequiresV4Help")}
                    color="warning"
                    size="md"
                    leadingIcon={TriangleAlert}
                  />
                )}
              </>
            ),
            help: {
              description: t("skillsHelp"),
              href: "https://langfuse.com/docs/skill-management/get-started",
            },
            actionButtonsRight: (
              <SkillsHeaderActions
                projectId={projectId}
                canCreate={canCreate}
                installDisabled={filterOptions.isPending}
                onInstall={openDialog}
              />
            ),
            actionButtonsMenu: ({ closeMenu }) => (
              <SkillsHeaderActions
                projectId={projectId}
                canCreate={canCreate}
                installDisabled={filterOptions.isPending}
                onInstall={openDialog}
                closeMenu={() => closeMenu({ handoffFocus: true })}
              />
            ),
          }}
        >
          <SkillsList
            key={projectId}
            projectId={projectId}
            canDelete={canCreate}
          />
        </Page>
      )}
    </DialogController>
  );
}

type SkillsHeaderActionsProps = {
  projectId: string;
  canCreate: boolean;
  installDisabled: boolean;
  onInstall: () => void;
  closeMenu?: () => void;
};

function SkillsHeaderActions({
  projectId,
  canCreate,
  installDisabled,
  onInstall,
  closeMenu,
}: SkillsHeaderActionsProps) {
  const t = useTranslation(skillMessages);
  const capture = usePostHogClientCapture();
  const canReadAutomations = useHasProjectAccess({
    projectId,
    scope: "automations:read",
  });

  function handleInstall() {
    closeMenu?.();
    onInstall();
  }

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2">
      {canReadAutomations && (
        <DesignSystemButton
          href={`/project/${projectId}/automations`}
          text={t("automations")}
          icon={Zap}
          variant="secondary"
        />
      )}
      <DropdownMenu
        ariaLabel={t("useSkill")}
        items={[
          {
            type: "item",
            id: "install",
            title: t("installWithCLI"),
            icon: Terminal,
            disabled: installDisabled
              ? { reason: t("loadingInstallationOptions") }
              : undefined,
            onClick: handleInstall,
          },
          {
            type: "item",
            id: "api",
            title: t("api"),
            icon: ExternalLink,
            href: "https://api.reference.langfuse.com/#tag/skills",
            linkTarget: "_blank",
          },
        ]}
      >
        {({ getTriggerProps }) => (
          <DesignSystemButton
            text={t("useSkill")}
            icon={ChevronDown}
            variant="secondary"
            {...getTriggerProps()}
          />
        )}
      </DropdownMenu>
      <ImportSkillsDialog key={projectId} projectId={projectId}>
        {(openDialog) => (
          <DropdownMenu
            ariaLabel={t("newSkill")}
            disabled={!canCreate}
            items={[
              {
                type: "item",
                id: "create",
                title: t("createFromScratch"),
                icon: Plus,
                href: `/project/${projectId}/skills/new`,
                onAfterNavigate: () => {
                  closeMenu?.();
                  capture("skills:new_form_open");
                },
              },
              {
                type: "item",
                id: "import",
                title: t("importSkills"),
                icon: Download,
                onClick: openDialog,
              },
            ]}
          >
            {({ getTriggerProps }) => (
              <DesignSystemButton
                text={t("newSkill")}
                icon={ChevronDown}
                disabled={!canCreate}
                {...getTriggerProps()}
              />
            )}
          </DropdownMenu>
        )}
      </ImportSkillsDialog>
    </div>
  );
}

function SkillsList({
  projectId,
  canDelete,
}: {
  projectId: string;
  canDelete: boolean;
}) {
  const t = useTranslation(skillMessages);
  const utils = api.useUtils();
  const capture = usePostHogClientCapture();
  const [tableState, setTableState] = useQueryParams({
    pageIndex: withDefault(NumberParam, 0),
    pageSize: withDefault(NumberParam, 50),
    orderBy: withDefault(ObjectParam, DEFAULT_SKILL_LIST_ORDER_BY),
  });
  const parsedOrderBy = SkillListOrderBySchema.safeParse(tableState.orderBy);
  const orderBy = parsedOrderBy.success
    ? parsedOrderBy.data
    : DEFAULT_SKILL_LIST_ORDER_BY;
  const paginationState = {
    pageIndex: Number.isFinite(tableState.pageIndex)
      ? Math.max(0, Math.floor(tableState.pageIndex))
      : 0,
    pageSize: Number.isFinite(tableState.pageSize)
      ? Math.max(1, Math.min(100, Math.floor(tableState.pageSize)))
      : 50,
  };
  const { searchQuery, setSearchQuery } = useFullTextSearch({
    tableAllowsFullTextSearch: false,
  });
  const filterOptions = api.skills.filterOptions.useQuery(
    { projectId },
    { enabled: Boolean(projectId) },
  );
  const observedOptions = useMemo(
    () => toObservedOptions(filterOptions.data, filterOptions.isPending),
    [filterOptions.data, filterOptions.isPending],
  );
  const queryFilter = useSidebarFilterState(
    skillsFilterConfig,
    observedOptions ?? { tags: [] },
    {
      stateLocation: "urlAndSessionStorage",
      sessionFilterContextId: projectId,
      loading: filterOptions.isPending,
      isV4: false,
      onExplicitFilterStateChange: () => setTableState({ pageIndex: 0 }),
    },
  );
  const skills = api.skills.all.useQuery(
    {
      projectId,
      page: paginationState.pageIndex + 1,
      limit: paginationState.pageSize,
      search: searchQuery || undefined,
      filter: queryFilter.filterState,
      orderBy,
    },
    { enabled: Boolean(projectId) },
  );
  const deleteSkill = api.skills.deleteSkill.useMutation({
    onSuccess: async () => {
      capture("skills:delete");
      if (skills.data?.data.length === 1 && paginationState.pageIndex > 0) {
        setTableState({ pageIndex: paginationState.pageIndex - 1 });
      }
      await utils.skills.invalidate();
    },
  });

  const tableData = useMemo<AsyncTableData<SkillRow[]>>(() => {
    if (skills.isError) return { status: "error", error: skills.error.message };
    if (skills.data) return { status: "success", data: skills.data.data };
    return { status: "loading" };
  }, [skills.isError, skills.error, skills.data]);
  const hasFilters = Boolean(searchQuery) || queryFilter.filterState.length > 0;
  const isEmptyProject =
    skills.data?.meta.totalItems === 0 &&
    !hasFilters &&
    paginationState.pageIndex === 0;
  const columns = [
    createLinkTableColumn<SkillRow>({
      accessorKey: "name",
      header: t("name"),
      enableSorting: true,
      size: 220,
      cellClassName: "ph-no-capture",
      getCell: (name) =>
        name
          ? {
              type: "link",
              props: {
                value: name,
                path: `/project/${projectId}/skills/${encodeURIComponent(name)}`,
              },
            }
          : undefined,
    }),
    createTextTableColumn<SkillRow>({
      accessorKey: "description",
      header: t("description"),
      size: 280,
      cellClassName: "ph-no-capture",
    }),
    createNumberTableColumn<SkillRow>({
      accessorKey: "latestVersion",
      header: t("latestVersion"),
      enableSorting: true,
      size: 100,
      formatter: (version) => `v${version}`,
    }),
    createNumberTableColumn<SkillRow>({
      accessorKey: "productionVersion",
      header: t("productionVersion"),
      size: 140,
      formatter: (version) => `v${version}`,
      emptyValue: t("notSet"),
    }),
    createBadgeListTableColumn<SkillRow>({
      accessorKey: "tags",
      header: t("tags"),
      enableSorting: true,
      size: 120,
      cellClassName: "ph-no-capture",
    }),
    createDateTableColumn<SkillRow>({
      accessorKey: "latestVersionCreatedAt",
      header: t("latestVersionCreated"),
      enableSorting: true,
      size: 175,
    }),
  ];

  const table = (
    <DataTableControlsProvider tableName="skills" defaultSidebarCollapsed>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-2 px-3 py-2 md:p-0">
          <div className="md:hidden">
            <FilterToggleButton filterState={queryFilter.filterState} />
          </div>
          <div className="min-w-0 flex-1 p-2">
            <TableSearchBar
              inset
              size="large"
              key={`${projectId}:${queryFilter.draftResetKey}`}
              projectId={projectId}
              tableName="skills"
              registry={SKILLS_FIELD_REGISTRY}
              filterState={queryFilter.searchBarFilterState}
              setFilterState={queryFilter.setFilterState}
              observed={observedOptions}
              isV4={false}
              search={{
                query: searchQuery,
                type: ["id"],
                setQuery: (query) => {
                  setTableState({ pageIndex: 0 });
                  setSearchQuery(query);
                },
              }}
            />
          </div>
        </div>
        <ResizableFilterLayout>
          <DataTableControls queryFilter={queryFilter} />
          <DialogController<string>
            onBeforeClose={() => !deleteSkill.isPending}
            onDismiss={deleteSkill.reset}
            renderDialog={({ state: name, closeDialog }) => (
              <Dialog
                title={t("deleteSkill")}
                actions={[
                  {
                    label: t("deleteSkillConfirm"),
                    variant: "destructive",
                    disabled: !canDelete,
                    loading: deleteSkill.isPending,
                    onClick: async () => {
                      try {
                        await deleteSkill.mutateAsync({ projectId, name });
                        closeDialog();
                      } catch {
                        // The mutation exposes its error in the dialog.
                      }
                    },
                  },
                ]}
              >
                <Dialog.Body>
                  <p className="text-muted-foreground">
                    {t("deleteSkillDescription", { name })}
                  </p>
                  {deleteSkill.error ? (
                    <p
                      role="alert"
                      className="ph-no-capture text-destructive whitespace-pre-wrap"
                    >
                      {deleteSkill.error.message}
                    </p>
                  ) : null}
                </Dialog.Body>
              </Dialog>
            )}
          >
            {({ openDialog }) => (
              <div className="flex min-h-0 flex-1 flex-col">
                <Table
                  tableName="skills"
                  columns={columns}
                  data={tableData}
                  orderBy={orderBy}
                  setOrderBy={(nextOrderBy) => {
                    const parsed =
                      SkillListOrderBySchema.safeParse(nextOrderBy);
                    setTableState({
                      orderBy: parsed.success
                        ? parsed.data
                        : DEFAULT_SKILL_LIST_ORDER_BY,
                      pageIndex: 0,
                    });
                  }}
                  loadingRowCount={Math.min(paginationState.pageSize, 8)}
                  noResultsMessage={t("noSkillsMatch")}
                  actions={(skill) => [
                    {
                      type: "item",
                      id: "delete",
                      title: t("deleteSkill"),
                      icon: Trash,
                      variant: "destructive",
                      disabled: canDelete
                        ? undefined
                        : { reason: t("noWriteAccess") },
                      onClick: () => openDialog(skill.name),
                    },
                  ]}
                />
                <PaginationBar
                  mode="offset"
                  totalCount={skills.data?.meta.totalItems ?? null}
                  state={paginationState}
                  onChange={setTableState}
                />
              </div>
            )}
          </DialogController>
        </ResizableFilterLayout>
      </div>
    </DataTableControlsProvider>
  );

  return (
    <ImportSkillsDialog projectId={projectId}>
      {(openImportDialog) =>
        isEmptyProject ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EmptySkills
              projectId={projectId}
              canCreate={canDelete}
              onOpen={() => capture("skills:new_form_open")}
              onImport={openImportDialog}
            />
          </div>
        ) : (
          table
        )
      }
    </ImportSkillsDialog>
  );
}

function NewSkillButton({
  canCreate,
  href,
  onOpen,
}: {
  canCreate: boolean;
  href: string;
  onOpen: () => void;
}) {
  const t = useTranslation(skillMessages);
  if (!canCreate) {
    return (
      <Button disabled title={t("noWriteAccess")}>
        <Plus size="base" __rawClassName="mr-1.5" /> {t("newSkill")}
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href={href} onClick={onOpen}>
        <Plus size="base" __rawClassName="mr-1.5" /> {t("newSkill")}
      </Link>
    </Button>
  );
}

function EmptySkills({
  projectId,
  canCreate,
  onOpen,
  onImport,
}: {
  projectId: string;
  canCreate: boolean;
  onOpen: () => void;
  onImport: () => void;
}) {
  const t = useTranslation(skillMessages);
  return (
    <SplashScreen
      title={t("getStartedWithSkills")}
      description={t("getStartedWithSkillsDescription")}
      primaryAction={{
        label: t("newSkill"),
        component: (
          <NewSkillButton
            canCreate={canCreate}
            href={`/project/${projectId}/skills/new`}
            onOpen={onOpen}
          />
        ),
      }}
      secondaryAction={{
        label: t("importSkills"),
        component: (
          <DesignSystemButton
            text={t("importSkills")}
            icon={Download}
            variant="secondary"
            disabled={!canCreate}
            onClick={onImport}
          />
        ),
      }}
      valuePropositions={[
        {
          title: t("manageSkills"),
          description: t("manageSkillsDescription"),
          icon: FileCode2,
        },
        {
          title: t("trackSkillUsage"),
          description: t("trackSkillUsageDescription"),
          icon: BarChart4,
        },
        {
          title: t("versionAndIterate"),
          description: t("versionAndIterateDescription"),
          icon: GitBranch,
        },
        {
          title: t("useViaCLIOrSDK"),
          description: t("useViaCLIOrSDKDescription"),
          icon: Terminal,
        },
      ]}
    >
      {!canCreate ? (
        <p className="text-muted-foreground text-center text-sm">
          {t("askMemberToCreateSkill")}
        </p>
      ) : null}
    </SplashScreen>
  );
}
