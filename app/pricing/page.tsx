"use client";

import { motion } from "motion/react";
import { ArrowLeft, Crown } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: "#09090b" }}
    >
      {/* Ambient glow — gold radial, ultra subtle */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(212,175,55,0.06),transparent)] pointer-events-none" />

      {/* Back button — pinned top-left, inside app container */}
      <div className="relative max-w-[1600px] w-full mx-auto px-8 pt-8">
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onClick={() => router.back()}
          className="flex items-center gap-2.5 text-sm text-zinc-500 hover:text-white transition-colors group"
        >
          <span className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/[0.06] bg-zinc-950/80 group-hover:border-white/[0.12] group-hover:bg-zinc-900/80 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="font-medium">Back</span>
        </motion.button>
      </div>

      {/* Centered content — fills remaining height, true center */}
      <div className="relative flex-1 flex items-center justify-center max-w-[1600px] w-full mx-auto px-8 py-12">
        <div className="flex flex-col items-center w-full max-w-xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center mb-10"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
              <Crown className="h-6 w-6 text-primary" weight="duotone" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Choose Your Plan
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
              Start free and upgrade when you're ready. Pro unlocks the full
              PulsePortfolio experience.
            </p>
          </motion.div>

          {/* Pricing Table */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            <PricingTable
              appearance={{
                baseTheme: dark,
              }}
            />
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xs text-zinc-600 mt-10 text-center"
          >
            Plans can be changed anytime from your settings.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
