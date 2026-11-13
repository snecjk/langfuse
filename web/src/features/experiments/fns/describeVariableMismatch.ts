import { experimentMessages } from "@/src/features/i18n/messages/experiments";
import { translate } from "@/src/features/i18n/messages";
import { type Locale } from "@/src/features/i18n/locale";

/**
 * Message for the Dataset step's "Invalid configuration" banner when no dataset
 * item provides any of the prompt's variables.
 *
 * Names the variables so the reader can compare them against their dataset
 * without opening the "Expected columns" popover.
 */
export function describeVariableMismatch(
  variables: string[],
  locale: Locale = "en",
): string {
  // Placeholder names are not deduped upstream, and a placeholder may repeat a
  // mustache variable.
  const named = [...new Set(variables)].join(", ");

  return named
    ? translate(locale, experimentMessages, "variableMismatch", {
        variables: named,
      })
    : translate(locale, experimentMessages, "variableMismatchEmpty");
}
