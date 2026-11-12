import { useSession } from "next-auth/react";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import { env } from "@/src/env.mjs";
import { DemoOrganizationTile } from "@/src/features/organizations/components/DemoOrganizationTile";
import { GetStartedCard } from "@/src/features/organizations/components/GetStartedCard/GetStartedCard";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";

/** NoOrganizationPage is the app root for users without an organization of their own */
export const NoOrganizationPage = () => {
  const t = useTranslation(workspaceMessages);
  const session = useSession();
  const user = session.data?.user;

  if (!user) return t("loading");

  const hasDemoOrganization = user.organizations.some(
    (org) => org.id === env.NEXT_PUBLIC_DEMO_ORG_ID,
  );

  return (
    <ContainerPage headerProps={{ title: t("welcomeToLangfuse") }}>
      <div className="flex flex-col gap-5">
        <GetStartedCard canCreateOrganizations={user.canCreateOrganizations} />
        {hasDemoOrganization && <DemoOrganizationTile />}
      </div>
    </ContainerPage>
  );
};
