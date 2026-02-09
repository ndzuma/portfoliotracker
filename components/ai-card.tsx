"use client";

import { useState } from "react";
import { ArrowsClockwise, ArrowRight } from "@phosphor-icons/react";
import { V2AISummaryPopup } from "./ai-summary-popup";

interface V2AICardProps {
  label?: string;
  headline?: string | null;
  analysis: string | null;
  timestamp?: string;
  maxDisplayLength?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
}

export function V2AICard({
  label = "AI Market Intelligence",
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
            {label}
          </p>
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="group ml-auto flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/[0.06] text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title={headline ? "Refresh Analysis" : "Generate Analysis"}
            >
              <ArrowsClockwise
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : "group-hover:rotate-45 transition-transform duration-300"}`}
                weight="bold"
              />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {isRefreshing ? "Analyzing" : headline ? "Refresh" : "Generate"}
              </span>
            </button>
          )}
        </div>

        <div className="overflow-hidden">
          <div className="text-[13px] text-zinc-400 leading-relaxed whitespace-pre-line">
            {displayText}
          </div>
        </div>

        {/* Show More — pinned bottom-left */}
        {shouldShowMore && (
          <button
            onClick={() => setPopupOpen(true)}
            className="group mt-auto pt-4 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors"
            style={{ color: "var(--primary, #d4af37)" }}
          >
            Read Full Analysis
            <ArrowRight
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              weight="bold"
            />
          </button>
        )}
      </div>

      {/* AI Summary Popup */}
      <V2AISummaryPopup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        headline={headline}
        analysis={analysis}
        timestamp={timestamp}
      />
    </>
  );
}
