import { ArrowUpRight, Check } from "@langfuse/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "@/src/components/design-system/Button/Button";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import { DropdownMenu } from "@/src/components/design-system/DropdownMenu/DropdownMenu";
import { Button as MenuTriggerButton } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { PopoverLayerProvider } from "@/src/context/LayerContext/PopoverLayerProvider";
import {
  type GatewayLaunchState,
  type GatewayLaunchTarget,
} from "@/src/features/ai-gateway/hooks/useGatewayLaunchEligibility";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { GatewayHero } from "@/src/features/ai-gateway/components/GatewayLaunch/GatewayHero";
import { GATEWAY_OVERVIEW_DOCS_URL } from "@/src/features/ai-gateway/constants/gatewayDocsUrls";
import { buildGatewayPagePath } from "@/src/features/ai-gateway/fns/gatewayUrls/buildGatewayPagePath";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { gatewayMessages } from "@/src/features/i18n/messages/gateway";

const copy = {
  admin: {
    titleKey: "launchDialogAdminTitle",
    leadKey: "launchDialogAdminLead",
    pointKeys: [
      "launchDialogAdminPoint1",
      "launchDialogAdminPoint2",
      "launchDialogAdminPoint3",
      "launchDialogAdminPoint4",
    ] as const,
  },
  member: {
    titleKey: "launchDialogMemberTitle",
    leadKey: "launchDialogMemberLead",
    pointKeys: [
      "launchDialogMemberPoint1",
      "launchDialogMemberPoint2",
    ] as const,
  },
} as const;

export function GatewayLaunchDialog({
  organizationId,
  state,
  setupOptions,
  open,
  onOpenChange,
}: {
  organizationId: string;
  state: GatewayLaunchState;
  setupOptions: GatewayLaunchTarget["setupOptions"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslation(gatewayMessages);
  const capture = usePostHogClientCapture();
  const router = useRouter();
  // Menus inside the dialog portal here, so the modal does not hide them from assistive tech.
  const [popoverContainer, setPopoverContainer] =
    useState<HTMLDivElement | null>(null);
  const { titleKey, leadKey, pointKeys } =
    copy[state === "get-key" ? "member" : "admin"];
  const title = t(titleKey);
  const lead = t(leadKey);
  const points = pointKeys.map((k) => t(k));
  const setupHref = (orgId: string) => buildGatewayPagePath(orgId);

  return (
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- design-system Dialog has no hero slot
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- design-system Dialog has no hero slot */}
      <DialogContent
        className="max-w-160 overflow-visible"
        closeOnInteractionOutside
        overlayMode="subtle"
      >
        <PopoverLayerProvider container={popoverContainer}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-lg">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <GatewayHero />
              <div className="flex shrink-0 flex-col gap-2 px-8 pt-6 pb-8">
                {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- design-system Dialog has no hero slot */}
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {title}
                </DialogTitle>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {lead}
                </p>
                <ul className="text-muted-foreground mt-2 flex flex-col gap-1 text-sm">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="text-dark-green flex">
                        <Check size="sm" color="inherit" aria-hidden="true" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t px-8 py-4">
              <Link
                href={GATEWAY_OVERVIEW_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  capture("ai_gateway_launch:dialog_learn_more_clicked", {
                    state,
                  })
                }
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
              >
                {t("learnMore")}
                <ArrowUpRight size="sm" aria-hidden="true" />
              </Link>
              {state === "setup" && setupOptions.length > 1 && (
                <DropdownMenu
                  title={t("selectOrganization")}
                  items={setupOptions.map((option) => ({
                    type: "item",
                    id: option.organizationId,
                    title: option.organizationName,
                    onClick: () => {
                      capture("ai_gateway_launch:dialog_setup_clicked");
                      router.push(setupHref(option.organizationId));
                    },
                  }))}
                >
                  {({ getTriggerProps }) => (
                    /** The design-system Button does not forward floating-ui trigger handlers. */
                    <MenuTriggerButton
                      className="gap-1.5"
                      {...getTriggerProps()}
                    >
                      {t("setUpGateway")}
                      <DropdownIndicator nudge />
                    </MenuTriggerButton>
                  )}
                </DropdownMenu>
              )}
              {state === "setup" && setupOptions.length <= 1 && (
                <span
                  onClick={() =>
                    capture("ai_gateway_launch:dialog_setup_clicked")
                  }
                >
                  <Button
                    variant="primary"
                    text={t("setUpGateway")}
                    href={setupHref(organizationId)}
                  />
                </span>
              )}
              {state === "get-key" && (
                <span
                  onClick={() =>
                    capture("ai_gateway_launch:dialog_get_key_clicked")
                  }
                >
                  <Button
                    variant="primary"
                    text={t("getGatewayKey")}
                    href={buildGatewayPagePath(organizationId, "api-keys")}
                  />
                </span>
              )}
              {state === "ask-admin" && (
                <p role="status" className="text-muted-foreground text-sm">
                  {t("askAdminToSetup")}
                </p>
              )}
            </div>
          </div>
        </PopoverLayerProvider>
        <div
          className="isolate"
          data-layer="popover"
          ref={setPopoverContainer}
        />
      </DialogContent>
    </Dialog>
  );
}
