import { BookOpen, MessageSquareText, PlusIcon } from "@langfuse/icons";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { createOrganizationRoute } from "@/src/features/setup/setupRoutes";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";

/** GetStartedCard points users without an organization to creating one or to the docs */
export const GetStartedCard = ({
  canCreateOrganizations,
}: {
  canCreateOrganizations: boolean;
}) => {
  const t = useTranslation(workspaceMessages);
  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="create-new-project-title">
          {t("getStarted")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          {canCreateOrganizations
            ? t("getStartedCanCreate")
            : t("getStartedInviteOnly")}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-4">
        {canCreateOrganizations && (
          <Button data-testid="create-project-btn" asChild>
            <Link href={createOrganizationRoute}>
              <PlusIcon size="base" __rawClassName="mr-2" aria-hidden="true" />
              {t("newOrganization")}
            </Link>
          </Button>
        )}
        <Button variant="secondary" asChild>
          <Link href="https://langfuse.com/docs" target="_blank">
            <BookOpen size="base" __rawClassName="mr-2" aria-hidden="true" />
            {t("docs")}
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="https://langfuse.com/docs/ask-ai" target="_blank">
            <MessageSquareText
              size="base"
              __rawClassName="mr-2"
              aria-hidden="true"
            />
            {t("askAi")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
