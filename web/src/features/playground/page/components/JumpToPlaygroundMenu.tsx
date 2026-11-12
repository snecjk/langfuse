import { Terminal } from "@langfuse/icons";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

export type JumpToPlaygroundAction = "fresh" | "existing";

type JumpToPlaygroundMenuProps = {
  onPlaygroundAction: (action: JumpToPlaygroundAction) => void;
} & (
  | {
      source: "prompt";
    }
  | {
      source: "generation";
      includeOutput: boolean;
      onIncludeOutputChange: (includeOutput: boolean) => void;
    }
);

export function JumpToPlaygroundMenu({
  onPlaygroundAction,
  ...props
}: JumpToPlaygroundMenuProps) {
  const t = useTranslation(skillMessages);
  return (
    <>
      <DropdownMenuItem onSelect={() => onPlaygroundAction("fresh")}>
        <Terminal size="base" color="default" __rawClassName="mr-2" />
        {t("freshPlayground")}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onPlaygroundAction("existing")}>
        <Terminal size="base" color="default" __rawClassName="mr-2" />
        {t("addToExisting")}
      </DropdownMenuItem>
      {props.source === "generation" && (
        <>
          <DropdownMenuSeparator />
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm">{t("includeOutput")}</span>
            <Switch
              checked={props.includeOutput}
              onCheckedChange={props.onIncludeOutputChange}
            />
          </div>
        </>
      )}
    </>
  );
}
