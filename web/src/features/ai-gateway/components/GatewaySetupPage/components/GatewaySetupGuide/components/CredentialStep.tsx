import { Plus } from "@langfuse/icons";

import { Button } from "@/src/components/design-system/Button/Button";
import { Stepper } from "@/src/components/design-system/Stepper/Stepper";
import { GATEWAY_SETUP } from "@/src/features/ai-gateway/components/GatewaySetupPage/constants/gatewaySetup";
import type { getSetupStepStatus } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/GatewaySetupGuide/fns/getSetupStepStatus";
import { providerLabels } from "@/src/features/ai-gateway/constants/providerLabels";
import { formatAvailableGatewayProviderNames } from "@/src/features/ai-gateway/fns/formatAvailableGatewayProviderNames";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";
import type { GatewayConnection } from "@/src/features/ai-gateway/types/gatewayProvider";

export type CredentialStepProps = {
  status: ReturnType<typeof getSetupStepStatus>;
  firstConnection: Pick<GatewayConnection, "provider"> | undefined;
  onAddCredential: () => void;
};

function CredentialStepDescription({
  status,
  firstConnection,
  t,
}: Pick<CredentialStepProps, "status" | "firstConnection"> & {
  t: ReturnType<typeof useTranslation<typeof gatewayMessages>>;
}) {
  if (status === "complete" && firstConnection) {
    return (
      <>
        {t("credentialAddedFor", {
          provider: providerLabels[firstConnection.provider],
        })}
      </>
    );
  }
  const providerNames = formatAvailableGatewayProviderNames();
  return (
    <>
      {t("addProviderCredentialDescription", { providers: providerNames })}
      {status === "current" ? (
        <>
          {" "}
          <Button
            variant="text"
            text={t("howCredentialsWork")}
            href={GATEWAY_SETUP.docsUrl}
          />
        </>
      ) : null}
    </>
  );
}

export function CredentialStep({
  status,
  firstConnection,
  onAddCredential,
}: CredentialStepProps) {
  const t = useTranslation(gatewayMessages);
  return (
    <Stepper
      number={2}
      title={t("addProviderCredentialTitle")}
      status={status}
      isCollapsible={false}
      description={
        <CredentialStepDescription
          status={status}
          firstConnection={firstConnection}
          t={t}
        />
      }
    >
      {status === "current" ? (
        <div className="flex flex-col items-start pt-1">
          <Button
            text={t("addCredential")}
            icon={Plus}
            onClick={onAddCredential}
          />
        </div>
      ) : null}
    </Stepper>
  );
}
