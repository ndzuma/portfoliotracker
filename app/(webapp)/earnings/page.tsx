"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDots,
  Bell,
  TrendUp,
  CurrencyDollar,
} from "@phosphor-icons/react";
import { UpgradeNeeded } from "@/components/upgrade-needed";
import { UpgradePromptModal } from "@/components/upgrade-prompt-modal";

export default function EarningsPage() {
  const { user } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;

  const userSubscription = useQuery(
    api.subscriptions.getSubscriptionDetails,
    userId ? { userId } : "skip",
  );

  const isPro = userSubscription?.tier === "pro";

  if (!isPro) {
    return (
      <>
        <UpgradeNeeded
          featureName="Earnings Calendar"
          featureDescription="Track upcoming earnings announcements, view earnings surprises, and get alerts for companies in your portfolio."
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
        <UpgradePromptModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName="Earnings Calendar"
          featureDescription="Track upcoming earnings announcements, view earnings surprises, and get alerts for companies in your portfolio."
        />
      </>
    );
  }

  // Sample earnings data
  const upcomingEarnings = [
    {
      symbol: "AAPL",
      company: "Apple Inc.",
      date: "2024-01-25",
      time: "After Close",
      estimate: "$2.11",
      importance: "high",
    },
    {
      symbol: "MSFT",
      company: "Microsoft Corporation",
      date: "2024-01-24",
      time: "After Close",
      estimate: "$2.78",
      importance: "high",
    },
    {
      symbol: "GOOGL",
      company: "Alphabet Inc.",
      date: "2024-01-30",
      time: "After Close",
      estimate: "$1.55",
      importance: "medium",
    },
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Earnings Calendar
            </h1>
            <p className="text-muted-foreground">
              Track upcoming earnings announcements and results
            </p>
          </div>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Set Alerts
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDots className="h-5 w-5" />
                Upcoming Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEarnings.map((earnings, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {earnings.symbol}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-white ${getImportanceColor(earnings.importance)}`}
                          >
                            {earnings.importance.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {earnings.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(earnings.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {earnings.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          EPS Estimate
                        </p>
                        <p className="font-bold">{earnings.estimate}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <TrendUp className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CurrencyDollar className="h-5 w-5 text-green-500" />
                  Earnings Surprises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Recent earnings surprises will appear here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDots className="h-5 w-5 text-blue-500" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Calendar view coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Earnings Calendar"
        featureDescription="Track upcoming earnings announcements, view earnings surprises, and get alerts for companies in your portfolio."
      />
    </div>
  );
}
