import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { FieldHeader } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/ProviderDialogController/components/FieldHeader";
import { providerIcons } from "@/src/features/ai-gateway/constants/providerIcons";
import { providerLabels } from "@/src/features/ai-gateway/constants/providerLabels";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import type { GatewayProvider } from "@/src/features/ai-gateway/types/gatewayProvider";

export function ProviderSelect({
  providers,
  value,
  onChange,
}: {
  providers: GatewayProvider[];
  value: GatewayProvider;
  onChange: (provider: GatewayProvider) => void;
}) {
  const t = useTranslation(gatewayMessages);
  const handleValueChange = (next: string) => {
    const provider = providers.find((candidate) => candidate === next);
    if (provider) onChange(provider);
  };

  return (
    <div>
      <FieldHeader
        htmlFor="gateway-provider"
        label={t("providerLabel")}
        description={t("providerDescription")}
      />
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id="gateway-provider">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => {
            const ProviderIcon = providerIcons[provider];
            return (
              <SelectItem key={provider} value={provider}>
                <span className="flex items-center gap-2">
                  <span className="bg-background flex size-6 shrink-0 items-center justify-center rounded-md border">
                    <ProviderIcon aria-hidden size="sm" />
                  </span>
                  {providerLabels[provider]}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
