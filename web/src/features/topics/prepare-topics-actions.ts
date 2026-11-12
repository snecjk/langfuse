import {
  Eye,
  History,
  Play,
  RefreshCw,
  Settings,
  type IconComponent,
} from "@langfuse/icons";
import { type useTranslation } from "@/src/features/i18n/I18nProvider";
import { type topicsMessages } from "@/src/features/i18n/messages/topics";

type T = ReturnType<typeof useTranslation<typeof topicsMessages>>;

export type AutomaticProcessingState =
  | { status: "unconfigured" }
  | { status: "off" }
  | { status: "on" }
  | { status: "paused"; shortLabel: string };

type TopicAction = {
  id: "automatic" | "regenerate" | "configure" | "history";
  label: string;
  icon: IconComponent;
  onSelect: () => void;
  disabledReason?: string;
  badge?: string;
};

function automaticBadge(
  status: AutomaticProcessingState["status"],
  t: T,
): string {
  switch (status) {
    case "unconfigured":
    case "off":
      return t("off");
    case "on":
      return t("on");
    case "paused":
      return t("paused");
  }
}

function processingDisabledReason(
  state: AutomaticProcessingState,
  canWrite: boolean,
  saving: boolean,
  t: T,
): string | undefined {
  if (state.status === "unconfigured") return t("configureTopicsFirst");
  if (!canWrite) return t("noPermissionEditTopics");
  if (saving) return t("savingSettings");
  return undefined;
}

/** One action policy for the inline Analyze control and both overflow-menu presentations. */
export function prepareTopicsActions({
  automaticProcessing,
  canWrite,
  configureAvailable,
  regenerateAvailable,
  menuOnly,
  onAutomaticProcessing,
  onConfigure,
  onRegenerate,
  onHistory,
  showUnassigned,
  onShowUnassignedChange,
  t,
}: {
  automaticProcessing: { state: AutomaticProcessingState; saving: boolean };
  canWrite: boolean;
  configureAvailable: boolean;
  regenerateAvailable: boolean;
  menuOnly: boolean;
  onAutomaticProcessing: () => void;
  onConfigure: () => void;
  onRegenerate: () => void;
  onHistory: () => void;
  showUnassigned: boolean;
  onShowUnassignedChange: (show: boolean) => void;
  t: T;
}) {
  const { state, saving } = automaticProcessing;
  const reason = processingDisabledReason(state, canWrite, saving, t);
  const disabledReason =
    reason && state.status === "paused"
      ? `${state.shortLabel}. ${reason}`
      : reason;
  const automatic = menuOnly
    ? null
    : { state, disabledReason, onSelect: onAutomaticProcessing };
  const menu: TopicAction[] = [];
  // Narrow headers hide the inline control, so the menu keeps it reachable.
  if (automatic) {
    menu.push({
      id: "automatic",
      label:
        state.status === "off" || state.status === "unconfigured"
          ? t("analyze")
          : t("autoAnalyze"),
      icon: Play,
      badge: automaticBadge(state.status, t),
      disabledReason,
      onSelect: onAutomaticProcessing,
    });
  }
  menu.push(
    {
      id: "regenerate",
      label: t("regenerateTopics"),
      icon: RefreshCw,
      disabledReason: regenerateAvailable
        ? undefined
        : t("configureTopicsFirst"),
      onSelect: onRegenerate,
    },
    {
      id: "history",
      label: t("history"),
      icon: History,
      onSelect: onHistory,
    },
    {
      id: "configure",
      label: t("settings"),
      icon: Settings,
      disabledReason: configureAvailable
        ? undefined
        : t("topicsSettingsLoading"),
      onSelect: onConfigure,
    },
  );
  const display = {
    id: "show-unassigned",
    label: t("showUnassigned"),
    icon: Eye,
    checked: showUnassigned,
    onCheckedChange: onShowUnassignedChange,
  } as const;
  return { automatic, menu, display };
}

export type TopicsActions = ReturnType<typeof prepareTopicsActions>;
