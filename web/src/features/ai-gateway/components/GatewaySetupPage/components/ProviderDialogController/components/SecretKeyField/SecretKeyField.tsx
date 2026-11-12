import type { ChangeEvent, ReactNode } from "react";

import { Input } from "@/src/components/design-system/Input/Input";
import { FieldHeader } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/ProviderDialogController/components/FieldHeader";
import { providerLabels } from "@/src/features/ai-gateway/constants/providerLabels";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import type { GatewayProvider } from "@/src/features/ai-gateway/types/gatewayProvider";

export type SecretKeyFieldProps = {
  provider: GatewayProvider;
  credential: string;
  /** Editing a saved credential, where a blank key keeps the stored one. */
  hasSavedKey: boolean;
  onCredentialChange: (credential: string) => void;
};

export function SecretKeyField({
  provider,
  credential,
  hasSavedKey,
  onCredentialChange,
}: SecretKeyFieldProps) {
  const t = useTranslation(gatewayMessages);

  const label = t("credentialKeyLabel", { provider: providerLabels[provider] });
  const placeholder = t("credentialKeyPlaceholder", {
    provider: providerLabels[provider],
  });

  const descriptionKey = (() => {
    if (provider === "OPENAI") return "credentialKeyDescriptionOpenai";
    if (provider === "ANTHROPIC") return "credentialKeyDescriptionAnthropic";
    return "credentialKeyDescriptionBedrock";
  })();

  const description: ReactNode =
    provider === "BEDROCK" ? (
      <>{t("credentialKeyDescriptionBedrock")}</>
    ) : (
      <>
        {t(descriptionKey)}{" "}
        <DocsLink
          href={
            provider === "OPENAI"
              ? "https://platform.openai.com/api-keys"
              : "https://console.anthropic.com/settings/keys"
          }
        >
          API keys
        </DocsLink>
      </>
    );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCredentialChange(event.target.value);
  };

  return (
    <div className="ph-no-capture">
      <FieldHeader
        htmlFor="gateway-secret-key"
        label={label}
        description={description}
      />
      <Input
        id="gateway-secret-key"
        type="password"
        autoComplete="new-password"
        placeholder={
          hasSavedKey ? t("credentialKeyPlaceholderSaved") : placeholder
        }
        value={credential}
        onChange={handleChange}
      />
    </div>
  );
}

function DocsLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-link hover:text-link-hover underline"
    >
      {children}
    </a>
  );
}
