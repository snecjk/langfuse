import { Callout } from "@/src/components/design-system/Callout/Callout";
import { DismissController } from "@/src/components/DismissController";
import { Bot } from "@langfuse/icons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { notificationMessages } from "@/src/features/i18n/messages/notifications";
import { navigationMessages } from "@/src/features/i18n/messages/navigation";

const DOCS_HREF =
  "https://langfuse.com/docs/api-and-data-platform/features/agent-skill";

/**
 * Informational, dismissible banner that highlights Langfuse's support for AI
 * coding agents via the Agent Skill, MCP server, and CLI. Rendered on the
 * organization overview page.
 */
export function AgentToolsBanner() {
  const t = useTranslation(notificationMessages);
  const tNav = useTranslation(navigationMessages);
  return (
    <DismissController id="agent-tools-banner:v1" family="callouts">
      {({ onDismiss }) => (
        <div className="mb-4">
          <Callout
            variant="info"
            align="middle"
            actions={[
              {
                type: "link",
                label: tNav("learnMore"),
                href: DOCS_HREF,
              },
            ]}
            onDismiss={onDismiss}
          >
            <div className="flex items-start gap-2 sm:items-center">
              <Bot size="base" __rawClassName="mt-0.5 sm:mt-0" />
              <span>
                <span className="font-bold">{t("agentToolsTitle")}</span>{" "}
                {t("agentToolsDescription")}
              </span>
            </div>
          </Callout>
        </div>
      )}
    </DismissController>
  );
}
