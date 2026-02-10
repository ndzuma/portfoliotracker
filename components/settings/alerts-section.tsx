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
  },
  {
    value: "telegram" as const,
    label: "Telegram",
    icon: PaperPlaneTilt,
    description: "Via bot to your chat",
    needsWebhook: true,
  },
] as const;

type ChannelType = "email" | "discord" | "telegram";

/* ═══════════════════════════════════════════════════════════════════════════
   ALERTS SECTION — Market Pulse + Earnings Reminders
   ═══════════════════════════════════════════════════════════════════════════ */

interface AlertsSectionProps {
  marketPulseEnabled: boolean;
  onMarketPulseEnabledChange: (v: boolean) => void;
  marketPulseChannel: ChannelType;
  onMarketPulseChannelChange: (v: ChannelType) => void;
  marketPulseWebhookUrl: string;
  onMarketPulseWebhookUrlChange: (v: string) => void;
  earningsReminders: boolean;
  onEarningsRemindersChange: (v: boolean) => void;
}

export function AlertsSection({
  marketPulseEnabled,
  onMarketPulseEnabledChange,
  marketPulseChannel,
  onMarketPulseChannelChange,
  marketPulseWebhookUrl,
  onMarketPulseWebhookUrlChange,
  earningsReminders,
  onEarningsRemindersChange,
}: AlertsSectionProps) {
  const [webhookVisible, setWebhookVisible] = useState(false);

  const selectedChannelMeta = CHANNELS.find(
    (c) => c.value === marketPulseChannel,
  );
  const showWebhook =
    marketPulseEnabled && selectedChannelMeta?.needsWebhook === true;

  // Count active notification channels for the status indicator
  const activeChannels = [marketPulseEnabled, earningsReminders].filter(
    Boolean,
  ).length;

  return (
    <Section
      title="Notifications & Alerts"
      description={
        activeChannels > 0
          ? `${activeChannels} active`
          : "All notifications off"
      }
      status={activeChannels > 0 ? "live" : "off"}
    >
      {/* ── Armed channels indicator ── */}
      <div className="flex items-center gap-3 py-3 border-b border-white/[0.03]">
        <Lightning className="h-3.5 w-3.5 text-zinc-600" />
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
          Active Channels
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5">
            <StatusDot
              status={marketPulseEnabled ? "live" : "off"}
              pulse={false}
            />
            <span
              className={`text-[10px] font-medium ${marketPulseEnabled ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Market Pulse
            </span>
          </div>
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
        </div>
      </div>

      {/* ── AI Market Pulse ── */}
      <SettingRow
        label="AI Market Pulse"
        description="Receive AI-generated market summaries on a schedule"
      >
        <SettingsToggle
          checked={marketPulseEnabled}
          onChange={onMarketPulseEnabledChange}
        />
      </SettingRow>

      {/* Channel selector — only when enabled */}
      {marketPulseEnabled && (
        <div className="py-3 border-b border-white/[0.03]">
          <p className="text-[11px] text-zinc-600 mb-3">Delivery channel</p>
          <div className="flex items-center gap-2">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isActive = marketPulseChannel === ch.value;
              return (
                <button
                  key={ch.value}
                  onClick={() => onMarketPulseChannelChange(ch.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                    ${
                      isActive
                        ? "bg-white/[0.08] text-white border border-white/[0.12]"
                        : "bg-zinc-900/50 text-zinc-500 border border-white/[0.04] hover:text-zinc-300 hover:border-white/[0.08]"
                    }
                  `}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${isActive ? "text-emerald-500" : ""}`}
                  />
                  {ch.label}
                </button>
              );
            })}
          </div>
          {selectedChannelMeta && (
            <p className="text-[10px] text-zinc-700 mt-2">
              {selectedChannelMeta.description}
            </p>
          )}
        </div>
      )}

      {/* Webhook URL — for Discord / Telegram */}
      {showWebhook && (
        <div className="py-3 border-b border-white/[0.03]">
          <p className="text-[11px] text-zinc-600 mb-2">
            {marketPulseChannel === "discord"
              ? "Discord Webhook URL"
              : "Telegram Bot Webhook URL"}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={webhookVisible ? "text" : "password"}
                value={marketPulseWebhookUrl}
                onChange={(e) =>
                  onMarketPulseWebhookUrlChange(e.target.value)
                }
                placeholder={
                  marketPulseChannel === "discord"
                    ? "https://discord.com/api/webhooks/..."
                    : "https://api.telegram.org/bot..."
                }
                className="
                  w-full bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs
                  pl-3 pr-9 py-2 rounded-lg h-8
                  hover:border-white/[0.12] transition-colors
                  focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/10
                  placeholder:text-zinc-700
                "
              />
              <button
                onClick={() => setWebhookVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {webhookVisible ? (
                  <EyeSlash className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-white/[0.06] text-zinc-600 cursor-not-allowed"
              title="Test delivery coming soon"
            >
              Test
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 mt-1.5">
            Your URL is encrypted and stored securely. Test delivery coming
            soon.
          </p>
        </div>
      )}

      {/* Preview text when Market Pulse is enabled */}
      {marketPulseEnabled && (
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
                {selectedChannelMeta?.label || marketPulseChannel}
              </span>
              . Delivery frequency is controlled by your AI Summary schedule in
              the AI tab.
            </p>
          </div>
        </div>
      )}

      {/* ── Earnings Calendar Reminders ── */}
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
    </Section>
  );
}
