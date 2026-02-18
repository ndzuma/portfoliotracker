"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Flask, MagnifyingGlass, BookOpen } from "@phosphor-icons/react";
import { UpgradeNeeded } from "@/components/upgrade-needed";
import { UpgradePromptModal } from "@/components/upgrade-prompt-modal";

export default function ResearchPage() {
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
          featureName="Research Tools"
          featureDescription="Unlock advanced research capabilities including asset screening, sector analysis, and custom reports."
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
        <UpgradePromptModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName="Research Tools"
          featureDescription="Unlock advanced research capabilities including asset screening, sector analysis, and custom reports."
        />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Research</h1>
            <p className="text-zinc-500">
              Deep-dive into assets, sectors, and market trends
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Flask className="h-6 w-6 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Research Hub
            </h2>
            <p className="text-sm text-zinc-600 max-w-md leading-relaxed mb-6">
              Analyze assets, compare sectors, and surface insights from your
              portfolio data.
            </p>
            <div className="flex items-center gap-6 text-zinc-700">
              <div className="flex items-center gap-2 text-xs">
                <MagnifyingGlass className="h-3.5 w-3.5" />
                <span>Asset Screener</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Sector Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flask className="h-3.5 w-3.5" />
                <span>Custom Reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Research Tools"
        featureDescription="Unlock advanced research capabilities including asset screening, sector analysis, and custom reports."
      />
    </div>
  );
}
