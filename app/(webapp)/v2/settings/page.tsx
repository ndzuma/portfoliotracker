"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { V2Header } from "@/components/v2/v2-header";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  Globe,
  DollarSign,
  Palette,
  FileText,
  Save,
  Sparkles,
  ExternalLink,
  Server,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SettingsSection({ icon: Icon, title, description, children }: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function V2SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPreferences = useQuery(api.users.getUserPreferences, { userId }, { enabled: !!userId });
  const updatePreferences = useMutation(api.users.updateUserPreferences);
  const accountData = useQuery(api.users.extractAccountDataForExport, { userId }, { enabled: !!userId });

  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(true);
  const [aiProvider, setAiProvider] = useState("default");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [tunnelId, setTunnelId] = useState("");
  const [selfHostedUrl, setSelfHostedUrl] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (userPreferences && userId) {
      setLanguage(userPreferences.language || "en");
      setCurrency(userPreferences.currency || "USD");
      setDarkMode(userPreferences.theme === "dark");
      setAiProvider(userPreferences.aiProvider || "default");
      setOpenRouterApiKey(userPreferences.openRouterApiKey || "");
      setTunnelId(userPreferences.tunnelId || "");
      setSelfHostedUrl(userPreferences.selfHostedUrl || "");
    }
  }, [userPreferences, userId]);

  const handleSave = async () => {
    setTheme(darkMode ? "dark" : "light");
    try {
      if (userId) {
        await updatePreferences({ userId, language, currency, theme: darkMode ? "dark" : "light", aiProvider, openRouterApiKey, tunnelId, selfHostedUrl });
      }
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error("Error", { description: e.message || "Try again" });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify({ accountData, exportDate: new Date().toISOString(), version: "1.0" }, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export complete");
    } catch { toast.error("Export failed"); }
    finally { setIsExporting(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <V2Header />

      <div className="max-w-[900px] mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-sm text-zinc-600 mt-1">Manage preferences and configuration.</p>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors">
            <Save className="h-4 w-4" />Save
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Appearance */}
          {isFeatureEnabled("appearanceToggle") && (
            <SettingsSection icon={Palette} title="Appearance" description="Customize the look of your dashboard">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Dark Mode</p>
                  <p className="text-xs text-zinc-600">Switch between themes</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={(c) => { setDarkMode(c); setTheme(c ? "dark" : "light"); }} />
              </div>
            </SettingsSection>
          )}

          {/* Language */}
          <SettingsSection icon={Globe} title="Language & Region" description="Set your preferred language">
            <div className="grid gap-2">
              <Label className="text-xs text-zinc-400">Display Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.06]">
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          {/* Currency */}
          <SettingsSection icon={DollarSign} title="Currency" description="Base currency for portfolio values">
            <div className="grid gap-2">
              <Label className="text-xs text-zinc-400">Base Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.06]">
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          {/* Export */}
          <SettingsSection icon={FileText} title="Export" description="Download your portfolio data">
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-40">
                <Download className="h-3.5 w-3.5" />{isExporting ? "Exporting..." : "JSON"}
              </button>
              {["CSV", "PDF", "Excel"].map((f) => (
                <button key={f} disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/[0.06] text-zinc-600 cursor-not-allowed">
                  <Download className="h-3.5 w-3.5" />{f}
                </button>
              ))}
            </div>
          </SettingsSection>

          {/* BYOAI */}
          {isFeatureEnabled("byoai") && (
            <SettingsSection icon={Sparkles} title="BYOAI" description="Bring your own AI provider">
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs text-zinc-400">Provider</Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/[0.06]">
                      <SelectItem value="default">Default (Hosted)</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="self-hosted">Self-Hosted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aiProvider === "openrouter" && (
                  <div className="rounded-lg border border-white/[0.06] p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2"><ExternalLink className="h-3.5 w-3.5 text-zinc-500" /><span className="text-xs font-medium text-white">OpenRouter Config</span></div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-zinc-400">API Key</Label>
                      <Input type="password" value={openRouterApiKey} onChange={(e) => setOpenRouterApiKey(e.target.value)} placeholder="or-xxxx" className="bg-zinc-900 border-white/[0.06] text-white" />
                    </div>
                  </div>
                )}

                {aiProvider === "self-hosted" && (
                  <div className="rounded-lg border border-white/[0.06] p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2"><Server className="h-3.5 w-3.5 text-zinc-500" /><span className="text-xs font-medium text-white">Self-Hosted Config</span></div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-zinc-400">Tunnel ID</Label>
                      <Input value={tunnelId} onChange={(e) => setTunnelId(e.target.value)} placeholder="tunnel-id" className="bg-zinc-900 border-white/[0.06] text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-zinc-400">Server URL</Label>
                      <Input value={selfHostedUrl} onChange={(e) => setSelfHostedUrl(e.target.value)} placeholder="https://" className="bg-zinc-900 border-white/[0.06] text-white" />
                    </div>
                  </div>
                )}
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
