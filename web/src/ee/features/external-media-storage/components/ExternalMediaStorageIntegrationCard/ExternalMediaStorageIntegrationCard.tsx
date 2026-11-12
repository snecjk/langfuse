import Link from "next/link";

import { ActionButton } from "@/src/components/ActionButton";
import { type Status } from "@/src/components/ui/StatusBadge/StatusBadge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { IntegrationCardHeader } from "@/src/features/projects/components/IntegrationCardHeader/IntegrationCardHeader";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export type ExternalMediaStorageIntegrationCardProps = {
  projectId: string;
  /** Whether the user may manage integrations (`integrations:CRUD`). */
  hasAccess: boolean;
  /** Whether the organization passes the external media storage gate. */
  hasEntitlement: boolean;
  isLoading: boolean;
  status: Status | undefined;
};

export function ExternalMediaStorageIntegrationCard({
  projectId,
  hasAccess,
  hasEntitlement,
  isLoading,
  status,
}: ExternalMediaStorageIntegrationCardProps) {
  const t = useTranslation(enterpriseMessages);
  return (
    <Card className="p-3">
      <IntegrationCardHeader
        status={status}
        isLoading={isLoading}
        hasAccess={hasAccess}
      >
        <span className="font-bold">{t("externalMediaStorageTitle")}</span>
      </IntegrationCardHeader>
      <p className="text-primary mb-4 text-sm">
        {t("externalMediaStorageDescription")}
      </p>
      <div className="flex items-center gap-2">
        <ActionButton
          variant="secondary"
          hasAccess={hasAccess}
          hasEntitlement={hasEntitlement}
          href={`/project/${projectId}/settings/integrations/external-media-storage`}
        >
          {t("externalMediaStorageConfigure")}
        </ActionButton>
        <Button asChild variant="ghost">
          <Link
            href="https://langfuse.com/docs/observability/features/multi-modality#external-s3-media"
            target="_blank"
          >
            {t("externalMediaStorageDocs")}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
