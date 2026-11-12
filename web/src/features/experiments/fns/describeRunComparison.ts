/**
 * Hover text for a comparison chip. Names the baseline and this run, then the
 * two values, so `+0.07` still says which side is which. A score drops the
 * verb; cost and latency keep theirs, because a bare number does not say
 * which metric it is.
 */
export function describeRunComparison({
  baselineName,
  baselineText,
  currentText,
  verb = "scored",
  labels,
}: {
  /** The baseline run's name; omitted while the names are still loading. */
  baselineName?: string;
  /** Both sides pre-formatted by the caller, so they read as the cell does. */
  baselineText: string;
  currentText: string;
  /** "scored" for a score, "cost" for cost, "took" for latency. */
  verb?: "scored" | "cost" | "took";
  /** Localized connective words; English defaults keep unlocalized callers readable. */
  labels?: { baseline: string; thisRun: string; cost: string; took: string };
}): string {
  const baseline = baselineName ?? labels?.baseline ?? "The baseline";
  if (verb === "scored") {
    return `${baseline} ${baselineText} · ${labels?.thisRun ?? "this run"} ${currentText}`;
  }
  const verbWord = labels?.[verb] ?? verb;
  return `${baseline} ${verbWord} ${baselineText} · ${labels?.thisRun ?? "this run"} ${verbWord} ${currentText}`;
}
