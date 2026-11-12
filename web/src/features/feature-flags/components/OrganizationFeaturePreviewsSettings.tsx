/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { useState } from "react";
import { useSession } from "next-auth/react";

import Header from "@/src/components/layouts/header";
import { Switch } from "@/src/components/design-system/Switch/Switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Card } from "@/src/components/ui/card";
import {
  featurePreviewFlags,
  featurePreviewLabels,
  defaultOnFeaturePreviewFlags,
  type FeaturePreviewFlag,
} from "@/src/features/feature-flags/available-flags";
import { OrganizationFeaturePreviewIntro } from "./OrganizationFeaturePreviewIntro";
import { PersonalEnablementWarning } from "./PersonalEnablementWarning";
import { canOpenPersonalFeaturePreviews } from "@/src/features/feature-previews/canOpenPersonalFeaturePreviews";
import { ControlledFeaturePreviewModal } from "@/src/features/feature-previews/components/ControlledFeaturePreviewModal";
import { useLangfuseCloudRegion } from "@/src/features/organizations/hooks";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { api } from "@/src/utils/api";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

type ProposedChange = {
  flag: FeaturePreviewFlag;
  enabled: boolean;
};

export function OrganizationFeaturePreviewsSettings({
  orgId,
}: {
  orgId: string;
}) {
  const [proposedChange, setProposedChange] = useState<ProposedChange | null>(
    null,
  );
  const [personalPreviewsOpen, setPersonalPreviewsOpen] = useState(false);
  const session = useSession();
  const { isLangfuseCloud } = useLangfuseCloudRegion();
  const capture = usePostHogClientCapture();
  const t = useTranslation(enterpriseMessages);
  const canOpenPersonalPreviews = canOpenPersonalFeaturePreviews({
    session: session.data,
    isLangfuseCloud,
  });
  const openPersonalPreviews = (source: "description" | "preview_row") => {
    capture("organization_settings:personal_feature_previews_opened", {
      source,
    });
    setPersonalPreviewsOpen(true);
  };
  const handleOpenFromDescription = () => {
    openPersonalPreviews("description");
  };
  const handleOpenFromPreviewRow = () => {
    openPersonalPreviews("preview_row");
  };
  const utils = api.useUtils();
  const defaultsQuery = api.organizations.getFeatureFlagOrgDefaults.useQuery({
    orgId,
  });
  const updateDefault = api.organizations.setFeatureFlagOrgDefault.useMutation({
    onSuccess: async (_result, variables) => {
      capture("organization_settings:feature_flag_default_toggled", {
        feature: variables.flag,
        isEnabled: variables.enabled,
      });
      setProposedChange(null);
      await Promise.all([
        utils.organizations.getFeatureFlagOrgDefaults.invalidate({ orgId }),
        utils.members.allFromOrg.invalidate(),
        session.update(),
      ]);
      showSuccessToast({
        operation: "organization_feature_preview.update",
        title: t("featurePreviewsUpdatedTitle"),
        description: t("featurePreviewsUpdatedDescription", {
          name: featurePreviewLabels[variables.flag],
          state: variables.enabled
            ? t("featurePreviewStateEnabled")
            : t("featurePreviewStateDisabled"),
        }),
      });
    },
    onError: (error) => {
      setProposedChange(null);
      showErrorToast(
        t("featurePreviewsUpdateFailed"),
        error.message,
        classifyTrpcToastError(error, "organization_feature_preview.update"),
      );
    },
  });

  if (defaultsQuery.isError) {
    return (
      <Alert variant="destructive">
        <Alert.Title>{t("featurePreviewsUnavailable")}</Alert.Title>
        <Alert.Description>{defaultsQuery.error.message}</Alert.Description>
      </Alert>
    );
  }

  const selectedDefaults = new Set(defaultsQuery.data?.defaults ?? []);
  const memberCount = defaultsQuery.data?.memberCount ?? 0;
  const experimentalFeaturesEnabled =
    session.data?.environment.enableExperimentalFeatures === true;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Header title={t("featurePreviewsAdminTitle")} />
        <OrganizationFeaturePreviewIntro
          canOpenPersonalPreviews={canOpenPersonalPreviews}
          onOpenPersonalPreviews={handleOpenFromDescription}
        />
      </div>

      {experimentalFeaturesEnabled ? (
        <Alert>
          <Alert.Title>{t("featurePreviewsExperimentalTitle")}</Alert.Title>
          <Alert.Description>
            {t("featurePreviewsExperimentalDescription")}
          </Alert.Description>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3">
        {featurePreviewFlags.map((flag) => {
          const selected = selectedDefaults.has(flag);
          const enabledForAdmin =
            session.data?.user?.featureFlags[flag] === true;
          const requiresPersonalEnablement = !selected && !enabledForAdmin;
          return (
            <Card
              key={flag}
              className="flex items-start justify-between gap-6 p-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-bold">{featurePreviewLabels[flag]}</h3>
                {defaultOnFeaturePreviewFlags.some(
                  (defaultFlag) => defaultFlag === flag,
                ) ? (
                  <p className="text-muted-foreground text-xs">
                    {t("featurePreviewsDefaultOnHelp")}
                  </p>
                ) : null}
                {requiresPersonalEnablement ? (
                  <PersonalEnablementWarning
                    canOpenPersonalPreviews={canOpenPersonalPreviews}
                    onOpenPersonalPreviews={handleOpenFromPreviewRow}
                  />
                ) : null}
              </div>
              <Switch
                aria-label={t("featurePreviewToggle", {
                  name: featurePreviewLabels[flag],
                })}
                checked={experimentalFeaturesEnabled || selected}
                disabled={
                  experimentalFeaturesEnabled ||
                  defaultsQuery.isPending ||
                  updateDefault.isPending ||
                  requiresPersonalEnablement
                }
                onCheckedChange={(enabled) =>
                  setProposedChange({ flag, enabled })
                }
              />
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        {t("featurePreviewsDefaultsFooter")}
      </p>

      <AlertDialog
        open={proposedChange !== null}
        onOpenChange={(open) => {
          if (!open && !updateDefault.isPending) setProposedChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {proposedChange?.enabled
                ? t("featurePreviewsEnableConfirm")
                : t("featurePreviewsDisableConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("featurePreviewsConfirmDescription", {
                action: proposedChange?.enabled
                  ? t("featurePreviewsEnableVerb")
                  : t("featurePreviewsDisableVerb"),
                name: proposedChange
                  ? featurePreviewLabels[proposedChange.flag]
                  : "",
                count:
                  memberCount === 1
                    ? `1 ${t("featurePreviewsMemberSuffixSingular")}`
                    : `${memberCount} ${t("featurePreviewsMemberSuffix")}`,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {proposedChange?.enabled ? (
            <Alert>
              <Alert.Title>{t("featurePreviewsAlreadyEnabled")}</Alert.Title>
              <Alert.Description>
                {t("featurePreviewsAlreadyEnabledDescription")}
              </Alert.Description>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateDefault.isPending}>
              {t("retryMigrationCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateDefault.isPending || proposedChange === null}
              onClick={() => {
                if (!proposedChange) return;
                updateDefault.mutate({ orgId, ...proposedChange });
              }}
            >
              {t("externalMediaStorageSave")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canOpenPersonalPreviews ? (
        <ControlledFeaturePreviewModal
          open={personalPreviewsOpen}
          onOpenChange={setPersonalPreviewsOpen}
        />
      ) : null}
    </div>
  );
}
