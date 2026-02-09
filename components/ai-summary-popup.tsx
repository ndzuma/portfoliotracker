"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkle } from "@phosphor-icons/react";

interface V2AISummaryPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headline: string;
  analysis: string;
  timestamp?: string;
}

export function V2AISummaryPopup({
  open,
  onOpenChange,
  headline,
  analysis,
  timestamp,
}: V2AISummaryPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Mobile Bottom Sheet */}
      {isMobile ? (
        <div className="w-full max-h-[85vh] bg-zinc-950 border-t border-white/[0.08] rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
          {/* Handle Bar */}
          <div className="w-full flex justify-center py-3 border-b border-white/[0.06]">
            <div className="w-8 h-1 bg-zinc-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkle className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">
                AI Market Intelligence
              </h2>
              {timestamp && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Updated {formatTimestamp(timestamp)}
                </p>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-20">
            {/* Headline Section */}
            <div className="py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Executive Summary
                </p>
              </div>
              <div className="text-white text-base leading-relaxed font-medium">
                {headline}
              </div>
            </div>

            {/* Analysis Section */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Detailed Analysis
                </p>
              </div>
              <div className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-line">
                {analysis}
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/[0.06] mt-6">
              <p className="text-xs text-zinc-500 leading-relaxed">
                <span className="font-semibold text-zinc-400">
                  AI Risk Warning:
                </span>{" "}
                This AI-generated analysis is for informational purposes only
                and should not be considered financial advice. Always consult
                with a qualified financial advisor before making investment
                decisions.
              </p>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-6 border-t border-white/[0.06] bg-zinc-950">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Close
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Sparkle className="h-3 w-3" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Modal */
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-zinc-950 border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">
                  AI Market Intelligence
                </h2>
                {timestamp && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Updated {formatTimestamp(timestamp)}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 max-h-[65vh] overflow-y-auto pb-6">
              {/* Headline Section */}
              <div className="py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                    Executive Summary
                  </p>
                </div>
                <div className="text-white text-base leading-relaxed font-medium">
                  {headline}
                </div>
              </div>

              {/* Analysis Section */}
              <div className="py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                    Detailed Analysis
                  </p>
                </div>
                <div className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-line">
                  {analysis}
                </div>
              </div>

              {/* Risk Warning */}
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/[0.06] mt-6">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="font-semibold text-zinc-400">
                    AI Risk Warning:
                  </span>{" "}
                  This AI-generated analysis is for informational purposes only
                  and should not be considered financial advice. Always consult
                  with a qualified financial advisor before making investment
                  decisions.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/[0.06]">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Close
              </button>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Sparkle className="h-3 w-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
