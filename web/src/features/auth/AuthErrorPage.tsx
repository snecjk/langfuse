import { ErrorPageWithSentry } from "@/src/components/error-page";
import { isExpectedAuthErrorPageMessage } from "@/src/features/auth/lib/expectedAuthErrors";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authMessages } from "@/src/features/i18n/messages/auth";
import { useRouter } from "next/router";

export default function AuthErrorPage() {
  const t = useTranslation(authMessages);
  const router = useRouter();
  const { error } = router.query;
  const errorMessage = error ? String(error) : t("authenticationErrorFallback");

  return (
    <ErrorPageWithSentry
      title={t("authenticationError")}
      message={errorMessage}
      // Expired magic links and deliberate SSO-domain rejections are expected
      // outcomes (see expectedAuthErrors.ts); unknown values still capture.
      expected={
        error !== undefined && isExpectedAuthErrorPageMessage(errorMessage)
      }
    />
  );
}
