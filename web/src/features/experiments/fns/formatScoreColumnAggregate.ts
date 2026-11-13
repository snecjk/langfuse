import { type ScoreColumnAggregate } from "./summariseScoreColumn";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";
import { translate } from "@/src/features/i18n/messages";
import { type Locale } from "@/src/features/i18n/locale";

export const formatScoreValue = (value: number) => value.toFixed(2);

/** How a score column's aggregate reads, which depends on the score's type. */
export const formatScoreColumnAggregate = (
  aggregate: ScoreColumnAggregate,
  locale: Locale = "en",
) => {
  if (aggregate.kind === "average") return formatScoreValue(aggregate.value);
  if (aggregate.kind === "trueRate")
    return `${Math.round(aggregate.value * 100)}% ${translate(
      locale,
      experimentMessages,
      "trueRateLabel",
    )}`;
  const modalCount =
    aggregate.distribution.find((entry) => entry.value === aggregate.modalValue)
      ?.count ?? 0;
  return `${aggregate.modalValue} ${modalCount}/${aggregate.count}`;
};
