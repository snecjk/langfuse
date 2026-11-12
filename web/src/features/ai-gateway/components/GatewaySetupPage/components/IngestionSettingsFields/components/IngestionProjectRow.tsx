import type { ChangeEvent } from "react";

import { Input } from "@/src/components/design-system/Input/Input";
import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import type {
  GatewayIngestionSettings,
  GatewayProject,
} from "@/src/features/ai-gateway/components/GatewaySetupPage/types/gatewaySetup";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type IngestionProjectRowProps = {
  settings: GatewayIngestionSettings;
  projects: GatewayProject[];
  onChange: (settings: GatewayIngestionSettings) => void;
};

/** Reads as one sentence: "Record in a [new] project named [ai-gateway]". */
export function IngestionProjectRow({
  settings,
  projects,
  onChange,
}: IngestionProjectRowProps) {
  const t = useTranslation(gatewayMessages);
  const targetOptions = [
    { value: "new" as const, label: t("newProjectLabel") },
    projects.length > 0
      ? { value: "existing" as const, label: t("existingProjectLabel") }
      : {
          value: "existing" as const,
          label: t("existingProjectLabel"),
          disabled: true as const,
          disabledReason: t("noProjectsYet"),
        },
  ];
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  function handleTargetChange(projectTarget: "new" | "existing") {
    onChange({ ...settings, projectTarget });
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, newProjectName: event.target.value });
  }

  function handleProjectChange(existingProjectId: string) {
    onChange({ ...settings, existingProjectId });
  }

  const isNewProject = settings.projectTarget === "new";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span>
        {isNewProject ? t("recordInNewProject") : t("recordInExistingProject")}
      </span>
      <div className="w-fit">
        <SelectInput
          aria-label={t("newOrExistingProject")}
          placeholder={t("newProjectLabel")}
          value={settings.projectTarget}
          options={targetOptions}
          onValueChange={handleTargetChange}
        />
      </div>
      <span>{isNewProject ? t("projectNamed") : t("projectLabel")}</span>
      {isNewProject ? (
        <div className="ph-no-capture w-fit">
          <Input
            layout="inline"
            aria-label={t("projectName")}
            value={settings.newProjectName}
            onChange={handleNameChange}
            error={settings.newProjectName.trim().length === 0}
          />
        </div>
      ) : (
        <div className="ph-no-capture w-fit">
          <SelectInput
            aria-label={t("ingestionProject")}
            placeholder={t("selectProject")}
            search={{ placeholder: t("searchProjects") }}
            value={settings.existingProjectId ?? ""}
            options={projectOptions}
            onValueChange={handleProjectChange}
          />
        </div>
      )}
    </div>
  );
}
