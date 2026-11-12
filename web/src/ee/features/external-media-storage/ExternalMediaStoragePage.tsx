import Link from "next/link";
import { useRouter } from "next/router";

import ContainerPage from "@/src/components/layouts/ContainerPage";
import Header from "@/src/components/layouts/header";
import { Button as DesignSystemButton } from "@/src/components/design-system/Button/Button";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";
import { Button } from "@/src/components/ui/button";
import { StatusBadge } from "@/src/components/ui/StatusBadge/StatusBadge";
import { Card } from "@/src/components/ui/card";
import { IntegrationSettingsSkeleton } from "@/src/features/analytics-integrations/components/IntegrationSettingsSkeleton";
import { ExternalMediaStorageForm } from "@/src/ee/features/external-media-storage/components/ExternalMediaStorageForm/ExternalMediaStorageForm";
import { TestMediaObjectDialog } from "@/src/ee/features/external-media-storage/components/TestMediaObjectDialog/TestMediaObjectDialog";
import { testSignedMediaUrlCors } from "@/src/ee/features/external-media-storage/fns/testSignedMediaUrlCors";
import { type ExternalMediaStorageFormValues } from "@/src/ee/features/external-media-storage/types";
import { useExternalMediaStorage } from "@/src/ee/features/external-media-storage/useExternalMediaStorage";
import { useExternalMediaStorageExternalId } from "@/src/ee/features/external-media-storage/useExternalMediaStorageExternalId";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

const EXTERNAL_MEDIA_STORAGE_FORM_ID = "external-media-storage-form";

const defaultValues: ExternalMediaStorageFormValues = {
  type: "S3",
  authType: "ACCESS_KEYS",
  bucketName: "",
  endpoint: null,
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
  roleArn: "",
  prefix: "",
  forcePathStyle: false,
};

export default function ExternalMediaStoragePage() {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const {
    hasAccess,
    featureAvailability,
    isFeatureEnabled,
    query: configuration,
    status,
  } = useExternalMediaStorage(projectId);
  const utils = api.useUtils();
  const t = useTranslation(enterpriseMessages);
  const updateMutation = api.externalMediaStorage.update.useMutation({
    onSuccess: async () => {
      // Saving or deleting can replace or remove the external ID.
      await utils.externalMediaStorage.getExternalId.reset({ projectId });
      await utils.externalMediaStorage.invalidate();
      showSuccessToast({
        operation: "external_media_storage.save",
        title: t("externalMediaStorageSaved"),
        description: t("externalMediaStorageSavedDescription"),
      });
    },
    onError: (error) => {
      showErrorToast(
        t("externalMediaStorageSaveFailed"),
        error.message,
        classifyTrpcToastError(error, "external_media_storage.save"),
      );
    },
  });
  const deleteMutation = api.externalMediaStorage.delete.useMutation({
    onSuccess: async () => {
      // Saving or deleting can replace or remove the external ID.
      await utils.externalMediaStorage.getExternalId.reset({ projectId });
      await utils.externalMediaStorage.invalidate();
      showSuccessToast({
        operation: "external_media_storage.delete",
        title: t("externalMediaStorageDeleted"),
        description: t("externalMediaStorageDeletedDescription"),
      });
    },
    onError: (error) => {
      showErrorToast(
        t("externalMediaStorageDeleteFailed"),
        error.message,
        classifyTrpcToastError(error, "external_media_storage.delete"),
      );
    },
  });
  const testMutation = api.externalMediaStorage.testObject.useMutation();
  const config = configuration.data?.config;
  const externalId = useExternalMediaStorageExternalId(
    projectId,
    Boolean(config?.hasExternalId),
  );
  const initialValues: ExternalMediaStorageFormValues = config
    ? {
        type: config.type,
        authType: config.authType,
        bucketName: config.bucketName,
        endpoint: config.endpoint,
        region: config.region,
        accessKeyId: config.accessKeyId ?? "",
        secretAccessKey: "",
        roleArn: config.roleArn ?? "",
        prefix: config.prefix ?? "",
        forcePathStyle: config.forcePathStyle,
      }
    : defaultValues;

  const renderTestAction = () => {
    if (config) {
      return (
        <DialogController
          renderDialog={() => (
            <TestMediaObjectDialog
              isPending={testMutation.isPending}
              onTest={async (uri) => {
                let failureOrigin: "trpc" | "network" = "trpc";
                try {
                  const result = await testMutation.mutateAsync({
                    projectId,
                    uri,
                  });
                  failureOrigin = "network";
                  await testSignedMediaUrlCors(result.signedUrl);
                  return result.signedUrl;
                } catch (error) {
                  showErrorToast(
                    t("externalMediaStorageTestFailed"),
                    error instanceof Error
                      ? error.message
                      : t("externalMediaStorageTestCorsFailed"),
                    failureOrigin === "trpc"
                      ? classifyTrpcToastError(
                          error,
                          "external_media_storage.test",
                        )
                      : {
                          operation: "external_media_storage.test",
                          errorOrigin: "network",
                          errorCategory: "transient",
                        },
                  );
                  return null;
                }
              }}
            />
          )}
        >
          {({ openDialog }) => (
            <DesignSystemButton
              text={t("externalMediaStorageTest")}
              variant="secondary"
              onClick={openDialog}
            />
          )}
        </DialogController>
      );
    }

    if (!config) {
      return (
        <Tooltip label={t("externalMediaStorageSaveFirst")}>
          {({ getTriggerProps }) => (
            <span {...getTriggerProps()}>
              <DesignSystemButton
                text={t("externalMediaStorageTest")}
                variant="secondary"
                disabled
              />
            </span>
          )}
        </Tooltip>
      );
    }

    return null;
  };

  return (
    <ContainerPage
      headerProps={{
        title: t("externalMediaStorageTitle"),
        breadcrumb: [
          { name: "Settings", href: `/project/${projectId}/settings` },
        ],
        actionButtonsLeft: status && <StatusBadge type={status} />,
        actionButtonsRight: (
          <Button asChild variant="secondary">
            <Link
              href="https://langfuse.com/docs/observability/features/multi-modality#external-s3-media"
              target="_blank"
            >
              {t("externalMediaStorageDocs")}
            </Link>
          </Button>
        ),
      }}
    >
      <p className="text-primary mb-4 text-sm">
        {t("externalMediaStorageDescription")}
      </p>
      {(() => {
        if (featureAvailability.isPending) {
          return <IntegrationSettingsSkeleton />;
        }

        if (!isFeatureEnabled) {
          return (
            <p className="text-sm">{t("externalMediaStorageEnterprise")}</p>
          );
        }

        if (!hasAccess) {
          return <p className="text-sm">{t("externalMediaStorageNoAccess")}</p>;
        }

        return (
          <>
            <Header title={t("externalMediaStorageConfiguration")} />
            {configuration.isLoading || !configuration.data ? (
              <Card className="p-3">
                <IntegrationSettingsSkeleton />
              </Card>
            ) : (
              <ExternalMediaStorageForm
                key={config?.updatedAt?.toString() ?? "new"}
                formId={EXTERNAL_MEDIA_STORAGE_FORM_ID}
                initialValues={initialValues}
                secretAccessKeyDisplay={config?.secretAccessKeyDisplay}
                crossAccountRoleArn={configuration.data.crossAccountRoleArn}
                roleAuthRequiresUpgrade={
                  configuration.data.roleAuthRequiresUpgrade
                }
                externalId={externalId}
                onSubmit={(values) =>
                  updateMutation.mutate({ projectId, ...values })
                }
                renderActions={({ isDirty }) => (
                  <>
                    {renderTestAction()}
                    {config ? (
                      <ConfirmationDialogController
                        title={t("externalMediaStorageDeleteConfirmTitle")}
                        text={t("externalMediaStorageDeleteConfirmText")}
                        confirmLabel={t("externalMediaStorageDelete")}
                        variant="destructive"
                        loading={deleteMutation.isPending}
                        onConfirm={() =>
                          deleteMutation.mutateAsync({ projectId })
                        }
                      >
                        {({ openDialog }) => (
                          <DesignSystemButton
                            text={t("externalMediaStorageDelete")}
                            variant="destructive"
                            onClick={openDialog}
                          />
                        )}
                      </ConfirmationDialogController>
                    ) : null}
                    {!isDirty ? (
                      <Tooltip label={t("externalMediaStorageMakeChange")}>
                        {({ getTriggerProps }) => (
                          <span {...getTriggerProps()}>
                            <DesignSystemButton
                              text={t("externalMediaStorageSave")}
                              form={EXTERNAL_MEDIA_STORAGE_FORM_ID}
                              type="submit"
                              disabled
                            />
                          </span>
                        )}
                      </Tooltip>
                    ) : (
                      <DesignSystemButton
                        text={t("externalMediaStorageSave")}
                        form={EXTERNAL_MEDIA_STORAGE_FORM_ID}
                        type="submit"
                        loading={updateMutation.isPending}
                      />
                    )}
                  </>
                )}
              />
            )}
          </>
        );
      })()}
    </ContainerPage>
  );
}
