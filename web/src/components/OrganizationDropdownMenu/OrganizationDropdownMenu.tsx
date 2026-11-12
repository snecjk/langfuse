import {
  useTranslation,
  useInterfaceLocale,
} from "@/src/features/i18n/I18nProvider";
import { translate } from "@/src/features/i18n/messages";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";
import { DropdownMenu } from "@/src/components/design-system/DropdownMenu/DropdownMenu";
import { PlusIcon, Settings } from "@langfuse/icons";
import { type Session } from "next-auth";
import { type ComponentProps, useMemo } from "react";
import { env } from "@/src/env.mjs";
import { createOrganizationRoute } from "@/src/features/setup/setupRoutes";

type Organization = NonNullable<Session["user"]>["organizations"][number];

type OrganizationDropdownMenuProps = {
  children: ComponentProps<typeof DropdownMenu>["children"];
  canCreateOrganizations: boolean;
  getOrgPath: (organizationId: string) => string;
} & (
  | { state: "loading" }
  | {
      state: "loaded";
      organizations: Organization[];
    }
);

export function OrganizationDropdownMenu(props: OrganizationDropdownMenuProps) {
  const t = useTranslation(workspaceMessages);
  const locale = useInterfaceLocale();
  const { canCreateOrganizations, children, getOrgPath } = props;
  const organizations = props.state === "loaded" ? props.organizations : null;

  const items = useMemo<ComponentProps<typeof DropdownMenu>["items"]>(
    () => [
      ...(organizations
        ? [...organizations]
            .sort((a, b) => {
              const isDemoA = env.NEXT_PUBLIC_DEMO_ORG_ID === a.id;
              const isDemoB = env.NEXT_PUBLIC_DEMO_ORG_ID === b.id;
              if (isDemoA) return 1;
              if (isDemoB) return -1;
              return 0;
            })
            .flatMap((organization) => [
              ...(env.NEXT_PUBLIC_DEMO_ORG_ID === organization.id
                ? [{ type: "separator" as const, id: "demo-separator" }]
                : []),
              {
                type: "item" as const,
                id: organization.id,
                noCapture: true,
                title: organization.name,
                href: getOrgPath(organization.id),
                secondaryAction: {
                  href: `/organization/${organization.id}/settings`,
                  ariaLabel: translate(
                    locale,
                    workspaceMessages,
                    "settingsFor",
                    { name: organization.name },
                  ),
                  icon: Settings,
                },
              },
            ])
        : [{ type: "loading" as const, id: "loading" }]),
    ],
    [getOrgPath, organizations, locale],
  );

  return (
    <DropdownMenu
      title={t("organizations")}
      headerAction={
        canCreateOrganizations
          ? {
              text: t("new"),
              tooltip: t("newOrganization"),
              href: createOrganizationRoute,
              icon: PlusIcon,
            }
          : undefined
      }
      items={items}
      search={{ placeholder: t("searchOrganizations") }}
      emptyText={t("noOrganizations")}
    >
      {children}
    </DropdownMenu>
  );
}
