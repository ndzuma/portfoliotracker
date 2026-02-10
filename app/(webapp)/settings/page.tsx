"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { motion } from "motion/react";
import { FloppyDisk, Moon, Sun } from "@phosphor-icons/react";
import { V2Tabs } from "@/components/tabs";
import {
  PulseStrip,
  Section,
  SettingRow,
  SettingsToggle,
} from "@/components/settings/settings-primitives";
import { IdentitySection } from "@/components/settings/identity-section";
import { DataSection } from "@/components/settings/data-section";
import { AlertsSection } from "@/components/settings/alerts-section";
import { AiSection } from "@/components/settings/ai-section";
import { AdvancedSection } from "@/components/settings/advanced-section";

type AiSummaryFrequency = "12h" | "daily" | "weekly" | "monthly" | "manual";
type MarketPulseChannel = "email" | "discord" | "telegram";

export default function V2SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  // Feature flags
  const appearanceEnabled = useQuery(api.flags.getFlag, {
    key: "appearance",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });
  const byoaiEnabled = useQuery(api.flags.getFlag, {
    key: "byoai",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });

  const { setTheme } = useTheme();

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );
  const updatePreferences = useMutation(api.users.updateUserPreferences);

  const accountData = useQuery(
    api.users.extractAccountDataForExport,
    userId ? { userId } : "skip",
  );

  // ── Local state for ALL Phase 6 fields ──
  const [currency, setCurrency] = useState("USD");
  const [marketRegion, setMarketRegion] = useState("GLOBAL");
  const [darkMode, setDarkMode] = useState(true);

  // AI fields
  const [aiProvider, setAiProvider] = useState("default");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [tunnelId, setTunnelId] = useState("");
  const [selfHostedUrl, setSelfHostedUrl] = useState("");
  const [aiSummaryFrequency, setAiSummaryFrequency] =
    useState<AiSummaryFrequency>("manual");

  // Notification fields
  const [earningsReminders, setEarningsReminders] = useState(false);
  const [marketPulseEnabled, setMarketPulseEnabled] = useState(false);
  const [marketPulseChannel, setMarketPulseChannel] =
    useState<MarketPulseChannel>("email");
  const [marketPulseWebhookUrl, setMarketPulseWebhookUrl] = useState("");

  // UI state
  const [isExporting, setIsExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Hydrate ALL fields from Convex ──
  useEffect(() => {
    if (userPreferences && userId) {
      setCurrency(userPreferences.currency || "USD");
      setMarketRegion(userPreferences.marketRegion || "GLOBAL");
      setDarkMode(userPreferences.theme === "dark");
      setAiProvider(userPreferences.aiProvider || "default");
      setOpenRouterApiKey(userPreferences.openRouterApiKey || "");
      setTunnelId(userPreferences.tunnelId || "");
      setSelfHostedUrl(userPreferences.selfHostedUrl || "");
      setAiSummaryFrequency(
        (userPreferences.aiSummaryFrequency as AiSummaryFrequency) || "manual",
      );
      setEarningsReminders(userPreferences.earningsReminders ?? false);
      setMarketPulseEnabled(userPreferences.marketPulseEnabled ?? false);
      setMarketPulseChannel(
        (userPreferences.marketPulseChannel as MarketPulseChannel) || "email",
      );
      setMarketPulseWebhookUrl(userPreferences.marketPulseWebhookUrl || "");
    }
  }, [userPreferences, userId]);

  const markChanged = () => setHasChanges(true);

  // ── Save ALL Phase 6 fields to Convex ──
  const handleSave = async () => {
    setIsSaving(true);
    setTheme(darkMode ? "dark" : "light");
    try {
      if (userId) {
        await updatePreferences({
          userId,
          currency,
          marketRegion,
          theme: darkMode ? "dark" : "light",
          aiProvider,
          openRouterApiKey,
          tunnelId,
          selfHostedUrl,
          aiSummaryFrequency,
          earningsReminders,
          marketPulseEnabled,
          marketPulseChannel,
          marketPulseWebhookUrl,
        });
      }
      toast.success("Settings saved");
      setHasChanges(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Discard — reset all state to Convex values ──
  const handleDiscard = () => {
    if (userPreferences) {
      setCurrency(userPreferences.currency || "USD");
      setMarketRegion(userPreferences.marketRegion || "GLOBAL");
      setDarkMode(userPreferences.theme === "dark");
      setAiProvider(userPreferences.aiProvider || "default");
      setOpenRouterApiKey(userPreferences.openRouterApiKey || "");
      setTunnelId(userPreferences.tunnelId || "");
      setSelfHostedUrl(userPreferences.selfHostedUrl || "");
      setAiSummaryFrequency(
        (userPreferences.aiSummaryFrequency as AiSummaryFrequency) || "manual",
      );
      setEarningsReminders(userPreferences.earningsReminders ?? false);
      setMarketPulseEnabled(userPreferences.marketPulseEnabled ?? false);
      setMarketPulseChannel(
        (userPreferences.marketPulseChannel as MarketPulseChannel) || "email",
      );
      setMarketPulseWebhookUrl(userPreferences.marketPulseWebhookUrl || "");
      setTheme(userPreferences.theme === "dark" ? "dark" : "light");
    }
    setHasChanges(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = new Blob(
        [
          JSON.stringify(
            {
              accountData,
              exportDate: new Date().toISOString(),
              version: "1.0",
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pulseportfolio-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export complete");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Tabs ──
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "data", label: "Data & Markets" },
    { id: "alerts", label: "Alerts" },
    { id: "ai", label: "AI" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <section
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-1.5">
                Settings
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Control Room
              </h1>
            </div>

            {/* Save button — visible when changes exist */}
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-60"
              >
                <FloppyDisk className="h-3.5 w-3.5" />
                {isSaving ? "Saving…" : "Save Changes"}
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* ── Pulse Strip — live telemetry bar ── */}
      <PulseStrip />

      {/* ── Tab Navigation ── */}
      <V2Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab Content ── */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="max-w-[860px]">
          {/* ─── PROFILE TAB ─── */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <IdentitySection />

              {/* Appearance */}
              {appearanceEnabled && (
                <Section title="Appearance" description="Theme & display">
                  <SettingRow
                    label="Dark Mode"
                    description="Toggle between light and dark theme"
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="h-3.5 w-3.5 text-zinc-600" />
                      <SettingsToggle
                        checked={darkMode}
                        onChange={(v) => {
                          setDarkMode(v);
                          setTheme(v ? "dark" : "light");
                          markChanged();
                        }}
                      />
                      <Moon className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </SettingRow>
                </Section>
              )}
            </motion.div>
          )}

          {/* ─── DATA & MARKETS TAB ─── */}
          {activeTab === "data" && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <DataSection
                currency={currency}
                onCurrencyChange={(v) => {
                  setCurrency(v);
                  markChanged();
                }}
                marketRegion={marketRegion}
                onMarketRegionChange={(v) => {
                  setMarketRegion(v);
                  markChanged();
                }}
              />
            </motion.div>
          )}

          {/* ─── ALERTS TAB ─── */}
          {activeTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <AlertsSection
                marketPulseEnabled={marketPulseEnabled}
                onMarketPulseEnabledChange={(v) => {
                  setMarketPulseEnabled(v);
                  markChanged();
                }}
                marketPulseChannel={marketPulseChannel}
                onMarketPulseChannelChange={(v) => {
                  setMarketPulseChannel(v);
                  markChanged();
                }}
                marketPulseWebhookUrl={marketPulseWebhookUrl}
                onMarketPulseWebhookUrlChange={(v) => {
                  setMarketPulseWebhookUrl(v);
                  markChanged();
                }}
                earningsReminders={earningsReminders}
                onEarningsRemindersChange={(v) => {
                  setEarningsReminders(v);
                  markChanged();
                }}
              />
            </motion.div>
          )}

          {/* ─── AI TAB ─── */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <AiSection
                aiSummaryFrequency={aiSummaryFrequency}
                onAiSummaryFrequencyChange={(v) => {
                  setAiSummaryFrequency(v);
                  markChanged();
                }}
                aiProvider={aiProvider}
                onAiProviderChange={(v) => {
                  setAiProvider(v);
                  markChanged();
                }}
                openRouterApiKey={openRouterApiKey}
                onOpenRouterApiKeyChange={(v) => {
                  setOpenRouterApiKey(v);
                  markChanged();
                }}
                tunnelId={tunnelId}
                onTunnelIdChange={(v) => {
                  setTunnelId(v);
                  markChanged();
                }}
                selfHostedUrl={selfHostedUrl}
                onSelfHostedUrlChange={(v) => {
                  setSelfHostedUrl(v);
                  markChanged();
                }}
                byoaiEnabled={!!byoaiEnabled}
              />
            </motion.div>
          )}

          {/* ─── ADVANCED TAB ─── */}
          {activeTab === "advanced" && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              <AdvancedSection
                onExport={handleExport}
                isExporting={isExporting}
              />
            </motion.div>
          )}
        </div>

        {/* ── Sticky save bar at bottom when changes exist ── */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div
              className="border-t backdrop-blur-xl"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(9,9,11,0.85)",
              }}
            >
              <div className="max-w-[1600px] mx-auto px-8 py-3 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  You have unsaved changes
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDiscard}
                    className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-60"
                  >
                    <FloppyDisk className="h-3.5 w-3.5" />
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
