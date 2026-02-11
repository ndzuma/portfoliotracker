"use client";

import { notFound } from "next/navigation";
import { Flask, MagnifyingGlass, BookOpen } from "@phosphor-icons/react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export default function ResearchPage() {
  const enabled = useFeatureFlag("research");

  // Still loading — render nothing
  if (enabled === undefined) return null;

  // Flag disabled — trigger Next.js not-found boundary
  if (enabled === false) notFound();

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Research</h1>
            <p className="text-zinc-500">
              Deep-dive into assets, sectors, and market trends
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Flask className="h-6 w-6 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Research Hub — Coming Soon
            </h2>
            <p className="text-sm text-zinc-600 max-w-md leading-relaxed mb-6">
              Analyze assets, compare sectors, and surface insights from your
              portfolio data. This feature is currently in development.
            </p>
            <div className="flex items-center gap-6 text-zinc-700">
              <div className="flex items-center gap-2 text-xs">
                <MagnifyingGlass className="h-3.5 w-3.5" />
                <span>Asset Screener</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Sector Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flask className="h-3.5 w-3.5" />
                <span>Custom Reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
