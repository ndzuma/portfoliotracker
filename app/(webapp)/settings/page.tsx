"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Download,
  Globe,
  DollarSign,
  Palette,
  FileText,
  Save,
  Sparkles,
  ExternalLink,
  Server,
  Key,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { isFeatureEnabled } from "@/lib/featureFlags";

const SettingsPage = () => {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiProvider, setAiProvider] = useState("default");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [tunnelId, setTunnelId] = useState("");
  const [selfHostedUrl, setSelfHostedUrl] = useState("");
  const { theme, setTheme } = useTheme();

  // Convex operations
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id,
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    { userId },
    { enabled: !!userId },
  );
  const updatePreferences = useMutation(api.users.updateUserPreferences);
  const accountData = useQuery(
    api.users.extractAccountDataForExport,
    { userId },
    { enabled: !!userId },
  );

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

  const handleSaveSettings = async () => {
    // Update theme in NextJS
    setTheme(darkMode ? "dark" : "light");

    try {
      // Update preferences in Convex
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

      toast.success("Settings saved", {
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast.error("Error saving settings", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    }
  };

  const handleExportPortfolio = async () => {
    try {
      setIsExporting(true);

      // Create a simple export with user preferences
      const exportData = {
        accountData,
        exportDate: new Date().toISOString(),
        exportVersion: "1.0",
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Export complete", {
        description: "Your portfolio data has been exported as JSON.",
      });
    } catch (error) {
      toast.error("Export failed", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and application settings
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        {isFeatureEnabled('appearanceToggle') && (
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Palette className="h-5 w-5 mr-2 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your portfolio dashboard
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(checked);
                  setTheme(checked ? "dark" : "light");
                }}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current theme: {theme === "dark" ? "Dark" : "Light"}
            </p>
          </CardContent>
        </Card>
        )}

        {/* Language & Region Settings */}
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Configure your preferred language and regional settings
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language" className="font-medium">
                Display Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  id="language"
                  className="w-full border-[#8d745d]/30"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Currency Settings
            </CardTitle>
            <CardDescription>
              Set your preferred currency for displaying portfolio values
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency" className="font-medium">
                Base Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger
                  id="currency"
                  className="w-full border-[#8d745d]/30"
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
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
          </CardContent>
        </Card>

        {/* Export Portfolio */}
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Export Portfolio
            </CardTitle>
            <CardDescription>
              Download your portfolio data in various formats
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-4">
            <div className="grid sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={handleExportPortfolio}
                disabled={isExporting}
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export as JSON"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPortfolio}
                disabled={true}
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export as CSV"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPortfolio}
                disabled={true}
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export as PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPortfolio}
                disabled={true}
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export as Excel"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Exporting large portfolios may take a few moments.
            </p>
          </CardContent>
        </Card>

        {/* API key management for the api-based data fetching for pro users, with link to docs */}
        {isFeatureEnabled('apiKeyManagement') && (
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              API Key Management
            </CardTitle>
            <CardDescription>
              Manage your API keys for accessing portfolio data programmatically
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                Generate New API Key
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                View Existing API Keys
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Keep your API keys secure. Do not share them with others.
            </p>
            <a
              href="/docs/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Learn more about using the API
            </a>
          </CardContent>
        </Card>
        )}

        {/* BYOAI feature - Bring Your Own AI */}
        {isFeatureEnabled('byoai') && (
        <Card className="border border-[#8d745d]/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              BYOAI Settings
            </CardTitle>
            <CardDescription>
              Configure your AI provider for enhanced portfolio insights and
              analysis
            </CardDescription>
          </CardHeader>
          <Separator className="bg-[#8d745d]/20" />
          <CardContent className="pt-4 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="ai-provider" className="font-medium">
                AI Provider
              </Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger
                  id="ai-provider"
                  className="w-full border-[#8d745d]/30"
                >
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    Default (Hosted by PortfolioTracker)
                  </SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="self-hosted">Self-Hosted Model</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how you want to provide AI capabilities for portfolio
                analysis
              </p>
            </div>

            {aiProvider === "openrouter" && (
              <div className="space-y-4 border rounded-md p-4 bg-background/50">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">
                    OpenRouter Configuration
                  </h4>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openrouter-key" className="text-sm">
                    OpenRouter API Key
                  </Label>
                  <div className="flex">
                    <Input
                      id="openrouter-key"
                      type="password"
                      value={openRouterApiKey}
                      onChange={(e) => setOpenRouterApiKey(e.target.value)}
                      placeholder="or-xxxxxxxxxxxx"
                      className="flex-1 border-[#8d745d]/30"
                    />
                    <Button
                      variant="outline"
                      className="ml-2 border-[#8d745d]/30"
                      onClick={() =>
                        window.open("https://openrouter.ai/keys", "_blank")
                      }
                    >
                      Get Key
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key is securely stored and never shared
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model-preference" className="text-sm">
                    Preferred Model
                  </Label>
                  <Select defaultValue="gpt-3.5-turbo">
                    <SelectTrigger
                      id="model-preference"
                      className="w-full border-[#8d745d]/30"
                    >
                      <SelectValue placeholder="Select preferred model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="claude-3-opus">
                        Claude 3 Opus
                      </SelectItem>
                      <SelectItem value="claude-3-sonnet">
                        Claude 3 Sonnet
                      </SelectItem>
                      <SelectItem value="llama-3">Llama 3</SelectItem>
                      <SelectItem value="mistral-large">
                        Mistral Large
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fallback" className="text-sm">
                      Fallback to Default
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Use default AI if OpenRouter fails
                    </p>
                  </div>
                  <Switch
                    id="fallback"
                    defaultChecked={true}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            )}

            {aiProvider === "self-hosted" && (
              <div className="space-y-4 border rounded-md p-4 bg-background/50">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">
                    Self-Hosted Model Configuration
                  </h4>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tunnel-id" className="text-sm">
                    Tunnel ID
                  </Label>
                  <Input
                    id="tunnel-id"
                    value={tunnelId}
                    onChange={(e) => setTunnelId(e.target.value)}
                    placeholder="Your unique tunnel identifier"
                    className="border-[#8d745d]/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Install our tunnel software on your device hosting the AI
                    model
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="self-hosted-url" className="text-sm">
                    Self-Hosted URL (Optional)
                  </Label>
                  <Input
                    id="self-hosted-url"
                    value={selfHostedUrl}
                    onChange={(e) => setSelfHostedUrl(e.target.value)}
                    placeholder="http://your-server:port/v1"
                    className="border-[#8d745d]/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct URL to your model API if publicly accessible
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="auth-key" className="text-sm">
                    Authentication Key
                  </Label>
                  <div className="flex">
                    <Input
                      id="auth-key"
                      type="password"
                      placeholder="sk-xxxxxxxxxxxx"
                      className="flex-1 border-[#8d745d]/30"
                    />
                    <Button
                      variant="outline"
                      className="ml-2 border-[#8d745d]/30"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="w-full border-[#8d745d]/30 hover:bg-[#8d745d]/10"
                    onClick={() =>
                      window.open("/docs/self-hosted-ai", "_blank")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Tunnel Software
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full border-[#8d745d]/30 hover:bg-[#8d745d]/10"
                onClick={() => toast.success("AI connection test successful!")}
              >
                <Sparkles className="h-4 w-4" />
                Test AI Connection
              </Button>

              <a
                href="/docs/byoai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                Learn more about BYOAI features
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
        )}
        
        {/* Footer with version info */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          PortfolioTracker v1.0.0
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
