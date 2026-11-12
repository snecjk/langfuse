import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  COMMIT_MESSAGE_MAX_LENGTH,
  SKILL_LATEST_LABEL,
} from "@langfuse/shared";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { Button } from "@/src/components/design-system/Button/Button";
import { Checkbox } from "@/src/components/design-system/Checkbox/Checkbox";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { Input } from "@/src/components/design-system/Input/Input";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { api, getTrpcErrorCode, type RouterOutputs } from "@/src/utils/api";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

import { LocalSkillImportSource } from "./LocalSkillImportSource";
import { useLangfuseBaseUrl } from "@/src/features/public-api/hooks/useLangfuseEnvCode";
import { CliSkillImportInstructions } from "./CliSkillImportInstructions";
import type { ComparedSkill, SkillImportDiscovery } from "./skillImportTypes";
import { compareImportedSkills } from "../utils/compare-imported-skills";

type ImportResult =
  | { status: "success"; version: number }
  | { status: "error"; message: string };

export function ImportSkillsDialog({
  projectId,
  children,
}: {
  projectId: string;
  children: (openDialog: () => void) => ReactNode;
}) {
  const t = useTranslation(skillMessages);
  const utils = api.useUtils();
  const capture = usePostHogClientCapture();
  const [tab, setTab] = useState("local");
  const [discovery, setDiscovery] = useState<
    Pick<SkillImportDiscovery, "source" | "commitMessage"> & {
      skills: ComparedSkill[];
    }
  >();
  const [scanError, setScanError] = useState<string>();
  const [isScanning, setIsScanning] = useState(false);
  const createVersion = api.skills.createVersion.useMutation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, ImportResult>>({});
  const [isImporting, setIsImporting] = useState(false);
  const inFlight = useRef(false);
  const busy = isScanning || isImporting;
  const skills = discovery?.skills ?? [];
  const searchTerm = search.trim().toLowerCase();
  const visibleSkills = skills.filter((skill) =>
    [skill.name, skill.description, skill.path].some((value) =>
      value.toLowerCase().includes(searchTerm),
    ),
  );
  const selectable = skills.filter(
    (skill) =>
      !skill.error &&
      (!skill.exists || skill.hasChanges) &&
      results[skill.path]?.status !== "success",
  );
  const selectedSkills = selectable.filter((skill) => selected.has(skill.path));
  const visiblePaths = new Set(visibleSkills.map((skill) => skill.path));
  const visibleSelectable = selectable.filter((skill) =>
    visiblePaths.has(skill.path),
  );
  const allVisibleSelected =
    visibleSelectable.length > 0 &&
    visibleSelectable.every((skill) => selected.has(skill.path));

  const reset = () => {
    setDiscovery(undefined);
    setScanError(undefined);
    createVersion.reset();
    setSelected(new Set());
    setResults({});
    setSearch("");
  };

  const scan = async (load: () => Promise<SkillImportDiscovery>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    reset();
    setIsScanning(true);
    try {
      const discovered = await load();
      const names = [
        ...new Set(
          discovered.skills
            .filter((skill) => !skill.error)
            .map((skill) => skill.name),
        ),
      ];
      const existing: RouterOutputs["skills"]["byName"][] = [];
      for (let offset = 0; offset < names.length; offset += 4) {
        const versions = await Promise.all(
          names.slice(offset, offset + 4).map(async (name) => {
            try {
              return await utils.client.skills.byName.query({
                projectId,
                name,
                label: SKILL_LATEST_LABEL,
              });
            } catch (error) {
              if (getTrpcErrorCode(error) === "NOT_FOUND") return undefined;
              throw error;
            }
          }),
        );
        for (const version of versions) {
          if (version) existing.push(version);
        }
      }
      const data = {
        ...discovered,
        skills: await compareImportedSkills(discovered.skills, existing),
      };
      setDiscovery(data);
      setSelected(
        new Set(
          data.skills
            .filter((skill) => !skill.error && !skill.exists)
            .map((skill) => skill.path),
        ),
      );
    } catch (error) {
      setScanError(
        error instanceof Error ? error.message : t("couldNotScanSource"),
      );
    } finally {
      inFlight.current = false;
      setIsScanning(false);
    }
  };

  const importSelected = async (closeDialog: () => void) => {
    if (inFlight.current || !discovery || !selectedSkills.length) return;
    inFlight.current = true;
    setIsImporting(true);
    const source = discovery;
    let importedCount = 0;
    try {
      for (const skill of selectedSkills) {
        try {
          const version = await createVersion.mutateAsync({
            projectId,
            files: skill.files,
            commitMessage: `${source.commitMessage} (${skill.path})`.slice(
              0,
              COMMIT_MESSAGE_MAX_LENGTH,
            ),
          });
          importedCount += 1;
          setResults((current) => ({
            ...current,
            [skill.path]: { status: "success", version: version.version },
          }));
          setSelected((current) => {
            const next = new Set(current);
            next.delete(skill.path);
            return next;
          });
        } catch (error) {
          // Preserve successful imports so retrying only submits remaining skills.
          setResults((current) => ({
            ...current,
            [skill.path]: {
              status: "error",
              message:
                error instanceof Error ? error.message : t("importFailed"),
            },
          }));
        }
      }
      if (importedCount > 0) {
        capture("skills:import", {
          skillCount: importedCount,
          source: source.source,
        });
        utils.skills.invalidate();
        showSuccessToast({
          operation: "skills.import",
          title: t("importedSkillsCount", { count: importedCount }),
          description: t("importedCopiesAvailable"),
        });
      }
    } finally {
      inFlight.current = false;
      setIsImporting(false);
    }
    if (importedCount === selectedSkills.length) closeDialog();
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const toggleVisibleSelection = () => {
    setSelected((current) => {
      const next = new Set(current);
      for (const skill of visibleSelectable) {
        if (allVisibleSelected) next.delete(skill.path);
        else next.add(skill.path);
      }
      return next;
    });
  };

  const createSkillSelectHandler = (path: string) => {
    return function handleSkillSelectChange(
      checked: boolean | "indeterminate",
    ) {
      setSelected((current) => {
        const next = new Set(current);
        if (checked === true) next.add(path);
        else next.delete(path);
        return next;
      });
    };
  };

  const canCloseDialog = () => !inFlight.current;

  const createImportHandler = (closeDialog: () => void) => {
    return function handleImportSelected() {
      return importSelected(closeDialog);
    };
  };

  const createOpenHandler = (openDialog: () => void) => {
    return function handleOpenDialog() {
      reset();
      setTab("local");
      capture("skills:import_open");
      openDialog();
    };
  };

  return (
    <DialogController
      onBeforeClose={canCloseDialog}
      renderDialog={({ closeDialog }) => (
        <Dialog
          title={t("importSkillsDialogTitle")}
          size="lg"
          actions={
            tab === "local" && discovery
              ? [
                  {
                    label: t("importSkillsCount", {
                      count: selectedSkills.length,
                    }),
                    loading: isImporting,
                    disabled: busy || selectedSkills.length === 0,
                    onClick: createImportHandler(closeDialog),
                  },
                ]
              : undefined
          }
        >
          <Dialog.Body>
            <Tabs value={tab} onValueChange={setTab}>
              <Tabs.List
                variant="inset"
                size="md"
                layout="full"
                aria-label={t("importMethod")}
              >
                <Tabs.Trigger
                  value="local"
                  label={t("upload")}
                  disabled={busy}
                />
                <Tabs.Trigger value="cli" label={t("cli")} disabled={busy} />
              </Tabs.List>
              <div className="pt-4">
                <Tabs.Content value="cli">
                  <CliSkillImportTab projectId={projectId} />
                </Tabs.Content>
                <Tabs.Content value="local">
                  <div className="flex flex-col gap-4">
                    <LocalSkillImportSource
                      busy={busy}
                      onScan={scan}
                      onReset={reset}
                    />
                    {scanError ? (
                      <p
                        role="alert"
                        className="ph-no-capture text-destructive"
                      >
                        {scanError}
                      </p>
                    ) : null}
                    {discovery && skills.length === 0 ? (
                      <p role="status" className="text-muted-foreground">
                        {t("noSkillMdFilesFound")}
                      </p>
                    ) : null}
                    {discovery && skills.length > 0 ? (
                      <>
                        <div className="ph-no-capture">
                          <Input
                            aria-label={t("searchSkills")}
                            placeholder={t("searchSkills")}
                            value={search}
                            onChange={handleSearchChange}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p role="status">
                            {searchTerm ? `${visibleSkills.length} of ` : ""}
                            {t("skillsFound", { count: skills.length })}{" "}
                            {searchTerm ? t("skillsShown") : ""}
                            {" · "}
                            {t("skillsSelected", {
                              count: selectedSkills.length,
                            })}
                          </p>
                          <Button
                            text={
                              allVisibleSelected
                                ? t("deselectAllShown")
                                : t("selectAllShown")
                            }
                            variant="ghost"
                            size="sm"
                            disabled={busy || visibleSelectable.length === 0}
                            onClick={toggleVisibleSelection}
                          />
                        </div>
                        {visibleSkills.length === 0 ? (
                          <p role="status" className="text-muted-foreground">
                            {t("noSkillsMatchSearch")}
                          </p>
                        ) : null}
                        <ul className="ph-no-capture flex flex-col divide-y rounded-md border">
                          {visibleSkills.map((skill, index) => {
                            const result = results[skill.path];
                            const error =
                              skill.error ||
                              (result?.status === "error"
                                ? result.message
                                : null);
                            const imported = result?.status === "success";
                            const existingStatus = skill.hasChanges
                              ? t("newVersion")
                              : t("alreadyUpToDate");
                            return (
                              <li
                                key={skill.path}
                                className="flex items-start gap-3 p-3"
                              >
                                <div className="pt-0.5">
                                  <Checkbox
                                    id={`import-skill-${index}`}
                                    checked={selected.has(skill.path)}
                                    disabled={
                                      busy ||
                                      Boolean(skill.error) ||
                                      imported ||
                                      (skill.exists && !skill.hasChanges)
                                    }
                                    onCheckedChange={createSkillSelectHandler(
                                      skill.path,
                                    )}
                                  />
                                </div>
                                <label
                                  htmlFor={`import-skill-${index}`}
                                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1"
                                >
                                  <span className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold break-words">
                                      {skill.name}
                                    </span>
                                    {!skill.error ? (
                                      <Badge
                                        text={
                                          skill.exists
                                            ? existingStatus
                                            : t("import")
                                        }
                                        color={
                                          skill.exists && !skill.hasChanges
                                            ? "warning"
                                            : "info"
                                        }
                                        size="sm"
                                      />
                                    ) : null}
                                    {!skill.error ? (
                                      <Badge
                                        text={t("filesCount", {
                                          count: skill.files.length,
                                        })}
                                        color="outline"
                                        size="sm"
                                      />
                                    ) : null}
                                  </span>
                                  {skill.exists && !skill.error ? (
                                    <span className="text-muted-foreground text-xs">
                                      {skill.hasChanges
                                        ? t("filesDifferFromLatest")
                                        : t("filesMatchLatest")}
                                    </span>
                                  ) : null}
                                  <span className="text-muted-foreground text-xs break-all">
                                    {skill.path}
                                  </span>
                                  {skill.description ? (
                                    <span className="text-muted-foreground text-sm break-words">
                                      {skill.description}
                                    </span>
                                  ) : null}
                                  {error ? (
                                    <span
                                      className="text-destructive text-sm"
                                      role="alert"
                                    >
                                      {error}
                                    </span>
                                  ) : null}
                                  {result?.status === "success" ? (
                                    <span className="text-sm" role="status">
                                      {t("importedAsVersion", {
                                        version: result.version,
                                      })}
                                    </span>
                                  ) : null}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        <p className="text-muted-foreground text-xs">
                          {t("existingNameNewVersion")}
                        </p>
                      </>
                    ) : null}
                  </div>
                </Tabs.Content>
              </div>
            </Tabs>
          </Dialog.Body>
        </Dialog>
      )}
    >
      {({ openDialog }) => children(createOpenHandler(openDialog))}
    </DialogController>
  );
}

function CliSkillImportTab({ projectId }: { projectId: string }) {
  const host = useLangfuseBaseUrl();
  return <CliSkillImportInstructions projectId={projectId} host={host} />;
}
