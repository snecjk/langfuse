import Link from "next/link";
import { TriangleAlert } from "@langfuse/icons";
import { cn } from "@/src/utils/tailwind";
import type { V4MigrationTopBannerSeverity } from "@/src/features/v4-migration/topBannerContent";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

const STRIP_CLASS: Record<V4MigrationTopBannerSeverity, string> = {
  warning:
    "border-customer-data-banner-border bg-customer-data-banner text-customer-data-banner-foreground",
  critical: "border-current/15 bg-red-700 text-white",
};

export type V4MigrationTopBannerViewProps = {
  severity: V4MigrationTopBannerSeverity;
  /** Plain text shown before the migration-status link. */
  message: string;
  /** Records clicks on the migration status link. */
  onStatusClick: () => void;
};

/**
 * One-line legacy v3 strip for the top-banner stack. The status link is
 * available to every role. There is no dismiss.
 */
export function V4MigrationTopBannerView({
  severity,
  message,
  onStatusClick,
}: V4MigrationTopBannerViewProps) {
  const t = useTranslation(enterpriseMessages);
  const fullText = t("migrationTopBannerTitle", { message });

  return (
    <div
      role="status"
      data-severity={severity}
      title={fullText}
      className={cn(
        "flex w-full items-center justify-center gap-1.5 border-b px-4 py-1",
        STRIP_CLASS[severity],
      )}
    >
      <TriangleAlert size="sm" __rawClassName="shrink-0" aria-hidden="true" />
      <span
        className="hidden min-w-0 truncate text-sm sm:inline"
        title={message}
      >
        {message}{" "}
      </span>
      <span className="text-sm sm:hidden">{t("migrationTopBannerAction")}</span>
      <Link
        href="/v4-migration"
        className="shrink-0 text-sm font-bold underline decoration-current/50 underline-offset-2 hover:decoration-current"
        onClick={onStatusClick}
      >
        {t("migrationTopBannerLink")}
      </Link>
    </div>
  );
}
