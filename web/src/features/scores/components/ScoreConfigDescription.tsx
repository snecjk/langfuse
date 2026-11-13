import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "@langfuse/icons";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import useLocalStorage from "@/src/components/useLocalStorage";
import { cn } from "@/src/utils/tailwind";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { evaluationsMessages } from "@/src/features/i18n/messages/evaluations";

export function ScoreConfigDescription({
  configId,
  name,
  description,
}: {
  configId: string;
  name: string;
  description: string;
}) {
  const t = useTranslation(evaluationsMessages);
  const [expanded, setExpanded] = useLocalStorage(
    `annotation-score-config-description-${configId}`,
    true,
  );
  const textRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  const canExpand = overflows || description.trim().includes("\n");

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    // Clamping preserves scrollHeight, so disclosure follows the rendered
    // line count even when the panel is resized while collapsed.
    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);
      setOverflows(text.scrollHeight > lineHeight + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    measure();
    return () => observer.disconnect();
  }, [description]);

  return (
    <Collapsible open={canExpand && expanded} onOpenChange={setExpanded}>
      <div className="group/description grid grid-cols-[minmax(0,1fr)_1rem] items-start gap-1.5">
        <CollapsibleContent forceMount className="min-w-0">
          <p
            ref={textRef}
            className={cn(
              "text-foreground text-xs leading-4 wrap-break-word whitespace-pre-wrap",
              !(canExpand && expanded) && "line-clamp-1",
            )}
          >
            {description.trim()}
          </p>
        </CollapsibleContent>
        {canExpand && (
          <span className="opacity-100 group-focus-within/description:opacity-100 group-hover/description:opacity-100 [@media(hover:hover)]:opacity-0">
            <CollapsibleTrigger asChild>
              <IconButton
                icon={expanded ? ChevronDown : ChevronRight}
                label={
                  expanded
                    ? t("hideDescriptionFor", { name })
                    : t("showDescriptionFor", { name })
                }
                size="xs"
              />
            </CollapsibleTrigger>
          </span>
        )}
      </div>
    </Collapsible>
  );
}
