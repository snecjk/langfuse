import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { env } from "@/src/env.mjs";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { workspaceMessages } from "@/src/features/i18n/messages/workspace";

/** DemoOrganizationTile links to the public demo project */
export const DemoOrganizationTile = () => {
  const t = useTranslation(workspaceMessages);
  const capture = usePostHogClientCapture();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tryLangfuseDemo")}</CardTitle>
      </CardHeader>
      <CardContent>{t("demoDescription")}</CardContent>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link
            href={`/project/${env.NEXT_PUBLIC_DEMO_PROJECT_ID}/traces`}
            onClick={() =>
              capture("organizations:demo_project_button_click", {
                location: "project_overview_demo_tile",
              })
            }
          >
            {t("viewDemoProject")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
