import { useId, useState, type ChangeEvent } from "react";
import { Accordion } from "@/src/components/design-system/Accordion/Accordion";
import { Input } from "@/src/components/design-system/Input/Input";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { CopyAgentPromptPanel } from "./CopyAgentPromptPanel";
import { CliSetupAccordion } from "./CliSetupAccordion";
import { shellQuote } from "../utils/shellQuote";

export function CliSkillImportInstructions({
  projectId,
  host,
}: {
  projectId: string;
  host: string;
}) {
  const t = useTranslation(skillMessages);
  const id = useId();
  const [scope, setScope] = useState("all");
  const [directory, setDirectory] = useState(".agents/skills");
  const [skillPath, setSkillPath] = useState(".agents/skills/my-skill");
  const path = (scope === "all" ? directory : skillPath).trim();
  const command = `langfuse skills push ${shellQuote(path)}${scope === "all" ? " --recursive" : ""}`;
  const prompt = `Import these local skills into Langfuse.

Follow the CLI setup and authentication guidance:
https://github.com/langfuse/langfuse-cli
Use @langfuse/cli for skill import.

Langfuse host: ${JSON.stringify(host)}

Run from the repository root:
${command}

Use local project credentials. If missing, ask me to configure them locally; never paste secrets into chat or commit them.

Check the selected folder contains the intended SKILL.md files before pushing. The name in each SKILL.md identifies the skill in Langfuse. This creates new skills or publishes new versions when files change. Verify the imported skills in Langfuse.`;

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (scope === "all") setDirectory(event.target.value);
    else setSkillPath(event.target.value);
  };

  return (
    <div className="ph-no-capture flex min-w-0 flex-col gap-4">
      <p className="text-muted-foreground">{t("chooseWhatToImport")}</p>
      <CliSetupAccordion projectId={projectId} host={host} />
      <div className="flex flex-col gap-3">
        <Accordion type="single" collapsible>
          <Accordion.Item value="configuration">
            <Accordion.Trigger size="sm">
              {t("configureImportCommand")}
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-3 py-3">
                <Tabs value={scope} onValueChange={setScope}>
                  <Tabs.List
                    aria-label={t("importScope")}
                    variant="inset"
                    size="md"
                  >
                    <Tabs.Trigger value="all" label={t("allSkills")} />
                    <Tabs.Trigger value="single" label={t("singleSkill")} />
                  </Tabs.List>
                </Tabs>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-muted-foreground text-xs"
                    htmlFor={`${id}-path`}
                  >
                    {scope === "all" ? t("skillsDirectory") : t("skillFolder")}
                  </label>
                  <Input
                    id={`${id}-path`}
                    value={scope === "all" ? directory : skillPath}
                    onChange={handlePathChange}
                    aria-invalid={!path}
                  />
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        {!path ? (
          <p role="alert" className="text-destructive">
            {t("enterFolderPath")}
          </p>
        ) : (
          <CopyAgentPromptPanel prompt={prompt} command={command} />
        )}
      </div>

      <Accordion type="single" collapsible>
        <Accordion.Item value="updates">
          <Accordion.Trigger size="sm">{t("updatingLater")}</Accordion.Trigger>
          <Accordion.Content>
            <div className="flex min-w-0 flex-col gap-3 py-3">
              <p className="text-muted-foreground">
                {t("updatingLaterDescription")}
              </p>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
