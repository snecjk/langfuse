/* eslint-disable no-nested-ternary */
import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { StatusBadge } from "@/src/components/ui/StatusBadge/StatusBadge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { IntegrationSettingsSkeleton } from "@/src/features/analytics-integrations/components/IntegrationSettingsSkeleton";
import Link from "next/link";
import { useRouter } from "next/router";
import { BlobStorageIntegrationContainer } from "@/src/features/blobstorage-integration/components/BlobStorageIntegrationContainer";
import { useBlobStorageIntegration } from "@/src/features/blobstorage-integration/useBlobStorageIntegration";
import { BlobStorageStatusSection } from "@/src/features/blobstorage-integration/components/BlobStorageStatusSection";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export default function BlobStorageIntegrationPage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const t = useTranslation(integrationMessages);
  const {
    hasAccess,
    hasEntitlement,
    query: state,
    status,
  } = useBlobStorageIntegration(projectId);

  return (
    <ContainerPage
      headerProps={{
        title: t("blobStorageTitle"),
        breadcrumb: [
          { name: t("settings"), href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: status && <StatusBadge type={status} />,
        actionButtonsRight: (
          <Button asChild variant="secondary">
            <Link
              href="https://langfuse.com/docs/api-and-data-platform/features/export-to-blob-storage"
              target="_blank"
            >
              {t("integrationDocs")}
            </Link>
          </Button>
        ),
      }}
    >
      <p className="text-primary mb-4 text-sm">{t("blobStorageHelp")}</p>
      {!hasEntitlement ? (
        <p className="text-sm">{t("featureNotAvailable")}</p>
      ) : !hasAccess ? (
        <p className="text-sm">{t("noAccess")}</p>
      ) : (
        <>
          {state.data?.config && (
            <BlobStorageStatusSection config={state.data.config} />
          )}
          <Header title={t("configuration")} className="mt-8" />
          <Card className="p-3">
            {!state.data ? (
              <IntegrationSettingsSkeleton />
            ) : (
              <BlobStorageIntegrationContainer
                config={state.data.config ?? null}
                projectId={projectId}
                writeMode={state.data.writeMode}
                crossAccountRoleArn={state.data.crossAccountRoleArn}
                roleAuthRequiresUpgrade={state.data.roleAuthRequiresUpgrade}
              />
            )}
          </Card>
        </>
      )}
    </ContainerPage>
  );
}
