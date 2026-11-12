import { type ReactNode, useState } from "react";
import { Callout } from "@/src/components/design-system/Callout/Callout";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { useSkillHasRecentUsage } from "@/src/features/skills/hooks/useSkillHasRecentUsage";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { TraceSkillDialog } from "./TraceSkillDialog";

export function SkillUsage({
  projectId,
  name,
  version,
  children,
}: {
  projectId: string;
  name: string;
  version: number;
  children: ReactNode;
}) {
  const t = useTranslation(skillMessages);
  const [dismissed, setDismissed] = useState(false);
  const hasRecentUsage = useSkillHasRecentUsage(projectId, name);
  const showSetup = !dismissed && hasRecentUsage === false;

  return (
    <DialogController
      renderDialog={() => <TraceSkillDialog skill={{ name, version }} />}
    >
      {({ openDialog }) => (
        <div className="flex min-h-0 flex-1 flex-col">
          {showSetup ? (
            <div className="shrink-0 px-4 pt-4">
              <Callout
                variant="info"
                align="top"
                onDismiss={() => setDismissed(true)}
                actions={[
                  {
                    type: "button",
                    label: t("quickStart"),
                    onClick: openDialog,
                  },
                  {
                    type: "link",
                    label: t("documentation"),
                    href: "https://langfuse.com/docs/skill-management/tracing",
                  },
                ]}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-bold">{t("noTracesLinkedToSkill")}</p>
                  <p>{t("traceSkillUsageDescription")}</p>
                </div>
              </Callout>
            </div>
          ) : null}
          {children}
        </div>
      )}
    </DialogController>
  );
}
