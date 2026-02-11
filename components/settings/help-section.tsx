"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlass,
  House,
  ChartPieSlice,
  Newspaper,
  GearSix,
  PlusCircle,
  PencilSimple,
  Receipt,
  Target,
  ArrowsClockwise,
  CurrencyCircleDollar,
  Export,
  Sparkle,
  Lightning,
  Flask,
  Binoculars,
  CalendarDots,
  Command,
  ArrowElbowDownLeft,
  ArrowUp,
  X,
  FileText,
  BookOpen,
  Brain,
  HardDrives,
  Compass,
  Question,
} from "@phosphor-icons/react";
import { Section } from "./settings-primitives";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

/* ─── Category definitions with accent colors ─── */
interface HelpItem {
  icon: React.ElementType;
  title: string;
  description: string;
  /** Optional feature flag key — item is hidden when flag is false */
  flag?: string;
}

interface HelpCategory {
  id: string;
  label: string;
  accentColor: string;
  items: HelpItem[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "navigation",
    label: "Navigation",
    accentColor: "var(--primary)",
    items: [
      {
        icon: House,
        title: "Dashboard",
        description: "Overview of all portfolios, net worth, and market news",
      },
      {
        icon: ChartPieSlice,
        title: "Portfolio View",
        description:
          "Detailed holdings, performance charts, analytics, and goals for a single portfolio",
      },
      {
        icon: Newspaper,
        title: "News Feed",
        description: "AI-powered market news summaries and financial headlines",
      },
      {
        icon: GearSix,
        title: "Settings",
        description:
          "Profile, currency, AI config, notifications, and data export",
      },
      {
        icon: Binoculars,
        title: "Watchlist",
        description: "Track stocks and assets you're interested in",
        flag: "watchlist",
      },
      {
        icon: CalendarDots,
        title: "Earnings Calendar",
        description: "Upcoming earnings announcements for your holdings",
        flag: "earnings",
      },
      {
        icon: Flask,
        title: "Research Hub",
        description: "Asset screening, sector analysis, and custom reports",
        flag: "research",
      },
    ],
  },
  {
    id: "portfolio-actions",
    label: "Portfolio Actions",
    accentColor: "#22c55e",
    items: [
      {
        icon: PlusCircle,
        title: "Add Asset",
        description:
          "Add stocks, crypto, real estate, bonds, cash, or commodities to a portfolio with currency selection",
      },
      {
        icon: PencilSimple,
        title: "Edit Asset",
        description:
          "Update asset name, symbol, currency, current price, and notes",
      },
      {
        icon: Receipt,
        title: "Record Transaction",
        description:
          "Log buy, sell, or dividend transactions with date, price, quantity, and fees",
      },
      {
        icon: ChartPieSlice,
        title: "Create Portfolio",
        description:
          "Create a new portfolio with name, description, risk tolerance, and time horizon",
      },
      {
        icon: PencilSimple,
        title: "Edit Portfolio",
        description:
          "Update portfolio name, description, and configuration settings",
      },
      {
        icon: Target,
        title: "Set Goals",
        description:
          "Define portfolio value targets, return goals, and custom milestones with deadlines",
      },
      {
        icon: FileText,
        title: "Vault — Documents",
        description:
          "Upload and manage strategy documents, account statements, and research files",
      },
      {
        icon: BookOpen,
        title: "Vault — Articles",
        description:
          "Save and organize links to articles, research, and analysis",
      },
    ],
  },
  {
    id: "keyboard-shortcuts",
    label: "Keyboard Shortcuts",
    accentColor: "#a78bfa",
    items: [
      {
        icon: Command,
        title: "⌘K / Ctrl+K",
        description: "Open the command palette for quick search and navigation",
      },
      {
        icon: X,
        title: "Escape",
        description: "Close any open dialog, modal, or bottom sheet",
      },
      {
        icon: ArrowUp,
        title: "↑ / ↓ Arrow Keys",
        description: "Navigate through search results in the command palette",
      },
      {
        icon: ArrowElbowDownLeft,
        title: "Enter / Return",
        description: "Select the highlighted item in the command palette",
      },
    ],
  },
  {
    id: "data-actions",
    label: "Data & Settings",
    accentColor: "#3b82f6",
    items: [
      {
        icon: CurrencyCircleDollar,
        title: "Change Base Currency",
        description:
          "Switch your display currency — all values are converted using live FX rates from 160+ currencies",
      },
      {
        icon: ArrowsClockwise,
        title: "FX Rate Sync",
        description:
          "Exchange rates are updated automatically every 24 hours from ExchangeRatesAPI (EUR-based)",
      },
      {
        icon: Export,
        title: "Export Data",
        description:
          "Download all your portfolios, assets, and transactions as a JSON file",
      },
      {
        icon: Compass,
        title: "Market Region",
        description:
          "Set your preferred market region for benchmarks and data sources",
      },
    ],
  },
  {
    id: "ai-features",
    label: "AI Features",
    accentColor: "#f59e0b",
    items: [
      {
        icon: Sparkle,
        title: "Portfolio AI Summary",
        description:
          "Generate on-demand AI analysis with performance insights, risk assessment, and recommendations",
        flag: "ai-summaries",
      },
      {
        icon: Lightning,
        title: "Market Pulse",
        description:
          "Subscribe to AI-generated market briefs via email, Discord, or Telegram",
        flag: "notifications",
      },
      {
        icon: Brain,
        title: "AI Summary Schedule",
        description:
          "Configure automatic portfolio analysis frequency: 12h, daily, weekly, monthly, or manual",
        flag: "ai-summaries",
      },
      {
        icon: HardDrives,
        title: "BYOAI — Bring Your Own AI",
        description:
          "Connect OpenRouter or self-hosted models instead of the default hosted AI provider",
        flag: "byoai",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELP SECTION — Searchable feature/action catalog, flag-aware
   ═══════════════════════════════════════════════════════════════════════════ */

export function HelpSection() {
  const [query, setQuery] = useState("");

  // Resolve every feature flag referenced by help items.
  // Hooks must be called unconditionally so we call them for every key
  // in a fixed order derived from the static category data.
  const watchlist = useFeatureFlag("watchlist");
  const earnings = useFeatureFlag("earnings");
  const research = useFeatureFlag("research");
  const aiSummaries = useFeatureFlag("ai-summaries");
  const notifications = useFeatureFlag("notifications");
  const byoai = useFeatureFlag("byoai");

  const flagValues: Record<string, boolean | undefined> = useMemo(
    () => ({
      watchlist,
      earnings,
      research,
      "ai-summaries": aiSummaries,
      notifications,
      byoai,
    }),
    [watchlist, earnings, research, aiSummaries, notifications, byoai],
  );

  // Step 1: Strip out items whose flag is explicitly false.
  // Items with no flag, or flag still loading (undefined), remain visible.
  const flagFilteredCategories = useMemo(() => {
    return HELP_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (!item.flag) return true; // no flag — always show
        const val = flagValues[item.flag];
        if (val === false) return false; // explicitly disabled
        return true; // undefined (loading) or true — show
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [flagValues]);

  // Step 2: Apply search query on top of the flag-filtered set
  const visibleCategories = useMemo(() => {
    if (!query.trim()) return flagFilteredCategories;

    const q = query.toLowerCase();
    return flagFilteredCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, flagFilteredCategories]);

  const totalVisible = flagFilteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );
  const totalResults = visibleCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  return (
    <Section title="Help & Features" description={`${totalVisible} items`}>
      {/* ── Search input ── */}
      <div className="relative mb-4">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search features, actions, shortcuts…"
          className="
            w-full bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs font-mono
            pl-9 pr-4 py-2.5 rounded-lg
            hover:border-white/[0.12] transition-colors
            focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/10
            placeholder:text-zinc-700
          "
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Search result count ── */}
      {query && (
        <p className="text-[10px] text-zinc-700 mb-3 font-mono">
          {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;
          {query}&rdquo;
        </p>
      )}

      {/* ── Category groups ── */}
      {visibleCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Question className="h-8 w-8 text-zinc-800 mb-3" />
          <p className="text-sm text-zinc-600">No matching features found</p>
          <p className="text-xs text-zinc-700 mt-1">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {visibleCategories.map((cat) => (
            <div key={cat.id}>
              {/* Category header */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-1 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.accentColor }}
                />
                <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-[0.15em]">
                  {cat.label}
                </span>
                <span className="text-[10px] text-zinc-700 font-mono">
                  ({cat.items.length})
                </span>
              </div>

              {/* Items */}
              <div className="rounded-lg border border-white/[0.04] overflow-hidden">
                {cat.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${cat.id}-${i}`}
                      className={`
                        flex items-start gap-3 px-3.5 py-2.5 transition-colors hover:bg-white/[0.02]
                        ${i < cat.items.length - 1 ? "border-b border-white/[0.03]" : ""}
                      `}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${cat.accentColor}10`,
                        }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: cat.accentColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
