import { Badge } from "@/src/components/design-system/Badge/Badge";
import { type PlaygroundSourcePrompt } from "@/src/features/playground/page/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

type SourcePromptHeadingProps = {
  sourcePrompt: PlaygroundSourcePrompt;
  isEdited: boolean;
};

export const SourcePromptHeading: React.FC<SourcePromptHeadingProps> = ({
  sourcePrompt,
  isEdited,
}) => {
  const t = useTranslation(skillMessages);
  const version = `v${sourcePrompt.version}`;

  return (
    <div className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs leading-tight">
      <span
        className="min-w-0 truncate"
        title={`${sourcePrompt.name} ${version}`}
      >
        {sourcePrompt.name}
      </span>
      <Badge text={version} />
      {isEdited && (
        <span className="text-foreground shrink-0">· {t("edited")}</span>
      )}
    </div>
  );
};
