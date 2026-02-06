"use client";

import { GoalTrackerCard, DocumentStorageCard, ArticleSaverCard } from "@/app/(webapp)/portfolio/[id]/components/bunker";
import { Target, FileText, BookOpen } from "lucide-react";

interface V2VaultProps {
  portfolioId: string;
  portfolioValue: number;
  annualReturn: number;
  userId?: string;
}

export function V2Vault({ portfolioId, portfolioValue, annualReturn, userId }: V2VaultProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Section header */}
      <div>
        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-1">Portfolio Vault</p>
        <p className="text-sm text-zinc-600">Goals, saved articles, and documents for this portfolio.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Goal Tracker */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
            <Target className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Goal Tracker</h3>
          </div>
          <div className="p-5">
            <GoalTrackerCard
              portfolioId={portfolioId}
              portfolioValue={portfolioValue}
              annualReturn={annualReturn}
              monthlyContribution={0}
            />
          </div>
        </div>

        {/* Articles */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Saved Articles</h3>
          </div>
          <div className="p-5">
            <ArticleSaverCard userId={userId} portfolioId={portfolioId} />
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
            <FileText className="h-3.5 w-3.5 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Documents</h3>
          </div>
          <div className="p-5">
            <DocumentStorageCard userId={userId} portfolioId={portfolioId} />
          </div>
        </div>
      </div>
    </div>
  );
}
