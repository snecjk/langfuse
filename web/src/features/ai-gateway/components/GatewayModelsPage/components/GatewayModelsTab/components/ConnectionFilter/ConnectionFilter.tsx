import { SelectInput } from "@/src/components/design-system/SelectInput/SelectInput";
import { providerIcons } from "@/src/features/ai-gateway/constants/providerIcons";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import type { GatewayProvider } from "@/src/features/ai-gateway/types/gatewayProvider";

export type ConnectionFilterProps = {
  connections: ReadonlyArray<{
    id: string;
    name: string;
    provider: GatewayProvider;
  }>;
  value: string;
  onChange: (connectionId: string) => void;
};

export function ConnectionFilter({
  connections,
  value,
  onChange,
}: ConnectionFilterProps) {
  const t = useTranslation(gatewayMessages);
  return (
    <div className="ph-no-capture w-56 max-w-full">
      <SelectInput
        aria-label={t("connectionFilterAria")}
        placeholder={t("connectionFilterPlaceholder")}
        value={value}
        options={connections.map((connection) => ({
          value: connection.id,
          label: connection.name,
          icon: providerIcons[connection.provider],
        }))}
        onValueChange={onChange}
      />
    </div>
  );
}
