/**
 * Loading layout variant
 * Shown during session loading and authentication redirects
 */

import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { commonMessages } from "@/src/features/i18n/messages/common";
import { Spinner } from "@/src/components/layouts/Spinner";

type LoadingLayoutProps = {
  message?: string;
};

export function LoadingLayout({ message = "Loading" }: LoadingLayoutProps) {
  const t = useTranslation(commonMessages);
  const messages: Record<string, string> = {
    Loading: t("loading"),
    Redirecting: t("redirecting"),
  };
  const localizedMessage = Object.hasOwn(messages, message)
    ? messages[message]
    : message;
  return <Spinner message={localizedMessage} />;
}
