import { CalendarDays } from "@langfuse/icons";
import { SidebarMenuButton } from "@/src/components/ui/sidebar";
import Link from "next/link";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { navigationMessages } from "@/src/features/i18n/messages/navigation";

export const BookACallButton = () => {
  const capture = usePostHogClientCapture();
  const t = useTranslation(navigationMessages);

  return (
    <SidebarMenuButton asChild>
      <Link
        href="https://cal.com/team/langfuse/welcome-to-langfuse"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          capture("sidebar:book_a_call_clicked");
        }}
      >
        <CalendarDays size="base" />
        {t("bookCall")}
      </Link>
    </SidebarMenuButton>
  );
};
