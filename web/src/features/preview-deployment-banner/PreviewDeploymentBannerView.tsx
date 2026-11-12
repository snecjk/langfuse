import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { notificationMessages } from "@/src/features/i18n/messages/notifications";

export type PreviewDeploymentBannerViewProps = {
  /** Link back to the pull request this preview deployment belongs to. */
  prUrl: string;
  /** PR number for the link label; falls back to a generic label when absent. */
  prNumber?: string;
  /** GitHub login of the PR author. */
  author?: string;
  /** Human-readable relative time the preview was last updated, e.g. "2 hours ago". */
  updatedText?: string;
  /** Absolute timestamp shown on hover — the relative text is computed at render
   * time and goes stale in a long-lived tab. */
  updatedTitle?: string;
};

export function PreviewDeploymentBannerView({
  prUrl,
  prNumber,
  author,
  updatedText,
  updatedTitle,
}: PreviewDeploymentBannerViewProps) {
  const t = useTranslation(notificationMessages);
  return (
    <div className="border-preview-banner-border bg-preview-banner text-preview-banner-foreground flex w-full items-center justify-center border-b px-4 py-1">
      <span className="text-sm">
        {t("previewDeploymentPrefix")}{" "}
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-preview-banner-link hover:text-preview-banner-link-hover font-bold hover:underline"
        >
          {prNumber
            ? t("previewDeploymentPr", { prNumber })
            : t("previewDeploymentPrGeneric")}
        </a>
        {author ? (
          <>
            {" "}
            {t("previewDeploymentBy")}{" "}
            <a
              href={`https://github.com/${encodeURIComponent(author)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-preview-banner-link hover:text-preview-banner-link-hover font-bold hover:underline"
            >
              @{author}
            </a>
          </>
        ) : null}
        {updatedText ? (
          <>
            {" "}
            ·{" "}
            <span title={updatedTitle}>
              {t("previewDeploymentUpdated", { time: updatedText })}
            </span>
          </>
        ) : null}
      </span>
    </div>
  );
}
