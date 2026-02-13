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
import { useTranslations } from "next-intl";

/* ─── AI Summary Frequency Options ─── */
const FREQUENCY_OPTIONS = [
  { value: "daily" as const },
  { value: "weekly" as const },
  { value: "monthly" as const },
  { value: "manual" as const },
] as const;

type AiSummaryFrequency = "daily" | "weekly" | "monthly" | "manual";

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
  const t = useTranslations("settings");
  
  // Helper functions for frequency translations
  const getFrequencyLabel = (value: AiSummaryFrequency) => {
    switch (value) {
      case "daily":
        return t("daily");
      case "weekly":
        return t("weekly");
      case "monthly":
        return t("monthly");
      case "manual":
        return t("manualOnly");
      default:
        return value;
    }
  };

  const getFrequencyDescription = (value: AiSummaryFrequency) => {
    switch (value) {
      case "daily":
        return t("oncePerDay");
      case "weekly":
        return t("everyMonday");
      case "monthly":
        return t("firstOfMonth");
      case "manual":
        return t("onDemand");
      default:
        return "";
    }
  };

  const selectedFreq = FREQUENCY_OPTIONS.find(
    (f) => f.value === aiSummaryFrequency,
  );

  const providerLabel =
    aiProvider === "openrouter"
      ? t("openRouter")
      : aiProvider === "self-hosted"
        ? t("selfHosted")
        : t("defaultHosted");

  return (
    <>
      {/* ── Portfolio AI Summary Frequency ── */}
      {aiSummariesEnabled ? (
        <Section
          title={t("aiSummaries")}
          description={t("portfolioAnalysisSchedule")}
          status={aiSummaryFrequency !== "manual" ? "live" : "off"}
        >
          <SettingRow
            label={t("summaryFrequency")}
            description={t("summaryFrequencyDesc")}
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
                      {getFrequencyLabel(opt.value)}
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
                    {t("schedule")}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {aiSummaryFrequency === "manual" ? (
                    <>
                      {t("manualDescription")}
                    </>
                  ) : (
                    <>
                      {t("autoDescription", { frequency: getFrequencyDescription(aiSummaryFrequency).toLowerCase() })}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </Section>
      ) : (
        <Section title={t("aiSummaries")} description={t("comingSoon")} status="off">
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-600">
              {t("scheduledAiComingSoon")}
            </p>
            <p className="text-xs text-zinc-700 mt-1">
              {t("onDemandStillAvailable")}
            </p>
          </div>
        </Section>
      )}

      {/* ── BYOAI Provider ── */}
      <Section
        title={t("aiProvider")}
        description={
          byoaiEnabled ? t("modelRoutingConfig") : t("usingHostedAi")
        }
        status={
          aiProvider === "openrouter" || aiProvider === "self-hosted"
            ? "amber"
            : "live"
        }
      >
        <SettingRow
          label={t("provider")}
          description={t("providerDescription")}
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
                  {t("defaultHosted")}
                </SelectItem>
                <SelectItem
                  value="openrouter"
                  className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  {t("openRouter")}
                </SelectItem>
                <SelectItem
                  value="self-hosted"
                  className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  {t("selfHosted")}
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-zinc-600 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04]">
              {t("defaultHosted")}
            </span>
          )}
        </SettingRow>

        {/* Provider status row */}
        <SettingRow label={t("status")} description={t("currentProviderConnection")}>
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
                ? t("connectedToHosted")
                : aiProvider === "openrouter"
                  ? openRouterApiKey
                    ? t("apiKeyConfigured")
                    : t("apiKeyRequired")
                  : selfHostedUrl
                    ? t("tunnelConfigured")
                    : t("configurationRequired")}
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
                  {t("openRouterConfig")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">{t("apiKey")}</Label>
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
                  {t("selfHostedConfig")}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">{t("tunnelId")}</Label>
                <Input
                  value={tunnelId}
                  onChange={(e) => onTunnelIdChange(e.target.value)}
                  placeholder="tunnel-id"
                  className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">{t("serverUrl")}</Label>
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
