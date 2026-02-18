"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Crown, ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlanSelectionModal({
  isOpen,
  onClose,
}: PlanSelectionModalProps) {
  const router = useRouter();

  const handleViewPlans = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-white/[0.08] rounded-2xl max-w-md w-full"
          >
            {/* Close button */}
            <div className="flex justify-end px-5 pt-5">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-zinc-500 hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center px-8 pt-2 pb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5"
              >
                <Crown className="h-7 w-7 text-primary" weight="duotone" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-xl font-bold text-white tracking-tight mb-2 text-center"
              >
                You're all set!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-sm text-zinc-400 leading-relaxed mb-8 text-center max-w-xs"
              >
                You're on the{" "}
                <span className="text-white font-medium">Free plan</span>.
                Unlock unlimited portfolios, AI insights, research tools, and
                more with Pro.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="w-full space-y-3"
              >
                <button
                  onClick={handleViewPlans}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  View Plans
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continue with Free
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="text-[11px] text-zinc-600 mt-5 text-center"
              >
                You can upgrade anytime from settings.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
