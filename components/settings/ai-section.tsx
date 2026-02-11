"use client";

import {
  Sparkle,
  ArrowSquareOut,
  HardDrives,
  Clock,
  Brain,
} from "@phosphor-icons/react";
import { Section, SettingRow, StatusDot } from "./settings-primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── AI Summary Frequency Options ─── */
const FREQUENCY_OPTIONS = [
  { value: "12h", label: "Every 12 hours", description: "Twice daily" },
  { value: "daily", label: "Daily", description: "Once per day" },
  { value: "weekly", label: "Weekly", description: "Every Monday" },
  { value: "monthly", label: "Monthly", description: "1st of month" },
  { value: "manual", label: "Manual Only", description: "On demand" },
] as const;

type AiSummaryFrequency = "12h" | "daily" | "weekly" | "monthly" | "manual";

/* ═══════════════════════════════════════════════════════════════════════════
   AI SECTION — summary frequency + BYOAI provider config
   ═══════════════════════════════════════════════════════════════════════════ */

interface AiSectionProps {
  aiSummaryFrequency: AiSummaryFrequency;
  onAiSummaryFrequencyChange: (v: AiSummaryFrequency) => void;
  aiProvider: string;
  onAiProviderChange: (v: string) => void;
  openRouterApiKey: string;
  onOpenRouterApiKeyChange: (v: string) => void;
  tunnelId: string;
  onTunnelIdChange: (v: string) => void;
  selfHostedUrl: string;
  onSelfHostedUrlChange: (v: string) => void;
  byoaiEnabled: boolean;
  /** When false, the AI Summaries frequency selector is replaced with a coming-soon message */
  aiSummariesEnabled?: boolean;
}

export function AiSection({
  aiSummaryFrequency,
  onAiSummaryFrequencyChange,
  aiProvider,
  onAiProviderChange,
  openRouterApiKey,
  onOpenRouterApiKeyChange,
  tunnelId,
  onTunnelIdChange,
  selfHostedUrl,
  onSelfHostedUrlChange,
  byoaiEnabled,
  aiSummariesEnabled = true,
}: AiSectionProps) {
  const selectedFreq = FREQUENCY_OPTIONS.find(
    (f) => f.value === aiSummaryFrequency,
  );

  const providerLabel =
    aiProvider === "openrouter"
      ? "OpenRouter"
      : aiProvider === "self-hosted"
        ? "Self-Hosted"
        : "Default (Hosted)";

  return (
    <>
      {/* ── Portfolio AI Summary Frequency ── */}
      {aiSummariesEnabled ? (
        <Section
          title="AI Summaries"
          description="Portfolio analysis schedule"
          status={aiSummaryFrequency !== "manual" ? "live" : "off"}
        >
          <SettingRow
            label="Summary Frequency"
            description="How often AI generates portfolio analysis reports"
          >
            <div className="flex items-center gap-2">
              <Clock
                className={`h-3.5 w-3.5 ${aiSummaryFrequency !== "manual" ? "text-emerald-500" : "text-zinc-600"}`}
              />
              <Select
                value={aiSummaryFrequency}
                onValueChange={(v) =>
                  onAiSummaryFrequencyChange(v as AiSummaryFrequency)
                }
              >
                <SelectTrigger className="w-[160px] bg-zinc-900 border-white/[0.06] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08]">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SettingRow>

          {/* Frequency description */}
          {selectedFreq && (
            <div className="py-3 border-b border-white/[0.03] last:border-b-0">
              <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Brain className="h-3 w-3 text-zinc-600" />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                    Schedule
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {aiSummaryFrequency === "manual" ? (
                    <>
                      AI summaries are generated only when you manually trigger
                      them from a portfolio page.
                    </>
                  ) : (
                    <>
                      Your portfolios will be analyzed{" "}
                      <span className="text-zinc-300 font-medium">
                        {selectedFreq.description.toLowerCase()}
                      </span>
                      . Each summary includes performance insights, risk
                      analysis, and actionable recommendations.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </Section>
      ) : (
        <Section title="AI Summaries" description="Coming soon" status="off">
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-600">
              Scheduled AI summaries are coming soon.
            </p>
            <p className="text-xs text-zinc-700 mt-1">
              You can still generate on-demand summaries from any portfolio
              page.
            </p>
          </div>
        </Section>
      )}

      {/* ── BYOAI Provider ── */}
      <Section
        title="AI Provider"
        description={
          byoaiEnabled ? "Model & routing config" : "Using hosted AI"
        }
        status={
          aiProvider === "openrouter" || aiProvider === "self-hosted"
            ? "amber"
            : "live"
        }
      >
        <SettingRow
          label="Provider"
          description="Choose how AI features are powered"
        >
          {byoaiEnabled ? (
            <Select value={aiProvider} onValueChange={onAiProviderChange}>
              <SelectTrigger className="w-[160px] bg-zinc-900 border-white/[0.06] text-white h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/[0.08]">
                <SelectItem
                  value="default"
                  className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  Default (Hosted)
                </SelectItem>
                <SelectItem
                  value="openrouter"
                  className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  OpenRouter
                </SelectItem>
                <SelectItem
                  value="self-hosted"
                  className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  Self-Hosted
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-zinc-600 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04]">
              Default (Hosted)
            </span>
          )}
        </SettingRow>

        {/* Provider status row */}
        <SettingRow label="Status" description="Current provider connection">
          <div className="flex items-center gap-2.5">
            <StatusDot
              status={
                aiProvider === "default"
                  ? "live"
                  : aiProvider === "openrouter" && openRouterApiKey
                    ? "live"
                    : aiProvider === "self-hosted" && selfHostedUrl
                      ? "amber"
                      : "off"
              }
              pulse={aiProvider === "default"}
            />
            <span className="text-[11px] text-zinc-500">
              {aiProvider === "default"
                ? "Connected to hosted AI"
                : aiProvider === "openrouter"
                  ? openRouterApiKey
                    ? "API key configured"
                    : "API key required"
                  : selfHostedUrl
                    ? "Tunnel configured"
                    : "Configuration required"}
            </span>
          </div>
        </SettingRow>

        {/* OpenRouter config */}
        {byoaiEnabled && aiProvider === "openrouter" && (
          <div className="py-3 border-b border-white/[0.03] last:border-b-0">
            <div className="rounded-lg border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowSquareOut className="h-3 w-3 text-zinc-500" />
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  OpenRouter Config
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">API Key</Label>
                <Input
                  type="password"
                  value={openRouterApiKey}
                  onChange={(e) => onOpenRouterApiKeyChange(e.target.value)}
                  placeholder="or-xxxx"
                  className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Self-hosted config */}
        {byoaiEnabled && aiProvider === "self-hosted" && (
          <div className="py-3 border-b border-white/[0.03] last:border-b-0">
            <div className="rounded-lg border border-white/[0.06] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <HardDrives className="h-3 w-3 text-zinc-500" />
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Self-Hosted Config
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">Tunnel ID</Label>
                <Input
                  value={tunnelId}
                  onChange={(e) => onTunnelIdChange(e.target.value)}
                  placeholder="tunnel-id"
                  className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">Server URL</Label>
                <Input
                  value={selfHostedUrl}
                  onChange={(e) => onSelfHostedUrlChange(e.target.value)}
                  placeholder="https://"
                  className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
