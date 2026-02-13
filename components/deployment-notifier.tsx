"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

export function DeploymentNotifier() {
  const deployment = useQuery(api.deployments.getLatest);
  const [lastSeenDeploymentId, setLastSeenDeploymentId] = useState<
    string | null
  >(null);
  const hasHydratedRef = useRef(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!deployment || deployment.status !== "success") return;

    // First load — record the current deployment silently, don't show
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      setLastSeenDeploymentId(deployment.deploymentId);
      return;
    }

    // Same deployment we already showed — skip
    if (deployment.deploymentId === lastSeenDeploymentId) return;

    setLastSeenDeploymentId(deployment.deploymentId);
    setShowNotification(true);
  }, [deployment, lastSeenDeploymentId]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="fixed flex-row flex items-center bottom-8 right-8 z-[9999] select-none rounded-xl border border-white/[0.06] bg-zinc-950 px-5 py-4"
        >
          <div className="flex flex-col pr-5">
            <p className="text-[14px] text-zinc-300 tracking-tight">
              Client out of date
            </p>
            <p className="text-[13px] text-zinc-300 tracking-tight">
              Please refresh to get latest version
            </p>
          </div>
          
          <div>
            <button
              onClick={() => window.location.reload()}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/[0.06] text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
            >
              <ArrowsClockwise
                className="h-3 w-3 group-hover:rotate-45 transition-transform duration-300"
                weight="bold"
              />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Refresh Now
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
