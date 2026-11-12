import { Switch } from "@/src/components/design-system/Switch/Switch";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type ModelEnabledSwitchProps = {
  model: string;
  enabled: boolean;
  onToggle: (model: string, enabled: boolean) => void;
};

export function ModelEnabledSwitch({
  model,
  enabled,
  onToggle,
}: ModelEnabledSwitchProps) {
  const t = useTranslation(gatewayMessages);
  const handleCheckedChange = (checked: boolean) => onToggle(model, checked);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Switch
        color="green"
        checked={enabled}
        aria-label={
          enabled ? t("disableModel", { model }) : t("enableModel", { model })
        }
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}
