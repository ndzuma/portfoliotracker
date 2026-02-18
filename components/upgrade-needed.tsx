"use client";

import { Lock, Sparkle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface UpgradeNeededProps {
  featureName: string;
  featureDescription: string;
  onUpgradeClick?: () => void;
}

export function UpgradeNeeded({
  featureName,
  featureDescription,
  onUpgradeClick,
}: UpgradeNeededProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      router.push("/pricing");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-6"
      style={{ minHeight: "calc(100vh - 3.5rem)" }}
    >
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{featureName}</h1>

        <p className="text-zinc-400 mb-8">{featureDescription}</p>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Sparkle className="h-4 w-4 text-primary mt-1 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Pro Feature</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Upgrade to Pro to unlock this feature and much more
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-zinc-600 mb-4">Pro plan includes:</p>
          <ul className="space-y-2 text-left mb-8">
            {[
              "Unlimited portfolios",
              "Market Pulse insights",
              "Research tools",
              "Investing Calendar",
              "Watchlist",
              "Full AI capabilities",
            ].map((feature, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <span className="h-1 w-1 bg-primary rounded-full shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors mb-3"
        >
          Upgrade to Pro
        </button>

        <p className="text-xs text-zinc-600">
          Only $14.99/month. Cancel anytime.
        </p>
      </div>
    </motion.div>
  );
}
