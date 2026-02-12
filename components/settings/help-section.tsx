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
import { useTranslations } from "next-intl";

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
        title: "helpDashboard",
        description: "helpDashboardDesc",
      },
      {
        icon: ChartPieSlice,
        title: "helpPortfolioView",
        description: "helpPortfolioViewDesc",
      },
      {
        icon: Newspaper,
        title: "helpNewsFeed",
        description: "helpNewsFeedDesc",
      },
      {
        icon: GearSix,
        title: "helpSettings",
        description: "helpSettingsDesc",
      },
      {
        icon: Binoculars,
        title: "helpWatchlist",
        description: "helpWatchlistDesc",
        flag: "watchlist",
      },
      {
        icon: CalendarDots,
        title: "helpEarningsCalendar",
        description: "helpEarningsCalendarDesc",
        flag: "earnings",
      },
      {
        icon: Flask,
        title: "helpResearchHub",
        description: "helpResearchHubDesc",
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
        title: "helpAddAsset",
        description: "helpAddAssetDesc",
      },
      {
        icon: PencilSimple,
        title: "helpEditAsset",
        description: "helpEditAssetDesc",
      },
      {
        icon: Receipt,
        title: "helpRecordTransaction",
        description: "helpRecordTransactionDesc",
      },
      {
        icon: ChartPieSlice,
        title: "helpCreatePortfolio",
        description: "helpCreatePortfolioDesc",
      },
      {
        icon: PencilSimple,
        title: "helpEditPortfolio",
        description: "helpEditPortfolioDesc",
      },
      {
        icon: Target,
        title: "helpSetGoals",
        description: "helpSetGoalsDesc",
      },
      {
        icon: FileText,
        title: "helpVaultDocuments",
        description: "helpVaultDocumentsDesc",
      },
      {
        icon: BookOpen,
        title: "helpVaultArticles",
        description: "helpVaultArticlesDesc",
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
        title: "helpCmdK",
        description: "helpCmdKDesc",
      },
      {
        icon: X,
        title: "helpEscape",
        description: "helpEscapeDesc",
      },
      {
        icon: ArrowUp,
        title: "helpArrowKeys",
        description: "helpArrowKeysDesc",
      },
      {
        icon: ArrowElbowDownLeft,
        title: "helpEnter",
        description: "helpEnterDesc",
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
        title: "helpChangeCurrency",
        description: "helpChangeCurrencyDesc",
      },
      {
        icon: ArrowsClockwise,
        title: "helpFxSync",
        description: "helpFxSyncDesc",
      },
      {
        icon: Export,
        title: "helpExportData",
        description: "helpExportDataDesc",
      },
      {
        icon: Compass,
        title: "helpMarketRegion",
        description: "helpMarketRegionDesc",
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
        title: "helpAiSummary",
        description: "helpAiSummaryDesc",
        flag: "ai-summaries",
      },
      {
        icon: Lightning,
        title: "helpMarketPulse",
        description: "helpMarketPulseDesc",
        flag: "notifications",
      },
      {
        icon: Brain,
        title: "helpAiSchedule",
        description: "helpAiScheduleDesc",
        flag: "ai-summaries",
      },
      {
        icon: HardDrives,
        title: "helpByoai",
        description: "helpByoaiDesc",
        flag: "byoai",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELP SECTION — Searchable feature/action catalog, flag-aware
   ═══════════════════════════════════════════════════════════════════════════ */

export function HelpSection() {
  const t = useTranslations("settings");
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
      label: t(cat.id === "navigation" ? "helpNavigation" : 
                cat.id === "portfolio-actions" ? "helpPortfolioActions" :
                cat.id === "keyboard-shortcuts" ? "helpKeyboardShortcuts" :
                cat.id === "data-actions" ? "helpDataSettings" :
                cat.id === "ai-features" ? "helpAiFeatures" : cat.label),
      items: cat.items.filter((item) => {
        if (!item.flag) return true; // no flag — always show
        const val = flagValues[item.flag];
        if (val === false) return false; // explicitly disabled
        return true; // undefined (loading) or true — show
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [flagValues, t]);

  // Step 2: Apply search query on top of the flag-filtered set
  const visibleCategories = useMemo(() => {
    if (!query.trim()) return flagFilteredCategories;

    const q = query.toLowerCase();
    return flagFilteredCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            t(item.title).toLowerCase().includes(q) ||
            t(item.description).toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, flagFilteredCategories, t]);

  const totalVisible = flagFilteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );
  const totalResults = visibleCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );

  return (
    <Section title={t("helpFeatures")} description={t("itemsCount", { count: totalVisible })}>
      {/* ── Search input ── */}
      <div className="relative mb-4">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchFeaturesPlaceholder")}
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
          {t("resultsForQuery", { count: totalResults, query })}
        </p>
      )}

      {/* ── Category groups ── */}
      {visibleCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Question className="h-8 w-8 text-zinc-800 mb-3" />
          <p className="text-sm text-zinc-600">{t("noMatchingFeatures")}</p>
          <p className="text-xs text-zinc-700 mt-1">
            {t("tryDifferentSearchTerm")}
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
                          {t(item.title)}
                        </p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
                          {t(item.description)}
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
