"use client";

import { Sparkles } from "lucide-react";

interface V2AICardProps {
  analysis: string;
}

export function V2AICard({ analysis }: V2AICardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(34,197,94,0.06),transparent_60%)]" />
      <div className="relative flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-widest">
            AI Market Intelligence
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <p className="text-zinc-400 text-sm leading-relaxed">
            {analysis}
          </p>
        </div>
      </div>
    </div>
  );
}
