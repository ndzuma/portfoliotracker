"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Rocket, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Deployment {
  deploymentId: string;
  status: string;
  serviceName?: string;
  environment?: string;
  branch?: string;
  commitMessage?: string;
  commitAuthor?: string;
  triggeredAt: number;
}

export function DeploymentNotifier() {
  const [lastSeenDeploymentId, setLastSeenDeploymentId] = useState<string | null>(null);
  const [hasShownInitial, setHasShownInitial] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkForNewDeployment = useCallback(async () => {
    try {
      const response = await fetch("/api/railway-deploy");
      if (!response.ok) return;
      
      const data = await response.json();
      const deployment: Deployment | null = data.deployment;

      if (!deployment || deployment.status !== "success") return;

      // On first load, just record the current deployment without showing toast
      if (!hasShownInitial) {
        setLastSeenDeploymentId(deployment.deploymentId);
        setHasShownInitial(true);
        return;
      }

      // Show toast if there's a new deployment we haven't seen
      if (deployment.deploymentId !== lastSeenDeploymentId && !isDismissed) {
        setLastSeenDeploymentId(deployment.deploymentId);
        
        const deploymentTime = new Date(deployment.triggeredAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const serviceName = deployment.serviceName || "app";
        const environment = deployment.environment || "production";
        const branch = deployment.branch;
        const commitMessage = deployment.commitMessage;

        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              className="relative overflow-hidden"
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

              <div className="relative flex items-start gap-4 p-5 pr-12 bg-background/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 min-w-[380px] max-w-[480px]">
                {/* Animated icon container */}
                <motion.div 
                  className="relative flex-shrink-0"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg"
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  {/* Header with badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-semibold text-foreground text-sm">
                      New Version Available
                    </h4>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Live
                    </motion.span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    {serviceName} was updated in {environment}
                    {branch && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        from <span className="font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{branch}</span>
                      </span>
                    )}
                    {commitMessage && (
                      <span className="block mt-1 text-muted-foreground/80 truncate">
                        "{commitMessage}"
                      </span>
                    )}
                  </p>

                  {/* Metadata row */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {deploymentTime}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="sm"
                        onClick={() => {
                          window.location.reload();
                          toast.dismiss(t);
                        }}
                        className="relative overflow-hidden h-8 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 group"
                      >
                        <motion.span
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </motion.div>
                          <RefreshCw className="w-3.5 h-3.5 group-hover:hidden" />
                          Refresh Now
                        </span>
                      </Button>
                    </motion.div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsDismissed(true);
                        toast.dismiss(t);
                      }}
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      Later
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => {
                    setIsDismissed(true);
                    toast.dismiss(t);
                  }}
                  className="absolute top-3 right-3 p-1.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ),
          {
            duration: Infinity,
            position: "bottom-right",
          }
        );
      }
    } catch (error) {
      console.error("Error checking for deployment:", error);
    }
  }, [hasShownInitial, lastSeenDeploymentId, isDismissed]);

  useEffect(() => {
    // Check immediately on mount
    checkForNewDeployment();

    // Poll every 30 seconds
    const interval = setInterval(checkForNewDeployment, 30000);

    return () => clearInterval(interval);
  }, [checkForNewDeployment]);

  return null;
}
