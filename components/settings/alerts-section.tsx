"use client";

import { useState } from "react";
import {
  Bell,
  EnvelopeSimple,
  ChatCircleDots,
  PaperPlaneTilt,
  Eye,
  EyeSlash,
  CalendarCheck,
  Lightning,
} from "@phosphor-icons/react";
import {
  Section,
  SettingRow,
  SettingsToggle,
  StatusDot,
} from "./settings-primitives";

/* ─── Channel metadata ─── */
const CHANNELS = [
  {
    value: "email" as const,
    label: "Email",
    icon: EnvelopeSimple,
    description: "Delivered to your account email",
    needsWebhook: false,
  },
  {
    value: "discord" as const,
    label: "Discord",
    icon: ChatCircleDots,
    description: "Via webhook to your channel",
    needsWebhook: true,
    placeholder: "https://discord.com/api/webhooks/...",
  },
  {
    value: "telegram" as const,
    label: "Telegram",
    icon: PaperPlaneTilt,
    description: "Via bot to your chat",
    needsWebhook: true,
    placeholder: "https://api.telegram.org/bot...",
  },
] as const;

type ChannelType = "email" | "discord" | "telegram";

/* ═══════════════════════════════════════════════════════════════════════════
   ALERTS SECTION — Multi-Channel Market Pulse + Earnings Reminders
   ═══════════════════════════════════════════════════════════════════════════ */

interface AlertsSectionProps {
  marketPulseEnabled: boolean;
  onMarketPulseEnabledChange: (v: boolean) => void;
  marketPulseChannels: ChannelType[];
  onMarketPulseChannelsChange: (v: ChannelType[]) => void;
  discordWebhookUrl: string;
  onDiscordWebhookUrlChange: (v: string) => void;
  telegramWebhookUrl: string;
  onTelegramWebhookUrlChange: (v: string) => void;
  earningsReminders: boolean;
  onEarningsRemindersChange: (v: boolean) => void;
  /** When false, the Earnings Reminders toggle is replaced with a coming-soon message */
  earningsRemindersEnabled?: boolean;
}

export function AlertsSection({
  marketPulseEnabled,
  onMarketPulseEnabledChange,
  marketPulseChannels,
  onMarketPulseChannelsChange,
  discordWebhookUrl,
  onDiscordWebhookUrlChange,
  telegramWebhookUrl,
  onTelegramWebhookUrlChange,
  earningsReminders,
  onEarningsRemindersChange,
  earningsRemindersEnabled = true,
}: AlertsSectionProps) {
  const [discordVisible, setDiscordVisible] = useState(false);
  const [telegramVisible, setTelegramVisible] = useState(false);

  const toggleChannel = (channel: ChannelType) => {
    if (marketPulseChannels.includes(channel)) {
      onMarketPulseChannelsChange(
        marketPulseChannels.filter((c) => c !== channel),
      );
    } else {
      onMarketPulseChannelsChange([...marketPulseChannels, channel]);
    }
  };

  // Count active notification sources for the status indicator
  const activeChannels = marketPulseEnabled ? marketPulseChannels.length : 0;
  const totalActive =
    activeChannels + (earningsRemindersEnabled && earningsReminders ? 1 : 0);

  return (
    <Section
      title="Notifications & Alerts"
      description={
        totalActive > 0 ? `${totalActive} active` : "All notifications off"
      }
      status={totalActive > 0 ? "live" : "off"}
    >
      {/* ── Armed channels indicator ── */}
      <div className="flex items-center gap-3 py-3 border-b border-white/[0.03]">
        <Lightning className="h-3.5 w-3.5 text-zinc-600" />
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
          Active Channels
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {CHANNELS.map((ch) => {
            const isActive =
              marketPulseEnabled && marketPulseChannels.includes(ch.value);
            return (
              <div key={ch.value} className="flex items-center gap-1.5">
                <StatusDot status={isActive ? "live" : "off"} pulse={false} />
                <span
                  className={`text-[10px] font-medium ${isActive ? "text-zinc-300" : "text-zinc-700"}`}
                >
                  {ch.label}
                </span>
              </div>
            );
          })}
          {earningsRemindersEnabled && (
            <>
              <div className="w-px h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5">
                <StatusDot
                  status={earningsReminders ? "live" : "off"}
                  pulse={false}
                />
                <span
                  className={`text-[10px] font-medium ${earningsReminders ? "text-zinc-300" : "text-zinc-700"}`}
                >
                  Earnings
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── AI Market Pulse Toggle ── */}
      <SettingRow
        label="AI Market Pulse"
        description="Receive AI-generated market summaries on a schedule"
      >
        <SettingsToggle
          checked={marketPulseEnabled}
          onChange={onMarketPulseEnabledChange}
        />
      </SettingRow>

      {/* ── Multi-channel selector — only when Market Pulse is enabled ── */}
      {marketPulseEnabled && (
        <div className="py-3 border-b border-white/[0.03]">
          <p className="text-[11px] text-zinc-600 mb-3">
            Delivery channels{" "}
            <span className="text-zinc-700">(select one or more)</span>
          </p>

          <div className="flex flex-col gap-0">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isActive = marketPulseChannels.includes(ch.value);

              return (
                <div key={ch.value}>
                  {/* Channel toggle row */}
                  <button
                    onClick={() => toggleChannel(ch.value)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left
                      ${
                        isActive
                          ? "bg-white/[0.04] border border-white/[0.1]"
                          : "bg-transparent border border-transparent hover:bg-white/[0.02]"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${isActive ? "bg-emerald-500/10" : "bg-white/[0.03]"}
                      `}
                    >
                      <Icon
                        className={`h-4 w-4 ${isActive ? "text-emerald-500" : "text-zinc-600"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium ${isActive ? "text-white" : "text-zinc-400"}`}
                      >
                        {ch.label}
                      </p>
                      <p className="text-[10px] text-zinc-700">
                        {ch.description}
                      </p>
                    </div>
                    {/* Checkbox indicator */}
                    <div
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                        ${
                          isActive
                            ? "bg-emerald-500/80 border-emerald-500/60"
                            : "bg-transparent border-white/[0.1]"
                        }
                      `}
                    >
                      {isActive && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Discord webhook URL — shown when Discord is active */}
                  {ch.value === "discord" && isActive && (
                    <div className="ml-11 mr-3 mt-1 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={discordVisible ? "text" : "password"}
                            value={discordWebhookUrl}
                            onChange={(e) =>
                              onDiscordWebhookUrlChange(e.target.value)
                            }
                            placeholder={ch.placeholder}
                            className="
                              w-full bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs
                              pl-3 pr-9 py-2 rounded-lg h-8
                              hover:border-white/[0.12] transition-colors
                              focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/10
                              placeholder:text-zinc-700
                            "
                          />
                          <button
                            onClick={() => setDiscordVisible((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            {discordVisible ? (
                              <EyeSlash className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-700 mt-1.5">
                        Paste your Discord channel webhook URL
                      </p>
                    </div>
                  )}

                  {/* Telegram webhook URL — shown when Telegram is active */}
                  {ch.value === "telegram" && isActive && (
                    <div className="ml-11 mr-3 mt-1 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={telegramVisible ? "text" : "password"}
                            value={telegramWebhookUrl}
                            onChange={(e) =>
                              onTelegramWebhookUrlChange(e.target.value)
                            }
                            placeholder={ch.placeholder}
                            className="
                              w-full bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs
                              pl-3 pr-9 py-2 rounded-lg h-8
                              hover:border-white/[0.12] transition-colors
                              focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/10
                              placeholder:text-zinc-700
                            "
                          />
                          <button
                            onClick={() => setTelegramVisible((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            {telegramVisible ? (
                              <EyeSlash className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-700 mt-1.5">
                        Paste your Telegram bot webhook URL
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No channels selected warning */}
          {marketPulseChannels.length === 0 && (
            <p className="text-[10px] text-amber-500/70 mt-2 px-1">
              Select at least one channel to receive Market Pulse notifications
            </p>
          )}
        </div>
      )}

      {/* Preview text when Market Pulse is enabled with channels */}
      {marketPulseEnabled && marketPulseChannels.length > 0 && (
        <div className="py-3 border-b border-white/[0.03]">
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Bell className="h-3 w-3 text-zinc-600" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                Preview
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You&apos;ll receive a concise AI market brief via{" "}
              <span className="text-zinc-300 font-medium">
                {marketPulseChannels
                  .map((c) => CHANNELS.find((ch) => ch.value === c)?.label || c)
                  .join(" & ")}
              </span>
              . Delivery frequency is controlled by your AI Summary schedule in
              the AI tab.
            </p>
          </div>
        </div>
      )}

      {/* ── Earnings Calendar Reminders ── */}
      {earningsRemindersEnabled ? (
        <SettingRow
          label="Earnings Reminders"
          description="Get notified before earnings announcements for your holdings"
        >
          <div className="flex items-center gap-2.5">
            <CalendarCheck
              className={`h-3.5 w-3.5 ${earningsReminders ? "text-emerald-500" : "text-zinc-600"}`}
            />
            <SettingsToggle
              checked={earningsReminders}
              onChange={onEarningsRemindersChange}
            />
          </div>
        </SettingRow>
      ) : (
        <div className="py-4 border-b border-white/[0.03] last:border-b-0">
          <div className="flex items-center gap-3 px-1">
            <CalendarCheck className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-500">
                Earnings Reminders
              </p>
              <p className="text-[10px] text-zinc-700 mt-0.5">
                Coming soon — get notified before earnings announcements for
                your holdings
              </p>
            </div>
            <span className="text-[9px] text-zinc-700 uppercase tracking-wider font-medium bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-full shrink-0">
              Soon
            </span>
          </div>
        </div>
      )}
    </Section>
  );
}
