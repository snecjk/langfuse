import { type Locale } from "@/src/features/i18n/locale";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";
import { translate } from "@/src/features/i18n/messages";

/**
 * How a run's start time reads next to its name: relative inside the last day,
 * a calendar date beyond it — "20m ago", "5h ago", "Aug 21", "Aug 21, 2025".
 */
export const formatRunRecency = (
  startTime: Date,
  locale: Locale = "en",
  now = new Date(),
): string => {
  const minutes = (now.getTime() - startTime.getTime()) / 60_000;
  if (minutes < 1) return translate(locale, experimentMessages, "justNow");
  if (minutes < 60)
    return translate(locale, experimentMessages, "minutesAgo", {
      count: Math.floor(minutes),
    });
  if (minutes < 60 * 24)
    return translate(locale, experimentMessages, "hoursAgo", {
      count: Math.floor(minutes / 60),
    });

  return startTime.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    ...(startTime.getFullYear() === now.getFullYear()
      ? {}
      : { year: "numeric" }),
  });
};
