"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Sparkle } from "@phosphor-icons/react";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlanSelectionModal({
  isOpen,
  onClose,
}: PlanSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-white/[0.08] px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkle className="h-5 w-5 text-primary" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Choose Your Plan
                  </h2>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Select a plan that works best for you
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/[0.05] rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Pricing Table */}
            <div className="px-6 py-6">
              <PricingTable
                appearance={{
                  baseTheme: dark,
                }}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.08] px-6 py-4 sticky bottom-0 bg-zinc-900 rounded-b-2xl">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                Continue with Free
              </button>
              <p className="text-xs text-zinc-600 text-center mt-3">
                You can change your plan anytime in your settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
