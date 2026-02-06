"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface V2AICardProps {
  analysis: string;
  maxHeight?: number;
}

export function V2AICard({ analysis, maxHeight = 140 }: V2AICardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  }, [analysis, maxHeight]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
          AI Market Intelligence
        </p>
      </div>

      <div className="relative flex-1">
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: isExpanded ? "none" : `${maxHeight}px` }}
        >
          <p className="text-[13px] text-zinc-400 leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>

        {/* Fade overlay when collapsed */}
        {isOverflowing && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
        )}

        {/* Expand/collapse button */}
        {isOverflowing && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-0 right-0 flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors z-10"
          >
            {isExpanded ? "Less" : "More"}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
