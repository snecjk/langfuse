import {
  BookOpen,
  KeyRound,
  PlusIcon,
  Settings,
  Waypoints,
} from "@langfuse/icons";

import { Button } from "@/src/components/design-system/Button/Button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { GATEWAY_OVERVIEW_DOCS_URL } from "@/src/features/ai-gateway/constants/gatewayDocsUrls";
import { createProjectRoute } from "@/src/features/setup/setupRoutes";
import { buildGatewayPagePath } from "@/src/features/ai-gateway/fns/gatewayUrls/buildGatewayPagePath";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";

export type OrganizationSettingsTileState =
  | "noProjects"
  | "noProjectAccess"
  | "gatewayLoading"
  | "gatewaySetupPending"
  | "gatewayNoKey"
  | "gatewayHasKey";

export type OrganizationSettingsTileProps = {
  orgId: string;
  orgName: string;
  state: OrganizationSettingsTileState;
};

/** OrganizationSettingsTile shows a member without projects their next step in the org */
export function OrganizationSettingsTile({
  orgId,
  orgName,
  state,
}: OrganizationSettingsTileProps) {
  const t = useTranslation(workspaceMessages);
  const actions = tileActions(t, state, orgId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isGatewayState(state) && (
            <Waypoints size="base" color="default" aria-hidden="true" />
          )}
          {isGatewayState(state) ? "AI Gateway" : t("noProjectsTitle")}
        </CardTitle>
        <CardDescription>
          {state === "gatewayLoading" ? (
            <Skeleton className="h-5 w-2/3" />
          ) : (
            tileDescription(t, state, orgName)
          )}
        </CardDescription>
      </CardHeader>
      {actions !== null && <CardFooter className="gap-2">{actions}</CardFooter>}
    </Card>
  );
}

function isGatewayState(state: OrganizationSettingsTileState) {
  return state.startsWith("gateway");
}

function tileDescription(
  t: ReturnType<typeof useTranslation<typeof workspaceMessages>>,
  state: Exclude<OrganizationSettingsTileState, "gatewayLoading">,
  orgName: string,
) {
  switch (state) {
    case "noProjects":
      return t("noProjectsHelp");
    case "noProjectAccess":
      return t("noProjectAccessHelp");
    case "gatewaySetupPending":
      return t("gatewayPendingHelp", { name: orgName });
    case "gatewayNoKey":
      return t("gatewayNoKeyHelp", { name: orgName });
    case "gatewayHasKey":
      return t("gatewayHasKeyHelp", { name: orgName });
  }
}

function tileActions(
  t: ReturnType<typeof useTranslation<typeof workspaceMessages>>,
  state: OrganizationSettingsTileState,
  orgId: string,
) {
  const settingsButton = (
    <Button
      variant="secondary"
      href={`/organization/${orgId}/settings`}
      icon={Settings}
      text={t("organizationSettingsTile")}
    />
  );
  const keysHref = buildGatewayPagePath(orgId, "api-keys");
  const docsButton = (
    <Button
      variant="secondary"
      href={GATEWAY_OVERVIEW_DOCS_URL}
      icon={BookOpen}
      text={t("whatsTheAiGateway")}
    />
  );

  switch (state) {
    case "noProjects":
      return (
        <>
          <Button
            href={createProjectRoute(orgId)}
            icon={PlusIcon}
            text={t("newProject")}
          />
          {settingsButton}
        </>
      );
    case "noProjectAccess":
      return settingsButton;
    case "gatewayLoading":
      return null;
    case "gatewaySetupPending":
      return docsButton;
    case "gatewayNoKey":
      return (
        <>
          <Button
            href={keysHref}
            icon={KeyRound}
            text={t("createGatewayKey")}
          />
          {docsButton}
        </>
      );
    case "gatewayHasKey":
      return (
        <>
          <Button
            variant="secondary"
            href={keysHref}
            icon={KeyRound}
            text={t("manageGatewayKeys")}
          />
          <Button
            variant="secondary"
            href={buildGatewayPagePath(orgId, "models")}
            text={t("viewModels")}
          />
        </>
      );
  }
}
