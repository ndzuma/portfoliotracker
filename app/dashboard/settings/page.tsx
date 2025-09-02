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
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Download,
  Globe,
  DollarSign,
  Palette,
  FileText,
  Save,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";


const SettingsPage = () => {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { theme, setTheme } = useTheme();

  // Convex operations
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {clerkId: user?.id})
  const userId = convexUser?._id
  const userPreferences = useQuery(api.users.getUserPreferences, { userId });
  const updatePreferences = useMutation(api.users.updateUserPreferences);
  const accountData = useQuery(api.users.extractAccountData, { userId });

  useEffect(() => {
    if (userPreferences) {
      setLanguage(userPreferences.language || "en");
      setCurrency(userPreferences.currency || "USD");
      setDarkMode(userPreferences.theme === "dark");
    }
  }, [userPreferences]);

  const handleSaveSettings = async () => {
    // Update theme in NextJS
    setTheme(darkMode ? "dark" : "light");

    try {
      // Update preferences in Convex
      await updatePreferences({
        userId,
        language,
        currency,
        theme: darkMode ? "dark" : "light",
      });

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
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleExportPortfolio}
                disabled={isExporting}
                className="flex items-center gap-2 border-[#8d745d]/30 hover:bg-[#8d745d]/10"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export as JSON"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Export your settings as a JSON file.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
