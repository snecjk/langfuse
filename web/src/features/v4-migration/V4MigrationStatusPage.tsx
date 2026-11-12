/* eslint-disable no-nested-ternary, react/no-unstable-nested-components */
/* eslint-disable @repo/no-null-render */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ArrowRight } from "@langfuse/icons";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { Card } from "@/src/components/ui/card";
import { Table } from "@/src/components/design-system/table/Table";
import { type LangfuseColumnDef } from "@/src/components/table/types";
import { createTextTableColumn } from "@/src/components/design-system/table/columns/createTextTableColumn";
import {
  useCopyMigrationPrompt,
  useHasV4MigrationDeadline,
  useV4MigrationTitle,
  V4MigrationDeadlineNote,
  V4MigrationDocsLink,
  V4_MIGRATION_DEADLINE,
} from "@/src/features/v4-migration/V4MigrationContent";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { api } from "@/src/utils/api";
import { formatCompactRelativeTime } from "@/src/utils/dates";
import { V4MigrationStatusDot } from "@/src/features/v4-migration/V4MigrationBadgeContent";
import { useV4UpgradeUiEnabled } from "@/src/features/v4-migration/useV4UpgradeUiEnabled";
import { useOpenV4MigrationPanel } from "@/src/features/v4-migration/hooks/useOpenV4MigrationPanel";
import {
  useAccountV4MigrationData,
  type V4MigrationOrganization,
} from "@/src/features/v4-migration/hooks/useV4MigrationData";
import {
  getProjectMigrationReadiness,
  type MigrationActionState,
  type MigrationCountState,
  type ProjectMigrationReadiness,
  type ProjectMigrationStatus,
} from "@/src/features/v4-migration/migrationData";
import { PARTNER_INTEGRATION_FAQ_URL } from "@/src/features/v4-migration/partnerIntegrationDocs";
import { V4MigrationLoadingState } from "@/src/features/v4-migration/V4MigrationLoadingState";
import { useReadPath } from "@/src/features/events/hooks/useReadPath";
import { V4PreviewToggleRow } from "@/src/features/events/components/V4SidebarToggle";
import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

const V4_DOCS_URL = "https://langfuse.com/docs/v4";
const SDK_UPGRADE_URL =
  "https://langfuse.com/docs/observability/sdk/upgrade-path";
const DATA_MODEL_URL = "https://langfuse.com/docs/observability/data-model";
const OBSERVATIONS_FAQ_URL =
  "https://langfuse.com/faq/all/explore-observations-in-v4";
const API_REFERENCE_URL = "https://api.reference.langfuse.com";

function FaqLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-dark-blue hover:underline"
    >
      {children}
    </a>
  );
}

function AffectedCell({ count }: { count: MigrationCountState }) {
  const t = useTranslation(enterpriseMessages);
  if (count.status === "loading") {
    return (
      <span className="text-foreground-tertiary">
        {t("migrationCheckingShort")}
      </span>
    );
  }
  if (count.status === "error") {
    return (
      <span className="text-foreground-tertiary">
        {t("migrationUnavailable")}
      </span>
    );
  }
  if (count.count === 0) {
    return <span className="text-foreground-tertiary">0</span>;
  }
  return <span>{count.count}</span>;
}

function MigrationActionCell({ state }: { state: MigrationActionState }) {
  const t = useTranslation(enterpriseMessages);
  if (state.status === "loading") {
    return (
      <span className="text-foreground-tertiary">
        {t("migrationCheckingShort")}
      </span>
    );
  }
  if (state.status === "error") {
    return (
      <span className="text-foreground-tertiary">
        {t("migrationUnavailable")}
      </span>
    );
  }
  if (state.result === "required") {
    return <span>{t("migrationUpdateRequired")}</span>;
  }
  if (state.result === "sdk_usage_inconclusive") {
    return <span>{t("migrationNeedsReview")}</span>;
  }
  return (
    <span className="text-foreground-tertiary">{t("migrationUpToDate")}</span>
  );
}

function StatusPill({ readiness }: { readiness: ProjectMigrationReadiness }) {
  const t = useTranslation(enterpriseMessages);
  // Forced-v3 projects are managed by their integration partner — link the pill
  // straight to the FAQ instead of showing a migration action state.
  if (readiness === "partner-managed") {
    return (
      <a
        data-row-click-ignore
        href={PARTNER_INTEGRATION_FAQ_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-muted text-muted-foreground inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap hover:underline"
        title={t("migrationPartnerManagedTitle")}
      >
        {t("migrationPartnerManaged")}
      </a>
    );
  }

  if (readiness !== "action-needed") return null;

  return (
    <span className="bg-light-yellow text-dark-yellow inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap">
      {t("migrationActionNeeded")}
    </span>
  );
}

type SortKey =
  | "name"
  | "status"
  | "sdk"
  | "evals"
  | "experiments"
  | "apis"
  | "exports"
  | "lastTrace";
type OrderBy = { column: SortKey; order: "ASC" | "DESC" } | null;

// Header styling and none → DESC → ASC → none sort cycle copied from the
// trace table (DataTable); sorting here is client-side over the static rows.
function SortableHeader({
  label,
  column,
  orderBy,
  onSort,
}: {
  label: string;
  column: SortKey;
  orderBy: OrderBy;
  onSort: (column: SortKey) => void;
}) {
  const t = useTranslation(enterpriseMessages);
  return (
    <div
      className="-mx-2 flex h-10 w-[calc(100%+1rem)] items-center px-2"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center select-none">
        <span className="truncate leading-normal" title={label}>
          {label}
        </span>
        {orderBy?.column === column && (
          <span className="ml-1" title={t("migrationSortTooltip")}>
            {orderBy.order === "ASC" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </div>
  );
}

function OrgStatusSection({
  org,
  statusByProjectId,
  lastTraceTimes,
}: {
  org: V4MigrationOrganization;
  statusByProjectId: Map<string, ProjectMigrationStatus>;
  lastTraceTimes: { projectId: string; lastTraceAt: Date }[];
}) {
  const router = useRouter();
  const capture = usePostHogClientCapture();
  const openMigrationPanel = useOpenV4MigrationPanel();
  const t = useTranslation(enterpriseMessages);
  const locale = useInterfaceLocale();

  const openProjectMigration = (
    row: { id: string; name: string },
    readiness: ProjectMigrationReadiness,
  ) => {
    capture("v4_migration:status_row_clicked");
    openMigrationPanel(
      { id: row.id, name: row.name, readiness },
      "status_page_row",
    );
  };

  const handleRowClick = (
    row: { id: string; name: string; status: ProjectMigrationStatus },
    readiness: ProjectMigrationReadiness,
  ) => {
    // Forced-v3 projects have no migration panel — just navigate to the project.
    if (!row.status.forceV3Experience) {
      openProjectMigration(row, readiness);
    }
    router.push(`/project/${row.id}/traces`);
  };

  const [orderBy, setOrderBy] = useState<OrderBy>(null);

  const handleSort = (column: SortKey) => {
    const next: OrderBy =
      orderBy?.column === column
        ? orderBy.order === "DESC"
          ? { column, order: "ASC" }
          : null
        : { column, order: "DESC" };
    capture("table:column_sorting_header_click", {
      column,
      order: next ? next.order : "Disabled",
    });
    setOrderBy(next);
  };

  // The page is a work list: projects with nothing left to do drop out of the
  // table. The summary card still counts them.
  const rows = org.projects.flatMap((project) => {
    const status = statusByProjectId.get(project.id);
    if (!status) return [];
    const readiness = getProjectMigrationReadiness(status);
    if (readiness === "ready") return [];
    const lastTraceAt = lastTraceTimes?.find(
      (trace) => trace.projectId === project.id,
    )?.lastTraceAt;
    return [
      {
        id: project.id,
        name: project.name,
        status,
        readiness,
        lastTraceLabel: lastTraceAt
          ? formatCompactRelativeTime(new Date(lastTraceAt), locale)
          : "—",
        lastTraceSort: lastTraceAt ? new Date(lastTraceAt).getTime() : -1,
      },
    ];
  });

  const sortValue = (
    row: (typeof rows)[number],
    column: SortKey,
  ): string | number => {
    switch (column) {
      case "name":
        return row.name.toLowerCase();
      case "status":
        return {
          unavailable: 0,
          checking: 1,
          "action-needed": 2,
          ready: 3,
          "partner-managed": 4,
        }[row.readiness];
      case "sdk":
        if (row.status.sdk.status === "latest") {
          return 5;
        }
        if (row.status.sdk.status === "otel_realtime") {
          return 5;
        }
        if (row.status.sdk.status === "no_data") {
          return 5;
        }
        if (row.status.sdk.status === "legacy") {
          return 4;
        }
        if (row.status.sdk.status === "otel_header_required") {
          return 3;
        }
        if (row.status.sdk.status === "unknown") {
          return 2;
        }
        if (row.status.sdk.status === "checking") {
          return 1;
        }
        return 0;
      case "evals":
        return row.status.evals.count;
      case "experiments":
        if (row.status.experiments.result === "required") {
          return 2;
        }
        if (row.status.experiments.result === "sdk_usage_inconclusive") {
          return 1;
        }
        return 0;
      case "apis":
        return row.status.apis.count;
      case "exports":
        return row.status.exports.count;
      case "lastTrace":
        return row.lastTraceSort;
    }
  };

  const sortedRows = orderBy
    ? [...rows].sort((a, b) => {
        const va = sortValue(a, orderBy.column);
        const vb = sortValue(b, orderBy.column);
        const cmp =
          typeof va === "string"
            ? va.localeCompare(vb as string)
            : va - (vb as number);
        return orderBy.order === "ASC" ? cmp : -cmp;
      })
    : rows;

  const sortableHeader = (label: string, column: SortKey) => (
    <SortableHeader
      label={label}
      column={column}
      orderBy={orderBy}
      onSort={handleSort}
    />
  );

  const columnOptions = {
    cellPadding: "comfortable" as const,
  };

  const columns: LangfuseColumnDef<(typeof rows)[number]>[] = [
    {
      ...columnOptions,
      accessorKey: "name",
      size: 192,
      header: () => sortableHeader(t("migrationProjectHeader"), "name"),
      cell: ({ row }) => (
        <Link
          data-row-click-ignore
          href={`/project/${row.original.id}/traces`}
          className="block truncate font-bold hover:underline"
          title={row.original.name}
          onClick={() => {
            if (!row.original.status.forceV3Experience) {
              openProjectMigration(row.original, row.original.readiness);
            }
          }}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      ...columnOptions,
      accessorKey: "readiness",
      header: () => sortableHeader(t("migrationStatusHeader"), "status"),
      cell: ({ row }) => <StatusPill readiness={row.original.readiness} />,
    },
    {
      ...columnOptions,
      accessorKey: "sdk",
      header: () => sortableHeader(t("migrationSdkHeader"), "sdk"),
      cell: ({ row }) => {
        if (row.original.status.sdk.status === "latest") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationLatest")}
            </span>
          );
        }
        if (row.original.status.sdk.status === "otel_realtime") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationOtelRealtime")}
            </span>
          );
        }
        if (row.original.status.sdk.status === "no_data") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationNoData")}
            </span>
          );
        }
        if (row.original.status.sdk.status === "checking") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationCheckingShort")}
            </span>
          );
        }
        if (row.original.status.sdk.status === "unknown") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationUnknown")}
            </span>
          );
        }
        if (row.original.status.sdk.status === "otel_header_required") {
          return (
            <span>
              {row.original.status.sdk.delayedOtelIngestionCount === 1
                ? t("migrationOtelHeaderRequiredOne")
                : t("migrationOtelHeaderRequired", {
                    count: row.original.status.sdk.delayedOtelIngestionCount,
                  })}
            </span>
          );
        }
        if (row.original.status.sdk.status === "error") {
          return (
            <span className="text-foreground-tertiary">
              {t("migrationUnavailable")}
            </span>
          );
        }
        return (
          <span>
            {t("migrationOutdated", {
              count: row.original.status.sdk.upgradeRequiredCount,
            })}
          </span>
        );
      },
    },
    {
      ...columnOptions,
      accessorKey: "evals",
      header: () => sortableHeader(t("migrationAffectedEvals"), "evals"),
      cell: ({ row }) => <AffectedCell count={row.original.status.evals} />,
    },
    {
      ...columnOptions,
      accessorKey: "experiments",
      header: () =>
        sortableHeader(t("migrationAffectedExperiments"), "experiments"),
      cell: ({ row }) => (
        <MigrationActionCell state={row.original.status.experiments} />
      ),
    },
    {
      ...columnOptions,
      accessorKey: "apis",
      header: () => sortableHeader(t("migrationAffectedApis"), "apis"),
      cell: ({ row }) => <AffectedCell count={row.original.status.apis} />,
    },
    {
      ...columnOptions,
      accessorKey: "exports",
      header: () => sortableHeader(t("migrationAffectedExports"), "exports"),
      cell: ({ row }) => <AffectedCell count={row.original.status.exports} />,
    },
    createTextTableColumn<(typeof rows)[number]>({
      ...columnOptions,
      accessorKey: "lastTraceLabel",
      header: () => sortableHeader(t("migrationLastTraceHeader"), "lastTrace"),
    }),
    {
      accessorKey: "id",
      header: "",
      size: 96,
      cellPadding: "comfortable",
      cell: () => (
        <span className="text-dark-blue flex items-center justify-end gap-1 whitespace-nowrap opacity-0 transition-opacity group-hover/row:opacity-100">
          {t("migrationReview")} <ArrowRight size="sm" />
        </span>
      ),
    },
  ];

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-muted-foreground truncate text-sm" title={org.name}>
        {org.name}
      </h3>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[60rem]">
            <Table
              tableName={`${org.name} migration status`}
              columns={columns}
              data={{ status: "success", data: sortedRows }}
              noResultsMessage={null}
              topBorder={false}
              onRowClick={(row) => handleRowClick(row, row.readiness)}
              getRowLabel={(row) => `${t("migrationReview")} ${row.name}`}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function V4MigrationStatusPage() {
  const v4UpgradeUiEnabled = useV4UpgradeUiEnabled();

  if (!v4UpgradeUiEnabled) {
    return null;
  }

  return <V4MigrationStatusPageContent />;
}

function V4MigrationStatusPageContent() {
  const session = useSession();
  const handleCopyPrompt = useCopyMigrationPrompt();
  const hasDeadline = useHasV4MigrationDeadline();
  const title = useV4MigrationTitle();
  const t = useTranslation(enterpriseMessages);

  const orgs: V4MigrationOrganization[] =
    session.data?.user?.organizations?.map((org) => ({
      id: org.id,
      name: org.name,
      projects: org.projects
        .filter((project) => !project.deletedAt)
        .map((project) => ({ id: project.id, name: project.name })),
    })) ?? [];
  const statusByProjectId = useAccountV4MigrationData({
    organizations: orgs,
    enabled: true,
  });
  // Start the table's remaining data alongside the migration checks. Keeping
  // these queries in the page lets one loading boundary wait for the complete
  // snapshot instead of mounting each organization table with placeholder
  // values that update after its rows become visible.
  const lastTraceQueries = api.useQueries((t) =>
    orgs.map((org) =>
      t.organizations.lastTraceByProject(
        { orgId: org.id },
        { enabled: org.projects.length > 0 },
      ),
    ),
  );

  const faqItems: { q: string; a: ReactNode }[] = [
    {
      q: t("migrationFaqWhy"),
      a: (
        <>
          {t("migrationFaqWhyBody")}{" "}
          <FaqLink href={DATA_MODEL_URL}>
            {t("migrationObservationsLink")}
          </FaqLink>
          {t("migrationFaqWhyTail")}
        </>
      ),
    },
    {
      q: t("migrationFaqBenefits"),
      a: (
        <>
          {t("migrationFaqBenefitsBody")}{" "}
          <FaqLink href={OBSERVATIONS_FAQ_URL}>
            {t("migrationDataLink")}
          </FaqLink>
          {t("migrationFaqBenefitsTail")}{" "}
          <FaqLink href={V4_DOCS_URL}>{t("migrationFeaturesLink")}</FaqLink>
          {t("migrationFaqBenefitsTail2")}
        </>
      ),
    },
    {
      q: t("migrationFaqObligation"),
      a: (
        <>
          {t("migrationFaqObligationBody")}{" "}
          <FaqLink href={SDK_UPGRADE_URL}>{t("migrationOldSdksLink")}</FaqLink>
          {t("migrationFaqObligationTail")}{" "}
          <span className="underline">
            {hasDeadline
              ? t("migrationFaqDeadline", { date: V4_MIGRATION_DEADLINE })
              : t("migrationFaqAdminDisables")}
          </span>
          {t("migrationFaqObligationTail2")}
        </>
      ),
    },
    {
      q: t("migrationFaqEffort"),
      a: (
        <>
          {t("migrationFaqEffortBody")}{" "}
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="text-dark-blue hover:underline"
          >
            {t("migrationOnePrompt")}
          </button>
          {t("migrationFaqEffortTail")}
        </>
      ),
    },
    {
      q: t("migrationFaqNothing"),
      a: (
        <>
          <span className="underline">
            {hasDeadline
              ? t("migrationFaqDeadlineCap", { date: V4_MIGRATION_DEADLINE })
              : t("migrationFaqAdminDisablesCap")}
          </span>
          {t("migrationFaqNothingTail")}{" "}
          <FaqLink href={API_REFERENCE_URL}>
            {t("migrationDeprecatedApisLink")}
          </FaqLink>{" "}
          {t("migrationFaqNothingTail2")}
        </>
      ),
    },
  ];

  const totalProjects = orgs.reduce(
    (total, org) => total + org.projects.length,
    0,
  );
  const readiness = orgs.flatMap((org) =>
    org.projects.flatMap((project) => {
      const status = statusByProjectId.get(project.id);
      return status ? [getProjectMigrationReadiness(status)] : [];
    }),
  );
  const actionNeededProjects = readiness.filter(
    (state) => state === "action-needed",
  ).length;
  // Projects whose checks failed are neither clean nor counted as needing
  // action; surface them instead of silently finalizing the count.
  const unavailableProjects = readiness.filter(
    (state) => state === "unavailable",
  ).length;
  // Ready projects are hidden from the org tables, so the page needs its own
  // "nothing left to do" state once every project drops out.
  const listedProjects = readiness.filter((state) => state !== "ready").length;
  const isLoading =
    session.status === "loading" ||
    readiness.some((state) => state === "checking") ||
    orgs.some(
      (org, index) =>
        org.projects.length > 0 &&
        lastTraceQueries[index]?.data === undefined &&
        !lastTraceQueries[index]?.isError,
    );

  if (isLoading) {
    return (
      <ContainerPage headerProps={{ title: t("migrationStatusTitle") }}>
        <V4MigrationLoadingState />
      </ContainerPage>
    );
  }

  return (
    <ContainerPage
      headerProps={{
        title: t("migrationStatusTitle"),
      }}
    >
      <div className="flex flex-col gap-6 pt-2 pb-24">
        <Card className="flex min-w-0 flex-col gap-2.5 p-6">
          <p className="text-base font-bold">{title}</p>
          <div className="text-muted-foreground flex flex-col gap-2 text-sm leading-relaxed">
            <p>
              {actionNeededProjects > 0
                ? t("migrationPitchActionable")
                : t("migrationPitch")}
              <V4MigrationDocsLink />
            </p>
            {actionNeededProjects > 0 && <V4MigrationDeadlineNote />}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {totalProjects === 0 ? (
              <span className="text-muted-foreground text-sm">
                {t("migrationNoActiveProjects")}
              </span>
            ) : (
              <>
                <span className="text-2xl leading-none font-bold tracking-tight">
                  {actionNeededProjects}
                </span>
                <span className="text-muted-foreground text-sm">
                  {actionNeededProjects === 1
                    ? t("migrationProjectNeedsAction", {
                        total: totalProjects,
                      })
                    : t("migrationProjectsNeedAction", {
                        total: totalProjects,
                      })}
                  {unavailableProjects > 0 &&
                    t("migrationCouldNotCheck", {
                      count: unavailableProjects,
                    })}
                </span>
              </>
            )}
          </div>
        </Card>

        {orgs.map((org, index) => (
          <OrgStatusSection
            key={org.id}
            org={org}
            statusByProjectId={statusByProjectId}
            lastTraceTimes={lastTraceQueries[index]?.data ?? []}
          />
        ))}

        {totalProjects > 0 && listedProjects === 0 && (
          <p className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <V4MigrationStatusDot variant="done" />
            {t("migrationAllUpToDate")}
          </p>
        )}

        <div className="mt-6">
          <p className="text-base font-bold">{t("migrationWhatsNew")}</p>
          <div className="flex flex-col gap-6 pt-4">
            <div className="divide-y">
              {faqItems.map(({ q, a }) => (
                <div key={q} className="py-3">
                  <p className="text-sm font-bold">{q}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SwitchBackSection />
      </div>
    </ContainerPage>
  );
}

// User-level v3/v4 UI toggle, the same one the migration side panel shows.
// Hides itself when the session cannot toggle v4 (legacy/events_only write
// mode, post-rollout auto-enrollment).
function SwitchBackSection() {
  const { canToggleV4, isV4 } = useReadPath();
  const hasDeadline = useHasV4MigrationDeadline();
  const t = useTranslation(enterpriseMessages);

  if (!canToggleV4) {
    return null;
  }

  return (
    <div className="mt-6">
      <p className="text-base font-bold">
        {isV4 ? t("migrationSwitchBackTitle") : t("migrationSwitchLatestTitle")}
      </p>
      <div className="flex flex-col gap-4 pt-4">
        {isV4 && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {hasDeadline
              ? t("migrationSwitchBackDescription", {
                  deadline: t("migrationSwitchBackDeadline", {
                    date: V4_MIGRATION_DEADLINE,
                  }),
                })
              : t("migrationSwitchBackDescription", {
                  deadline: t("migrationSwitchBackAdminDisables"),
                })}
          </p>
        )}
        <V4PreviewToggleRow />
      </div>
    </div>
  );
}
