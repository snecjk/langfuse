import { PrettyJsonView } from "@/src/components/ui/PrettyJsonView";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import { useState } from "react";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export const ExperimentMetadataSection = ({
  metadata,
  t: tProp,
}: {
  metadata: Record<string, unknown>;
  t?: ReturnType<typeof useTranslation<typeof experimentMessages>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tOwn = useTranslation(experimentMessages);
  const t = tProp ?? tOwn;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-t pt-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-bold">{t("metadata")}</span>
            {isOpen ? (
              <DropdownIndicator />
            ) : (
              <DropdownIndicator direction="right" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <PrettyJsonView json={metadata} currentView="pretty" />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
