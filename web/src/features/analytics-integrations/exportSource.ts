import {
  areEnrichedWritesActive,
  areLegacyWritesActive,
  defaultExportSource,
  EXPORT_SOURCE_OPTIONS,
  getAvailableExportSources,
  validateExportSource,
  type AnalyticsIntegrationExportSource,
  type V4WriteMode,
  type ExportSourceBlockedReason,
  type ExportSourceContext,
  type ExportSourceOption,
} from "@langfuse/shared";

// UI adapters over the export-source policy, shared by the blob-storage,
// PostHog, and Mixpanel settings forms. Policy and rationale live in
// packages/shared/.../export-source-policy.ts.

// The write mode is server-only, so every settings page receives it from its
// tRPC get response and derives both capabilities here.
export function buildExportSourceContext({
  writeMode,
  isCloud,
  projectCreatedAt,
  integrationCreatedAt,
  exporterCutoff,
}: {
  writeMode: V4WriteMode;
  isCloud: boolean;
  projectCreatedAt?: Date;
  integrationCreatedAt?: Date | null;
  exporterCutoff?: Date;
}): ExportSourceContext {
  return {
    isCloud,
    enrichedAvailable: areEnrichedWritesActive(writeMode),
    legacyWritesActive: areLegacyWritesActive(writeMode),
    projectCreatedAt,
    integrationCreatedAt,
    exporterCutoff,
  };
}

export function isExportSourceSelectable(
  source: AnalyticsIntegrationExportSource,
  ctx: ExportSourceContext,
): boolean {
  return validateExportSource(source, ctx).ok;
}

// The persisted value always wins so initialize+save can never silently
// rewrite it; validation blocks the save if it is not selectable. A create
// falls through to the shared policy default, which the routers use too, so the
// page and the server agree on what a new integration gets.
export function getExportSourceFormValue(
  persisted: AnalyticsIntegrationExportSource | null | undefined,
  ctx: ExportSourceContext,
): AnalyticsIntegrationExportSource {
  return persisted ?? defaultExportSource(ctx);
}

export type SelectableExportSourceOption = ExportSourceOption & {
  unavailable: boolean;
};

// A single selectable option carries no decision, so the selector is hidden.
// When the sole option is the stale persisted source, keep the selector: the
// unavailable-source alert refers to it and hiding it would strand the user
// with a blocked save.
export function shouldHideExportSourceSelector(
  options: SelectableExportSourceOption[],
): boolean {
  return options.length === 1 && !options[0].unavailable;
}

// Selectable sources, plus the persisted one (marked unavailable) when it is
// no longer selectable, so the conflict is visible rather than silently
// rewritten.
export function getExportSourceOptions(
  persisted: AnalyticsIntegrationExportSource | null | undefined,
  ctx: ExportSourceContext,
): SelectableExportSourceOption[] {
  return getAvailableExportSources(ctx).flatMap(({ source, blockedReason }) => {
    if (blockedReason && source !== persisted) return [];
    const option = EXPORT_SOURCE_OPTIONS.find((o) => o.value === source);
    if (!option) return [];
    return [{ ...option, unavailable: blockedReason !== undefined }];
  });
}

export type ExportSourceFieldState = {
  options: SelectableExportSourceOption[];
  showField: boolean;
  defaultValue: AnalyticsIntegrationExportSource;
};

// Visibility and the default have to agree: a hidden selector whose default is
// not selectable blocks every save with no field left to fix it with. Both
// therefore derive from the same option list, with no per-context override —
// the persisted value survives even where it can no longer be chosen, so the
// blocked-save alert names it instead of a save quietly replacing it.
export function getExportSourceFieldState(
  persisted: AnalyticsIntegrationExportSource | null | undefined,
  ctx: ExportSourceContext,
): ExportSourceFieldState {
  const options = getExportSourceOptions(persisted ?? null, ctx);
  return {
    options,
    showField: !shouldHideExportSourceSelector(options),
    defaultValue: getExportSourceFormValue(persisted, ctx),
  };
}

// Blocked-save alert body per policy reason. The lookup keys match the
// integrationMessages namespace; callers pass a translate function so the
// message renders in the user's language.
type ExportSourceMessageKey =
  | "exportSourceEnrichedUnavailable"
  | "exportSourceCloudCutoff"
  | "exportSourceLegacyWritesDisabled";

const EXPORT_SOURCE_UNAVAILABLE_MESSAGE_KEYS: Record<
  ExportSourceBlockedReason,
  ExportSourceMessageKey
> = {
  "enriched-unavailable": "exportSourceEnrichedUnavailable",
  "cloud-cutoff": "exportSourceCloudCutoff",
  "legacy-writes-disabled": "exportSourceLegacyWritesDisabled",
};

export function getExportSourceUnavailableMessage(
  reason: ExportSourceBlockedReason,
  t?: (key: ExportSourceMessageKey) => string,
): string {
  const key = EXPORT_SOURCE_UNAVAILABLE_MESSAGE_KEYS[reason];
  if (t) return t(key);
  // Fallback map used by non-React callers; the English strings live in the
  // integrationMessages namespace and stay the source of truth.
  const fallback: Record<ExportSourceMessageKey, string> = {
    exportSourceEnrichedUnavailable:
      "This integration is configured to export enriched observations, but this deployment runs LANGFUSE_MIGRATION_V4_WRITE_MODE=legacy and does not write the enriched observations table. Saving is blocked until you select an available export source above.",
    exportSourceCloudCutoff:
      "This integration is configured to export legacy traces and observations, which is no longer available for this project. Saving is blocked until you select an available export source above.",
    exportSourceLegacyWritesDisabled:
      "This integration is configured to export legacy traces and observations, but this deployment runs LANGFUSE_MIGRATION_V4_WRITE_MODE=events_only and no longer writes the legacy traces/observations tables. Saving is blocked until you select an available export source above.",
  };
  return fallback[key];
}
