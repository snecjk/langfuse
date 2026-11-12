import type { ComponentProps } from "react";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tableMessages } from "@/src/features/i18n/messages/table";

type TableViewPresetsButtonProps = Pick<
  ComponentProps<typeof Button>,
  | "id"
  | "ref"
  | "onClick"
  | "onPointerDown"
  | "onKeyDown"
  | "aria-expanded"
  | "aria-controls"
  | "aria-haspopup"
> & {
  selectedView: {
    name: string;
    defaultLabel: "Your default" | "Project default" | null;
  } | null;
  count: number;
};

function translateDefaultLabel(
  defaultLabel: "Your default" | "Project default",
  t: (key: keyof (typeof tableMessages)["en"]) => string,
): string {
  return defaultLabel === "Your default"
    ? t("viewPresetsYourDefault")
    : t("viewPresetsProjectDefault");
}

export function TableViewPresetsButton({
  selectedView,
  count,
  ...props
}: TableViewPresetsButtonProps) {
  const t = useTranslation(tableMessages);
  const label = selectedView?.name ?? t("viewPresetsLabel");
  const title = selectedView?.defaultLabel
    ? `${label} (${translateDefaultLabel(selectedView.defaultLabel, t)})`
    : label;

  return (
    <Button
      {...props}
      variant={selectedView ? "default" : "outline"}
      className="max-w-64 gap-1.5"
      title={title}
    >
      <span className="truncate" title={title}>
        {label}
      </span>
      {selectedView ? (
        <DropdownIndicator nudge />
      ) : (
        <span className="bg-input rounded-sm px-1 text-xs">{count}</span>
      )}
    </Button>
  );
}
