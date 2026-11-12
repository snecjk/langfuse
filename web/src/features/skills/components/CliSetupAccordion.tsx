import { Accordion } from "@/src/components/design-system/Accordion/Accordion";
import { Button } from "@/src/components/design-system/Button/Button";
import { Codeblock } from "@/src/components/design-system/Codeblock/Codeblock";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { shellQuote } from "../utils/shellQuote";

export function CliSetupAccordion({
  projectId,
  host,
}: {
  projectId: string;
  host: string;
}) {
  const t = useTranslation(skillMessages);
  return (
    <Accordion type="single" collapsible>
      <Accordion.Item value="setup">
        <Accordion.Trigger size="sm">
          {t("firstTimeCLISetup")}
        </Accordion.Trigger>
        <Accordion.Content>
          <div className="flex min-w-0 flex-col items-start gap-3 py-3">
            <p className="text-muted-foreground">{t("requiresNodeJS")}</p>
            <div className="w-full min-w-0">
              <Codeblock
                language="bash"
                value="npm install -g @langfuse/cli"
                variant="read-only"
              />
            </div>
            <p className="text-muted-foreground">{t("replacePlaceholders")}</p>
            <Button
              text={t("getProjectAPIKeys")}
              href={`/project/${projectId}/settings/api-keys`}
              variant="secondary"
              size="sm"
            />
            <div className="ph-no-capture w-full min-w-0">
              <Codeblock
                language="bash"
                value={`export LANGFUSE_PUBLIC_KEY='pk-lf-...'\nexport LANGFUSE_SECRET_KEY='sk-lf-...'\nexport LANGFUSE_HOST=${shellQuote(host)}`}
                variant="read-only"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {t("ifBaseURLIsSet")}
            </p>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
