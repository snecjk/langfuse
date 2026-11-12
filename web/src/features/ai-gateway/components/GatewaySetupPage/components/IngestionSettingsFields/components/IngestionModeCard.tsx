import { Check } from "@langfuse/icons";
import type { GatewayIngestionMode } from "@langfuse/shared";

import type { GATEWAY_INGESTION_MODES } from "@/src/features/ai-gateway/constants/gatewayIngestionModes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import { cn } from "@/src/utils/tailwind";

export type IngestionModeCardProps = {
  option: (typeof GATEWAY_INGESTION_MODES)[number];
  selected: boolean;
  onSelect: (mode: GatewayIngestionMode) => void;
};

const modeTitleKeys = {
  FULL: "ingestionModeFull",
  USAGE: "ingestionModeUsage",
  NONE: "ingestionModeNone",
} as const;

const modeDescriptionKeys = {
  FULL: "ingestionModeFullDesc",
  USAGE: "ingestionModeUsageDesc",
  NONE: "ingestionModeNoneDesc",
} as const;

export function IngestionModeCard({
  option,
  selected,
  onSelect,
}: IngestionModeCardProps) {
  const t = useTranslation(gatewayMessages);
  const Icon = option.icon;

  function handleClick() {
    onSelect(option.value);
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={handleClick}
      className={cn(
        "bg-card hover:bg-muted/50 flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors",
        selected && "border-primary ring-primary ring-1",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Icon size="base" color="muted" />
        {selected ? <Check size="base" __rawClassName="text-primary" /> : null}
      </div>
      <div>
        <p className="text-sm font-bold">{t(modeTitleKeys[option.value])}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {t(modeDescriptionKeys[option.value])}
        </p>
      </div>
    </button>
  );
}
