import { Info } from "@langfuse/icons";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export const PrivateChannelsInfoTooltip = () => {
  const t = useTranslation(integrationMessages);
  return (
    <Tooltip label={t("slackPrivateChannelsTooltip")}>
      {({ getTriggerProps }) => (
        <IconButton
          {...getTriggerProps()}
          icon={Info}
          label={t("slackPrivateChannelsAbout")}
          size="sm"
          variant="ghost"
        />
      )}
    </Tooltip>
  );
};
