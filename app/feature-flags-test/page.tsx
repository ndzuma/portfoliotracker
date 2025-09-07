"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { CheckCircle, XCircle, Code } from "lucide-react";

export default function FeatureFlagsTestPage() {
  const features = [
    { key: "watchlist", name: "Watchlist" },
    { key: "research", name: "Research" },
    { key: "earningsCalendar", name: "Earnings Calendar" },
    { key: "byoai", name: "BYOAI (Bring Your Own AI)" },
    { key: "apiKeyManagement", name: "API Key Management" },
    { key: "appearanceToggle", name: "Appearance Toggle" },
    { key: "portfolioAnalytics", name: "Portfolio Analytics" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Feature Flags Test Page
          </h1>
          <p className="text-muted-foreground">
            This page demonstrates the feature flags system implementation.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Environment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">NEXT_PUBLIC_NODE_ENV</p>
                <Badge variant="outline">
                  {process.env.NEXT_PUBLIC_NODE_ENV || "undefined"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">NEXT_PUBLIC_DEV_MODE</p>
                <Badge variant="outline">
                  {process.env.NEXT_PUBLIC_DEV_MODE || "undefined"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature) => {
                const isEnabled = isFeatureEnabled(feature.key);
                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {isEnabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isEnabled ? "default" : "secondary"}
                        className={
                          isEnabled ? "bg-green-500 hover:bg-green-600" : ""
                        }
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {feature.key}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Dev Mode Logic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Current Logic:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  When <code>NEXT_PUBLIC_NODE_ENV === 'development'</code> AND{" "}
                  <code>NEXT_PUBLIC_DEV_MODE === 'true'</code>, all features are
                  enabled
                </li>
                <li>
                  In production or when dev mode is off, individual environment
                  variables control each feature
                </li>
                <li>
                  This allows developers to test all features locally while
                  maintaining production control
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
