import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authMessages } from "@/src/features/i18n/messages/auth";

export const CloudPrivacyNotice = ({ action }: { action: string }) => {
  const t = useTranslation(authMessages);
  const localizedAction =
    action === "signing in"
      ? t("signingIn")
      : action === "signing up"
        ? t("signingUp")
        : action;
  return (
    <div className="text-muted-foreground mx-auto mt-10 max-w-lg text-center text-xs">
      {t("privacyPrefix", { action: localizedAction })}{" "}
      <a
        href="https://clickhouse.com/legal/clickhouse-general-terms-and-conditions"
        target="_blank"
        rel="noopener noreferrer"
        className="italic"
      >
        {t("terms")}
      </a>
      ,{" "}
      <a
        href="https://clickhouse.com/legal/langfuse-cloud-addendum"
        target="_blank"
        rel="noopener noreferrer"
        className="italic"
      >
        {t("addendum")}
      </a>
      {t("and")}{" "}
      <a
        href="https://langfuse.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="italic"
      >
        {t("privacy")}
      </a>
      {t("accurateData")}
    </div>
  );
};
