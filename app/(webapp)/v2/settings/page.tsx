"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { V2Header } from "@/components/v2/v2-header";

import {
  Globe,
  DollarSign,
  Palette,
  Download,
  Sparkles,
  ExternalLink,
  Server,
  Moon,
  Sun,
  Save,
  ChevronRight,
  Zap,
  Bell,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Section Component (matches V2 card pattern) ─── */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04]">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── Row Component ─── */
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">{label}</p>
        {description && (
          <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ─── Toggle Component ─── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-white" : "bg-white/[0.08]"}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${checked ? "left-5.5 bg-black" : "left-0.5 bg-zinc-500"}`}
      />
    </button>
  );
}

export default function V2SettingsPage() {
  const { user } = useUser();

  // Get feature flags
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
    clerkId: user?.id,
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );
  const updatePreferences = useMutation(api.users.updateUserPreferences);
  const updateUiVersion = useMutation(api.users.updateUserUiVersion);
  const updateEarlyAccess = useMutation(api.users.updateUserEarlyAccess);
  const accountData = useQuery(
    api.users.extractAccountDataForExport,
    userId ? { userId } : "skip",
  );

  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(true);
  const [aiProvider, setAiProvider] = useState("default");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [tunnelId, setTunnelId] = useState("");
  const [selfHostedUrl, setSelfHostedUrl] = useState("");
  const [uiVersion, setUiVersion] = useState("v1");
  const [earlyAccess, setEarlyAccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (userPreferences && userId) {
      setLanguage(userPreferences.language || "en");
      setCurrency(userPreferences.currency || "USD");
      setDarkMode(userPreferences.theme === "dark");
      setAiProvider(userPreferences.aiProvider || "default");
      setOpenRouterApiKey(userPreferences.openRouterApiKey || "");
      setTunnelId(userPreferences.tunnelId || "");
      setSelfHostedUrl(userPreferences.selfHostedUrl || "");
      setUiVersion(userPreferences.uiVersion || "v1");
      setEarlyAccess(userPreferences.earlyAccess || false);
    }
  }, [userPreferences, userId]);

  const markChanged = () => setHasChanges(true);

  const handleSave = async () => {
    setTheme(darkMode ? "dark" : "light");
    try {
      if (userId) {
        await updatePreferences({
          userId,
          language,
          currency,
          theme: darkMode ? "dark" : "light",
          aiProvider,
          openRouterApiKey,
          tunnelId,
          selfHostedUrl,
        });
      }
      toast.success("Settings saved");
      setHasChanges(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleUiVersionChange = async (newVersion: "v1" | "v2") => {
    try {
      if (userId) {
        await updateUiVersion({ userId, uiVersion: newVersion });
        setUiVersion(newVersion);
        toast.success(`UI updated to ${newVersion}`);

        // Redirect to appropriate version
        if (newVersion === "v1") {
          window.location.href = "/settings";
        } else {
          window.location.href = "/v2/settings";
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update UI version");
    }
  };

  const handleEarlyAccessToggle = async (enabled: boolean) => {
    try {
      if (userId) {
        await updateEarlyAccess({ userId, earlyAccess: enabled });
        setEarlyAccess(enabled);
        toast.success(
          enabled ? "Early access enabled" : "Early access disabled",
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update early access");
    }
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

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <V2Header />

      <div className="max-w-[720px] mx-auto px-8 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-1">
              Settings
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Preferences
            </h1>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Save className="h-3.5 w-3.5" /> Save Changes
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* Appearance */}
          {appearanceEnabled && (
            <Section icon={Palette} title="Appearance">
              <SettingRow
                label="Dark Mode"
                description="Toggle between light and dark theme"
              >
                <Toggle
                  checked={darkMode}
                  onChange={(v) => {
                    setDarkMode(v);
                    setTheme(v ? "dark" : "light");
                    markChanged();
                  }}
                />
              </SettingRow>
            </Section>
          )}

          {/* Language */}
          <Section icon={Globe} title="Language">
            <SettingRow
              label="Display Language"
              description="Set your preferred language"
            >
              <Select
                value={language}
                onValueChange={(v) => {
                  setLanguage(v);
                  markChanged();
                }}
              >
                <SelectTrigger className="w-[140px] bg-zinc-900 border-white/[0.06] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08]">
                  <SelectItem
                    value="en"
                    className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                  >
                    English
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </Section>

          {/* Currency */}
          <Section icon={DollarSign} title="Currency">
            <SettingRow
              label="Base Currency"
              description="Used for portfolio value calculations"
            >
              <Select
                value={currency}
                onValueChange={(v) => {
                  setCurrency(v);
                  markChanged();
                }}
              >
                <SelectTrigger className="w-[140px] bg-zinc-900 border-white/[0.06] text-white h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08]">
                  {[
                    { v: "USD", l: "USD" },
                    { v: "EUR", l: "EUR" },
                    { v: "GBP", l: "GBP" },
                    { v: "CAD", l: "CAD" },
                    { v: "JPY", l: "JPY" },
                    { v: "AUD", l: "AUD" },
                    { v: "CHF", l: "CHF" },
                  ].map((c) => (
                    <SelectItem
                      key={c.v}
                      value={c.v}
                      className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                    >
                      {c.l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </Section>

          {/* Export */}
          <Section icon={Download} title="Data Export">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-40"
              >
                <Download className="h-3 w-3" />{" "}
                {isExporting ? "Exporting..." : "JSON"}
              </button>
              {["CSV", "PDF", "Excel"].map((f) => (
                <button
                  key={f}
                  disabled
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-700 cursor-not-allowed"
                >
                  <Download className="h-3 w-3" /> {f}
                </button>
              ))}
            </div>
          </Section>

          {/* BYOAI */}
          {byoaiEnabled && (
            <Section icon={Sparkles} title="AI Provider">
              <div className="flex flex-col gap-5">
                <SettingRow
                  label="Provider"
                  description="Choose how AI features are powered"
                >
                  <Select
                    value={aiProvider}
                    onValueChange={(v) => {
                      setAiProvider(v);
                      markChanged();
                    }}
                  >
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
                </SettingRow>

                {aiProvider === "openrouter" && (
                  <div className="rounded-lg border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="h-3 w-3 text-zinc-500" />
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        OpenRouter Config
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-zinc-400">API Key</Label>
                      <Input
                        type="password"
                        value={openRouterApiKey}
                        onChange={(e) => {
                          setOpenRouterApiKey(e.target.value);
                          markChanged();
                        }}
                        placeholder="or-xxxx"
                        className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {aiProvider === "self-hosted" && (
                  <div className="rounded-lg border border-white/[0.06] p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-3 w-3 text-zinc-500" />
                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        Self-Hosted Config
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-zinc-400">Tunnel ID</Label>
                      <Input
                        value={tunnelId}
                        onChange={(e) => {
                          setTunnelId(e.target.value);
                          markChanged();
                        }}
                        placeholder="tunnel-id"
                        className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-zinc-400">
                        Server URL
                      </Label>
                      <Input
                        value={selfHostedUrl}
                        onChange={(e) => {
                          setSelfHostedUrl(e.target.value);
                          markChanged();
                        }}
                        placeholder="https://"
                        className="bg-zinc-900 border-white/[0.06] text-white h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Early Access Features */}
          <Section icon={Zap} title="Early Access Features">
            <div className="flex flex-col gap-5">
              <SettingRow
                label="Early Access Program"
                description="Get access to experimental features and new UI designs"
              >
                <Toggle
                  checked={earlyAccess}
                  onChange={handleEarlyAccessToggle}
                />
              </SettingRow>

              {earlyAccess && (
                <div className="rounded-lg border border-white/[0.06] p-4 bg-zinc-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      UI Version
                    </span>
                  </div>
                  <SettingRow
                    label="Interface Version"
                    description="Choose between classic (v1) and modern (v2) interface"
                  >
                    <Select
                      value={uiVersion}
                      onValueChange={handleUiVersionChange}
                    >
                      <SelectTrigger className="w-[140px] bg-zinc-900 border-white/[0.06] text-white h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/[0.08]">
                        <SelectItem
                          value="v1"
                          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                        >
                          v1 (Classic)
                        </SelectItem>
                        <SelectItem
                          value="v2"
                          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                        >
                          v2 (Modern)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                </div>
              )}
            </div>
          </Section>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors w-full mt-4"
          >
            <Save className="h-3.5 w-3.5" /> Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
