import Header from "@/src/components/layouts/header";
import ContainerPage from "@/src/components/layouts/ContainerPage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { Card } from "@/src/components/ui/card";
import { ConnectedNewOrganizationForm } from "@/src/features/organizations/components/ConnectedNewOrganizationForm";
import { NewProjectForm } from "@/src/features/projects/components/NewProjectForm";
import { useQueryProjectOrOrganization } from "@/src/features/projects/hooks";
import { createProjectRoute } from "@/src/features/setup/setupRoutes";
import { cn } from "@/src/utils/tailwind";
import { Check } from "@langfuse/icons";
import { useRouter } from "next/router";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";

// Manual setup process
// 1. Create Organization: /setup
// 2. Create Project: /organization/:orgId/setup?orgstep=create-project
export function SetupPage() {
  const t = useTranslation(workspaceMessages);
  const { organization } = useQueryProjectOrOrganization();
  const router = useRouter();

  // starts at 1 to align with breadcrumb
  const stepInt = organization ? 2 : 1;

  return (
    <ContainerPage
      headerProps={{
        title: t("setup"),
        help: {
          description: t("organizationsHelp"),
        },
        ...(stepInt === 1 && {
          breadcrumb: [
            {
              name: t("home"),
              href: "/",
            },
          ],
        }),
      }}
    >
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 1
                  ? "text-muted-foreground"
                  : "text-foreground font-bold",
              )}
            >
              {t("createOrganizationStep")}
              {stepInt > 1 && (
                <Check size="sm" __rawClassName="ml-1 inline-block" />
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage
              className={cn(
                stepInt !== 2
                  ? "text-muted-foreground"
                  : "text-foreground font-bold",
              )}
            >
              {t("createProjectStep")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="p-3">
        {
          // 1. Create Org
          stepInt === 1 && (
            <div>
              <Header title={t("newOrganizationTitle")} />
              <p className="text-muted-foreground mb-4 text-sm">
                {t("createOrganizationHelp")}
              </p>
              <ConnectedNewOrganizationForm
                onSuccess={async (orgId, sessionRefreshed) => {
                  const projectRoute = createProjectRoute(orgId);
                  await router.push(projectRoute);

                  if (!sessionRefreshed) {
                    // The setup page resolves the new organization from the session.
                    router.reload();
                  }
                }}
              />
            </div>
          )
        }
        {
          // 2. Create Project
          stepInt === 2 && organization && (
            <div>
              <Header title={t("newProjectTitle")} />
              <p className="text-muted-foreground mb-4 text-sm">
                {t("projectsHelp")}
              </p>
              <NewProjectForm
                orgId={organization.id}
                onSuccess={(projectId) =>
                  router.push(`/project/${projectId}/traces`)
                }
              />
            </div>
          )
        }
      </Card>
    </ContainerPage>
  );
}
