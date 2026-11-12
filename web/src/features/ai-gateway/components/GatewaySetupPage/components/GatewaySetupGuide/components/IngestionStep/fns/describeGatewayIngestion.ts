import type { GatewayIngestionMode } from "@langfuse/shared";

import type {
  GatewayConfig,
  GatewayProject,
} from "@/src/features/ai-gateway/components/GatewaySetupPage/types/gatewaySetup";

/** One-line summary of a saved config, e.g. `Recording usage only in project "ai-gateway"`. */
export function describeGatewayIngestion({
  config,
  projects,
  t,
}: {
  config: GatewayConfig;
  projects: GatewayProject[];
  t: (
    key:
      | "notRecordingTraffic"
      | "recordingUsageOnly"
      | "recordingFull"
      | "recordingInProject",
    params?: Record<string, string>,
  ) => string;
}) {
  const summaries: Record<GatewayIngestionMode, string> = {
    NONE: t("notRecordingTraffic"),
    USAGE: t("recordingUsageOnly"),
    FULL: t("recordingFull"),
  };
  const summary = summaries[config.ingestionMode];
  const project = projects.find(
    (candidate) => candidate.id === config.defaultIngestionProjectId,
  );
  if (config.ingestionMode === "NONE" || !project) return summary;
  return t("recordingInProject", { summary, name: project.name });
}
