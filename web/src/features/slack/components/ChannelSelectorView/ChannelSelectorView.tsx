import React, { useState, useMemo } from "react";
import { RefreshCw, Hash, Lock, AlertTriangle } from "@langfuse/icons";
import { AsyncSelectInput } from "@/src/components/design-system/AsyncSelectInput/AsyncSelectInput";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { type SlackChannel } from "@langfuse/shared/src/server";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { integrationMessages } from "@/src/features/i18n/messages/integrations";

export interface ChannelSelectorViewProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  /** Loaded channels and private channel flags; null until the first page loads */
  channelsData: {
    channels: SlackChannel[];
    /** False when the bot token lacks the scope to read private channels */
    hasPrivateChannelAccess: boolean;
  } | null;
  isLoading: boolean;
  hasError: boolean;
  isRefreshing: boolean;
  /** Currently selected channel ID */
  selectedChannelId?: string;
  /** Full channel object for display when the ID isn't in the fetched list (e.g. manual entry) */
  selectedChannel?: SlackChannel | null;
  /** Callback when a channel is selected */
  onChannelSelect: (channel: SlackChannel) => void;
  onRefresh: () => void;
  /** Reconnects Slack to grant missing scopes; omitted for users who may not manage the integration */
  onReauthenticate?: () => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Placeholder text for the selector */
  placeholder?: string;
  /** Whether to show only channels the bot is a member of */
  memberOnly?: boolean;
  /** Custom filter function for channels */
  filterChannels?: (channel: SlackChannel) => boolean;
  /** Whether to show the refresh button */
  showRefreshButton?: boolean;
}

/**
 * A command palette style dropdown for picking a Slack channel, with search,
 * public/private indicators, typed-name entry and private channel notices.
 * Items are virtualized with @tanstack/react-virtual to handle large channel lists (~5k).
 */
export const ChannelSelectorView: React.FC<ChannelSelectorViewProps> = ({
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  channelsData,
  isLoading,
  hasError,
  isRefreshing,
  selectedChannelId,
  selectedChannel: selectedChannelProp,
  onChannelSelect,
  onRefresh,
  onReauthenticate,
  disabled = false,
  placeholder,
  memberOnly = false,
  filterChannels,
  showRefreshButton = true,
}) => {
  const t = useTranslation(integrationMessages);
  const [searchValue, setSearchValue] = useState("");
  const trimmedSearch = searchValue.trim();
  const effectiveName = trimmedSearch.replace(/^#/, "");

  // Filter and search channels
  const filteredChannels = useMemo(() => {
    if (!channelsData?.channels) return [];

    let channels = channelsData.channels;

    // Apply member filter if requested
    if (memberOnly) {
      channels = channels.filter((channel) => channel.isMember);
    }

    // Apply custom filter if provided
    if (filterChannels) {
      channels = channels.filter(filterChannels);
    }

    // Apply search filter
    if (effectiveName) {
      const searchTerm = effectiveName.toLowerCase();
      channels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm),
      );
    }

    // Sort channels: public channels first, then private, then by name
    return [...channels].sort((a, b) => {
      if (a.isPrivate !== b.isPrivate) {
        return a.isPrivate ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [channelsData?.channels, memberOnly, filterChannels, effectiveName]);

  // Get selected channel info — fall back to the prop for manual entries
  const selectedChannel = useMemo(() => {
    if (!selectedChannelId) return null;
    const fromList = channelsData?.channels?.find(
      (channel) => channel.id === selectedChannelId,
    );
    return fromList ?? selectedChannelProp ?? null;
  }, [selectedChannelId, channelsData?.channels, selectedChannelProp]);

  const hasExactMatch = filteredChannels.some(
    (channel) => channel.name.toLowerCase() === effectiveName.toLowerCase(),
  );
  const canUseTypedName = effectiveName.length > 0 && !hasExactMatch;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <AsyncSelectInput
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            disabled={disabled}
            error={invalid === true || invalid === "true"}
            placeholder={placeholder ?? t("slackSelectChannelPlaceholder")}
            value={
              selectedChannel
                ? {
                    value: selectedChannel.id,
                    label: selectedChannel.name,
                    icon: selectedChannel.isPrivate ? Lock : Hash,
                  }
                : null
            }
            callToActionOption={
              canUseTypedName
                ? {
                    position: "first",
                    label: t("slackUseChannelName", {
                      name: effectiveName,
                    }),
                    onSelect: () =>
                      onChannelSelect({
                        id: `#${effectiveName}`,
                        name: effectiveName,
                        isPrivate: false,
                        isMember: false,
                      }),
                  }
                : undefined
            }
            options={filteredChannels.map((channel) => ({
              value: channel.id,
              label: channel.name,
              icon: channel.isPrivate ? Lock : Hash,
            }))}
            onValueChange={(option) => {
              const channel = filteredChannels.find(
                (item) => item.id === option.value,
              );
              if (channel) onChannelSelect(channel);
            }}
            search={{
              placeholder: t("slackSearchChannels"),
              value: searchValue,
              onValueChange: setSearchValue,
            }}
            emptyMessage={t("slackNoChannels")}
            loading={
              isLoading
                ? {
                    message: t("slackLoadingChannels"),
                  }
                : undefined
            }
            virtualized
          />
        </div>

        {showRefreshButton && (
          <IconButton
            icon={RefreshCw}
            label={t("slackRefreshChannels")}
            variant="outline"
            onClick={onRefresh}
            disabled={disabled || isRefreshing || isLoading}
          />
        )}
      </div>

      {hasError && (
        <Alert>
          <Alert.Description>{t("slackLoadChannelsFailed")}</Alert.Description>
        </Alert>
      )}

      {/* Private channel scope warning */}
      {channelsData && !channelsData.hasPrivateChannelAccess && (
        <Alert icon={AlertTriangle} variant="warning" size="sm">
          <Alert.Title>{t("slackPrivateChannelsWarning")}</Alert.Title>
          <Alert.Description>
            {onReauthenticate ? (
              <>
                {t("slackPrivateChannelsReauthPrefix")}{" "}
                <button
                  type="button"
                  className="font-bold underline"
                  onClick={onReauthenticate}
                >
                  {t("slackPrivateChannelsReauth")}
                </button>{" "}
                {t("slackPrivateChannelsReauthSuffix")}
              </>
            ) : (
              t("slackPrivateChannelsAskAdmin")
            )}
          </Alert.Description>
        </Alert>
      )}
    </div>
  );
};
