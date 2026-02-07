"use client";

import { useState } from "react";
import { V2AISummaryPopup } from "./v2-ai-summary-popup";

interface V2AICardProps {
  headline?: string;
  analysis: string;
  timestamp?: string;
  maxDisplayLength?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
}

export function V2AICard({
  headline,
  analysis,
  timestamp,
  maxDisplayLength = 140,
  onRefresh,
  isRefreshing = false,
  showRefresh = false,
}: V2AICardProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Use headline if available, otherwise truncate analysis
  const displayText =
    headline ||
    (analysis.length > maxDisplayLength
      ? analysis.slice(0, maxDisplayLength) + "..."
      : analysis);

  // Determine if we should show "Show More" button
  const shouldShowMore = headline ? true : analysis.length > maxDisplayLength;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
            AI Market Intelligence
          </p>
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="group relative w-4 h-4 rounded-md hover:bg-zinc-800/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center ml-2"
              title={headline ? "Refresh Analysis" : "Generate Analysis"}
            >
              {isRefreshing ? (
                <div className="w-2.5 h-2.5 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="h-2.5 w-2.5 text-zinc-500 group-hover:text-emerald-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="relative flex-1">
          <div className="overflow-hidden">
            <p className="text-[13px] text-zinc-400 leading-relaxed whitespace-pre-line">
              {displayText}
            </p>
          </div>

          {/* Show More button */}
          {shouldShowMore && (
            <button
              onClick={() => setPopupOpen(true)}
              className="mt-3 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Show More
            </button>
          )}
        </div>
      </div>

      {/* AI Summary Popup */}
      <V2AISummaryPopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        headline={headline || displayText}
        analysis={analysis}
        timestamp={timestamp}
      />
    </>
  );
}
