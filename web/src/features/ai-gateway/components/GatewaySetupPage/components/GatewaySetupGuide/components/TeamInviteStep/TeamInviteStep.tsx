import { Button } from "@/src/components/design-system/Button/Button";
import { Stepper } from "@/src/components/design-system/Stepper/Stepper";
import {
  TeamInviteForm,
  type TeamInviteFormProps,
} from "@/src/features/ai-gateway/components/GatewaySetupPage/components/GatewaySetupGuide/components/TeamInviteStep/components/TeamInviteForm/TeamInviteForm";
import { TEAM_NOTIFY_COPY } from "@/src/features/ai-gateway/constants/gatewayTeamInvites";
import type { getSetupStepStatus } from "@/src/features/ai-gateway/components/GatewaySetupPage/components/GatewaySetupGuide/fns/getSetupStepStatus";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

export type TeamInviteStepProps = TeamInviteFormProps & {
  status: ReturnType<typeof getSetupStepStatus>;
};

export function TeamInviteStep({ status, ...formProps }: TeamInviteStepProps) {
  const t = useTranslation(gatewayMessages);
  return (
    <Stepper
      number={3}
      title={t("teamInviteStepTitle")}
      status={status}
      isCollapsible={false}
      description={
        <>
          {TEAM_NOTIFY_COPY.description}
          {status === "current" ? (
            <>
              {" "}
              <Button
                variant="text"
                text={t("aboutRoles")}
                href={TEAM_NOTIFY_COPY.rolesDocsUrl}
              />
            </>
          ) : null}
        </>
      }
    >
      {status === "current" ? <TeamInviteForm {...formProps} /> : null}
    </Stepper>
  );
}
