"use client";

import type React from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  Download,
  Globe,
  DollarSign,
  Palette,
  FileText,
  Save,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("portfolio-language") || "en";
      const savedCurrency = localStorage.getItem("portfolio-currency") || "USD";
      const savedDarkMode =
        localStorage.getItem("portfolio-dark-mode") === "true";

      setLanguage(savedLanguage);
      setCurrency(savedCurrency);
      setDarkMode(savedDarkMode);
    }
  }, []);

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio-language", language);
      localStorage.setItem("portfolio-currency", currency);
      localStorage.setItem("portfolio-dark-mode", darkMode.toString());
    }

    // Apply theme change
    setTheme(darkMode ? "dark" : "light");

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportPortfolio = (format: string) => {
    const portfolioData = {
      portfolios: [
        {
          name: "Alex portfolio #1",
          value: 26950,
          assets: [
            { symbol: "AAPL", name: "Apple Inc.", value: 8500, shares: 50 },
            {
              symbol: "MSFT",
              name: "Microsoft Corporation",
              value: 6200,
              shares: 25,
            },
            { symbol: "GOOGL", name: "Alphabet Inc.", value: 4800, shares: 20 },
          ],
        },
      ],
      exportDate: new Date().toISOString(),
      currency: currency,
    };

    if (format === "CSV") {
      const csvContent = [
        "Symbol,Name,Value,Shares",
        ...portfolioData.portfolios[0].assets.map(
          (asset) =>
            `${asset.symbol},${asset.name},${asset.value},${asset.shares}`,
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === "JSON") {
      const jsonContent = JSON.stringify(portfolioData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // For PDF and Excel, show a toast indicating the feature
      toast({
        title: `${format} Export`,
        description: `${format} export functionality would be implemented here with a proper library.`,
      });
    }

    toast({
      title: "Export started",
      description: `Your portfolio data is being exported as ${format}.`,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-foreground mb-6">Settings</h1>

      <div className="grid gap-6 max-w-4xl">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Configure your preferred language and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Display Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>
              Set your preferred currency for displaying portfolio values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Base Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
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

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your portfolio dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
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
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current theme: {theme === "dark" ? "Dark" : "Light"}
            </p>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Portfolio
            </CardTitle>
            <CardDescription>
              Download your portfolio data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExportPortfolio("PDF")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportPortfolio("CSV")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportPortfolio("Excel")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportPortfolio("JSON")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Exported files will include all portfolio holdings, performance
              data, and transaction history.
            </p>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
