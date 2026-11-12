import { type ReactNode } from "react";
import { ExternalLink } from "@langfuse/icons";

import { Button } from "@/src/components/ui/button";
import { useHasOrganizationAccess } from "@/src/features/rbac/utils/checkOrganizationAccess";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { accountMessages } from "@/src/features/i18n/messages/account";

export function openAIFeaturesSettings(organizationId: string) {
  window.open(
    `/organization/${organizationId}/settings`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function AIFeaturesDisabledNotice({
  organizationId,
  children,
  onSettingsOpened,
}: {
  organizationId: string | undefined;
  children: ReactNode;
  onSettingsOpened?: () => void;
}) {
  const t = useTranslation(accountMessages);
  const canUpdateOrgSettings = useHasOrganizationAccess({
    organizationId,
    scope: "organization:update",
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        {children}
        {!canUpdateOrgSettings ? ` ${t("aiFeaturesDisabledHelp")}` : null}
      </p>
      {canUpdateOrgSettings && organizationId ? (
        <Button
          onClick={() => {
            openAIFeaturesSettings(organizationId);
            onSettingsOpened?.();
          }}
          variant="outline"
          size="sm"
          className="w-fit"
        >
          {t("enableAiFeaturesButton")}
          <ExternalLink size="base" color="default" __rawClassName="ml-2" />
        </Button>
      ) : null}
    </div>
  );
}
