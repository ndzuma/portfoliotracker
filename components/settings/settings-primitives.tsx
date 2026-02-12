"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useCurrency } from "@/hooks/useCurrency";

// ─── StatusDot — live / amber / off with optional pulse ─────────────────────

type DotStatus = "live" | "amber" | "off";

const dotColors: Record<DotStatus, string> = {
  live: "bg-emerald-500",
  amber: "bg-amber-500",
  off: "bg-zinc-600",
};

export function StatusDot({
  status = "off",
  pulse = false,
  size = "sm",
}: {
  status?: DotStatus;
  pulse?: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "w-2 h-2" : "w-1.5 h-1.5";
  return (
    <span className="relative inline-flex">
      {pulse && status === "live" && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${dotColors[status]} opacity-40 animate-ping`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ${dim} ${dotColors[status]}`}
      />
    </span>
  );
}

// ─── Section — card wrapper with header + status dot ────────────────────────

export function Section({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description?: string;
  status?: DotStatus;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-xl border border-white/[0.06] bg-zinc-950/60"
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01] rounded-t-xl">
        {status && <StatusDot status={status} pulse={status === "live"} />}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && (
          <>
            <div className="w-px h-3 bg-white/[0.06]" />
            <span className="text-[10px] text-zinc-600 font-medium">
              {description}
            </span>
          </>
        )}
      </div>

      {/* Section body */}
      <div className="p-5 flex flex-col gap-0 rounded-b-xl">{children}</div>
    </motion.div>
  );
}

// ─── SettingRow — label + description + control ─────────────────────────────

export function SettingRow({
  label,
  description,
  mono = false,
  children,
}: {
  label: string;
  description?: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 border-b border-white/[0.03] last:border-b-0">
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm text-zinc-300 ${mono ? "font-mono text-xs" : ""}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── SettingsToggle — armed/disarmed switch ─────────────────────────────────

export function SettingsToggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative w-10 h-[22px] rounded-full transition-all duration-200 outline-none
        focus-visible:ring-2 focus-visible:ring-white/20
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-emerald-500/80" : "bg-white/[0.08]"}
      `}
    >
      <motion.div
        className={`
          absolute top-[3px] w-4 h-4 rounded-full transition-colors
          ${checked ? "bg-white" : "bg-zinc-500"}
        `}
        animate={{ left: checked ? 22 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <span className="sr-only">{checked ? "Armed" : "Disarmed"}</span>
    </button>
  );
}

// ─── StatusBadge — small inline badge ───────────────────────────────────────

export function StatusBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const colors = {
    default: "bg-white/[0.06] text-zinc-400",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    destructive: "bg-red-500/10 text-red-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

// ─── PulseStrip — ticker-style telemetry header ─────────────────────────────

interface PulseItem {
  label: string;
  value: string;
  status: DotStatus;
}

function PulseCell({ item, isLast }: { item: PulseItem; isLast: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-2.5 shrink-0 ${
        !isLast ? "border-r" : ""
      }`}
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <StatusDot
        status={item.status}
        pulse={item.status === "live"}
        size="sm"
      />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
          {item.label}
        </span>
        <span className="text-xs text-zinc-300 font-semibold tabular-nums">
          {item.value}
        </span>
      </div>
    </div>
  );
}

/** Friendly label for AI summary frequency values */
function formatFrequency(freq: string | undefined): string {
  switch (freq) {
    case "12h":
      return "12h";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "manual":
      return "Manual";
    default:
      return "—";
  }
}

export function PulseStrip() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );
  const fxRates = useQuery(api.marketData.getFxRates);
  const portfolios = useQuery(
    api.portfolios.getUserPorfolios,
    userId ? { userId } : "skip",
  );
  const { currency } = useCurrency();

  // FX sync age
  const fxUpdated = fxRates?.updatedAt
    ? new Date(fxRates.updatedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const aiProvider = userPreferences?.aiProvider || "default";
  const aiProviderLabel =
    aiProvider === "openrouter"
      ? "OpenRouter"
      : aiProvider === "self-hosted"
        ? "Self-Hosted"
        : "Hosted";

  const marketPulseActive = userPreferences?.marketPulseEnabled ?? false;
  const marketPulseChannels = (userPreferences as any)?.marketPulseChannels as
    | string[]
    | undefined;
  const marketPulseLabel = marketPulseActive
    ? marketPulseChannels && marketPulseChannels.length > 0
      ? marketPulseChannels
          .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1))
          .join(", ")
      : userPreferences?.marketPulseChannel
        ? userPreferences.marketPulseChannel.charAt(0).toUpperCase() +
          userPreferences.marketPulseChannel.slice(1)
        : "On"
    : "Off";

  const earningsOn = userPreferences?.earningsReminders ?? false;

  const aiSummaryFreq = formatFrequency(userPreferences?.aiSummaryFrequency);

  const portfolioCount = portfolios?.length ?? 0;

  const items: PulseItem[] = [
    {
      label: "Portfolios",
      value: String(portfolioCount),
      status: portfolioCount > 0 ? "live" : "off",
    },
    {
      label: "Currency",
      value: currency,
      status: "live",
    },
    {
      label: "FX Sync",
      value: fxUpdated,
      status: fxRates ? "live" : "off",
    },
    {
      label: "AI Provider",
      value: aiProviderLabel,
      status: aiProvider !== "default" ? "amber" : "live",
    },
    {
      label: "AI Summary",
      value: aiSummaryFreq,
      status:
        aiSummaryFreq !== "—" && aiSummaryFreq !== "Manual" ? "live" : "off",
    },
    {
      label: "Earnings",
      value: earningsOn ? "On" : "Off",
      status: earningsOn ? "live" : "off",
    },
    {
      label: "Market Pulse",
      value: marketPulseLabel,
      status: marketPulseActive ? "live" : "off",
    },
  ];

  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1600px] mx-auto flex items-center overflow-x-auto scrollbar-hide">
        {items.map((item, i) => (
          <PulseCell
            key={item.label}
            item={item}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Divider — visual separator between sections ────────────────────────────

export function SettingsDivider() {
  return <div className="h-px bg-white/[0.04] my-1" />;
}
