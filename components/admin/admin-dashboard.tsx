"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Flag } from "lucide-react";

function AdminCard({
  title,
  description,
  href,
  icon: Icon,
  count,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  count?: number;
}) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-6 hover:border-white/[0.12] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04]">
              <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          {count !== undefined && (
            <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-xs font-medium text-zinc-300">
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Manage</span>
          <span className="group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AdminDashboard() {
  const flags = useQuery(api.flags.getAllFlags);
  const flagCount = flags?.length ?? 0;
  const enabledFlags = flags?.filter((flag) => flag.enabled).length ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-1">
          Administration
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Feature Flags
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage feature toggles and rollouts across environments
        </p>
      </div>

      {/* Feature Flags Card */}
      <div className="mb-8">
        <AdminCard
          title="Feature Flags"
          description="Manage feature toggles and rollouts across environments"
          href="/admin/flags"
          icon={Flag}
          count={flagCount}
        />
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">
          Flag Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
            <div className="text-2xl font-bold text-white">{flagCount}</div>
            <div className="text-xs text-zinc-400">Total Flags</div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
            <div className="text-2xl font-bold text-green-400">{enabledFlags}</div>
            <div className="text-xs text-zinc-400">Enabled</div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-zinc-950/60 p-4">
            <div className="text-2xl font-bold text-zinc-400">{flagCount - enabledFlags}</div>
            <div className="text-xs text-zinc-400">Disabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
