import { Codeblock } from "@/src/components/design-system/Codeblock/Codeblock";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

export function CopyAgentPromptPanel({
  prompt,
  command,
}: {
  prompt: string;
  command: string;
}) {
  const t = useTranslation(skillMessages);
  return (
    <div className="ph-no-capture flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-bold">{t("setUpWithYourCodingAgent")}</h3>
        <p className="text-muted-foreground text-xs">
          {t("copyPromptIntoAgent")}
        </p>
      </div>
      <div
        role="group"
        aria-label={t("setupPrompt")}
        className="min-w-0 [&_pre]:max-h-24 [&_pre]:break-words [&_pre]:whitespace-pre-wrap"
      >
        <Codeblock
          language="text"
          label={t("setupPrompt")}
          value={prompt}
          variant="read-only"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">
          {t("orRunInProjectDirectory")}
        </p>
        <Codeblock language="bash" value={command} variant="read-only" />
      </div>
    </div>
  );
}
