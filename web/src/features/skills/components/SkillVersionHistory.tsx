import { type MouseEvent, useState } from "react";
import { FileDiffIcon, PanelLeftClose, PanelLeftOpen } from "@langfuse/icons";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { Button } from "@/src/components/ui/button";
import { Timeline } from "@/src/components/design-system/Timeline/Timeline";
import { cn } from "@/src/utils/tailwind";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { type SkillEditorStore } from "./skillEditorStore";
import { SkillLabelsSelect } from "./SkillMetadataSelect";
import { SkillVersionComparisonController } from "./SkillVersionComparisonController";

export function SkillVersionHistory(
  props:
    | { kind: "new" }
    | {
        kind: "versions";
        projectId: string;
        name: string;
        versions: Array<{
          version: number;
          labels: string[];
          commitMessage: string | null;
          createdAt: Date;
          createdBy: string;
          creator: string | null | undefined;
        }>;
        selectedVersion: number;
        hasMore: boolean;
        isLoadingMore: boolean;
        loadMoreError: boolean;
        onLoadMore: () => void;
        draftStore: SkillEditorStore | null;
        onSelectDraft: () => Promise<void>;
        isDraft: boolean;
        canEdit: boolean;
        labelOptions: string[];
        isSavingLabels: boolean;
        onSaveLabels: (version: number, labels: string[]) => Promise<boolean>;
        onSelect: (version: number) => Promise<void>;
      },
) {
  const t = useTranslation(skillMessages);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sortedVersions =
    props.kind === "versions"
      ? [...props.versions].toSorted(
          (left, right) => right.version - left.version,
        )
      : [];
  const showDraft = props.kind === "new" || props.draftStore !== null;

  const selectVersion = async (version: number) => {
    if (
      props.kind !== "versions" ||
      (!props.isDraft && version === props.selectedVersion)
    )
      return;
    await props.onSelect(version);
  };

  return (
    <aside
      className={cn(
        "ph-no-capture bg-muted/10 flex w-full shrink-0 flex-col border-b transition-[width,max-height] md:max-h-none md:border-r md:border-b-0",
        isCollapsed ? "max-h-9 md:w-11" : "max-h-56 md:w-56",
      )}
    >
      <div
        className={cn(
          "flex min-h-9 shrink-0 items-center border-b",
          isCollapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {isCollapsed ? null : (
          <span className="text-sm font-bold">{t("versions")}</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={
            isCollapsed
              ? t("expandVersionHistory")
              : t("collapseVersionHistory")
          }
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isCollapsed ? (
            <PanelLeftOpen size="base" color="default" />
          ) : (
            <PanelLeftClose size="base" color="default" />
          )}
        </Button>
      </div>
      {isCollapsed ? null : (
        <div className="overflow-y-auto p-2">
          <Timeline>
            {showDraft ? (
              <Timeline.Item isActive={props.kind === "new" || props.isDraft}>
                <div className="flex items-start gap-1">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                    aria-label={t("openLocalDraft")}
                    aria-current={
                      props.kind === "new" || props.isDraft ? "page" : undefined
                    }
                    onClick={async () => {
                      if (props.kind === "versions")
                        await props.onSelectDraft();
                    }}
                  >
                    <Badge color="outline" text={t("draftLabel")} />
                    <Badge
                      color="filled"
                      size="md"
                      text={t("unreleasedLocalChanges")}
                    />
                  </button>
                  {props.kind === "versions" ? (
                    <SkillVersionComparisonController {...props}>
                      {({ openComparison }) => (
                        <IconButton
                          icon={FileDiffIcon}
                          label={t("compareLocalDraft", {
                            version: props.selectedVersion,
                          })}
                          title={t("compareWithLocalDraft")}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openComparison(props.selectedVersion, true)
                          }
                        />
                      )}
                    </SkillVersionComparisonController>
                  ) : null}
                </div>
              </Timeline.Item>
            ) : null}
            {props.kind === "versions"
              ? sortedVersions.map(
                  ({
                    version,
                    labels,
                    commitMessage,
                    createdAt,
                    createdBy,
                    creator,
                  }) => (
                    <Timeline.Item
                      key={version}
                      isActive={
                        !props.isDraft && version === props.selectedVersion
                      }
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          aria-label={t("openVersion", { version })}
                          aria-current={
                            !props.isDraft && version === props.selectedVersion
                              ? "page"
                              : undefined
                          }
                          onClick={() => selectVersion(version)}
                        >
                          <Badge
                            color="outline"
                            size="lg"
                            text={`# ${version}`}
                          />
                        </button>
                        <SkillLabelsSelect
                          showOnlyOnHover
                          value={labels}
                          options={props.labelOptions}
                          disabled={!props.canEdit || props.isSavingLabels}
                          isSaving={props.isSavingLabels}
                          onSave={(nextLabels) =>
                            props.onSaveLabels(version, nextLabels)
                          }
                        />
                      </div>
                      <div className="flex items-start gap-1">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                          aria-current={
                            !props.isDraft && version === props.selectedVersion
                              ? "page"
                              : undefined
                          }
                          onClick={() => selectVersion(version)}
                        >
                          {commitMessage ? (
                            <span
                              className="text-muted-foreground max-w-full truncate text-xs"
                              title={commitMessage}
                            >
                              {commitMessage}
                            </span>
                          ) : null}
                          <span
                            className="text-muted-foreground flex flex-wrap gap-1 text-xs break-words"
                            title={t("createdBy", {
                              time: createdAt.toLocaleString(),
                              creator: creator || createdBy,
                            })}
                          >
                            {t("createdBy", {
                              time: createdAt.toLocaleString(),
                              creator: creator || createdBy,
                            })}
                          </span>
                        </button>
                        {props.isDraft || version !== props.selectedVersion ? (
                          <SkillVersionComparisonController
                            {...props}
                            versions={sortedVersions}
                          >
                            {({ openComparison }) => {
                              const handleCompareClick = (
                                event: MouseEvent<HTMLButtonElement>,
                              ) => {
                                event.stopPropagation();
                                openComparison(version, props.isDraft);
                              };
                              return (
                                <div className="shrink-0 group-focus-within/timeline-item:opacity-100 group-hover/timeline-item:opacity-100 [@media(hover:hover)]:opacity-0">
                                  <IconButton
                                    icon={FileDiffIcon}
                                    label={
                                      props.isDraft
                                        ? t("compareVersionWithLocalDraft", {
                                            version,
                                          })
                                        : t(
                                            "compareVersionWithSelectedVersion",
                                            {
                                              version,
                                              selectedVersion:
                                                props.selectedVersion,
                                            },
                                          )
                                    }
                                    title={
                                      props.isDraft
                                        ? t("compareWithLocalDraft")
                                        : t("compareWithSelectedVersion")
                                    }
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCompareClick}
                                  />
                                </div>
                              );
                            }}
                          </SkillVersionComparisonController>
                        ) : null}
                      </div>
                    </Timeline.Item>
                  ),
                )
              : null}
          </Timeline>
          {props.kind === "versions" && props.hasMore ? (
            <div className="flex flex-col gap-2 pt-2">
              {props.loadMoreError ? (
                <p role="alert" className="text-destructive text-xs">
                  {t("couldNotLoadOlderVersions")}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={props.isLoadingMore}
                loading={props.isLoadingMore}
                onClick={props.onLoadMore}
              >
                {t("loadOlderVersions")}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
