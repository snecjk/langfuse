import Link from "next/link";
import { SidebarMenuButton } from "@/src/components/ui/sidebar";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { navigationMessages } from "@/src/features/i18n/messages/navigation";

export function CloudStatusMenu() {
  const t = useTranslation(navigationMessages);
  return (
    <SidebarMenuButton asChild tooltip={t("activeIncident")}>
      <Link
        href="https://status.langfuse.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="relative flex size-3.5 shrink-0 items-center justify-center">
          <span className="bg-destructive inline-flex h-2 w-2 rounded-full" />
        </div>
        {t("activeIncident")}
      </Link>
    </SidebarMenuButton>
  );
}
