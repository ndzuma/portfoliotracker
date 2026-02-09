"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  ChartPieSlice,
  CurrencyCircleDollar,
  FileText,
  Newspaper,
  ArrowElbowDownLeft,
  ArrowUp,
  ArrowDown,
  X,
  CircleNotch,
  Compass,
} from "@phosphor-icons/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ───────────────────────────────────────────────────────
interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  category: string;
  external?: boolean;
}

interface CategoryResults {
  label: string;
  icon: React.ElementType;
  items: SearchResult[];
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ElementType; accentColor: string }
> = {
  portfolio: {
    label: "Portfolios",
    icon: ChartPieSlice,
    accentColor: "var(--primary)",
  },
  asset: {
    label: "Assets",
    icon: CurrencyCircleDollar,
    accentColor: "#22c55e",
  },
  document: { label: "Documents", icon: FileText, accentColor: "#3b82f6" },
  article: { label: "Articles", icon: Newspaper, accentColor: "#f59e0b" },
};

const ICON_MAP: Record<string, React.ElementType> = {
  ChartPieSlice,
  CurrencyCircleDollar,
  FileText,
  Newspaper,
};

// ─── Spring configs ──────────────────────────────────────────────
const backdropSpring = { duration: 0.18 };
const panelSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 38,
  mass: 0.7,
};
const itemStagger = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.6,
};

// ─── Debounce hook ───────────────────────────────────────────────
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── Command Palette ─────────────────────────────────────────────
export function CommandPalette({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: Id<"users">;
}) {
  const [mounted, setMounted] = useState(false);
  const [rawSearch, setRawSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedSearch = useDebouncedValue(rawSearch, 180);

  // Convex search query — only fires when term length >= 2
  const searchResults = useQuery(
    api.search.globalSearch,
    userId && debouncedSearch.trim().length >= 2
      ? { searchTerm: debouncedSearch, userId }
      : "skip"
  );

  const isSearching =
    rawSearch.trim().length >= 2 && searchResults === undefined;

  // Flatten results into navigable list with category grouping
  const { categories, flatItems } = useMemo(() => {
    if (!searchResults) return { categories: [], flatItems: [] };

    const cats: CategoryResults[] = [];
    const flat: (SearchResult & { globalIndex: number })[] = [];
    let globalIdx = 0;

    const categoryOrder = ["portfolio", "asset", "document", "article"] as const;
    const resultMap: Record<string, SearchResult[]> = {
      portfolio: searchResults.portfolios || [],
      asset: searchResults.assets || [],
      document: searchResults.documents || [],
      article: searchResults.articles || [],
    };

    for (const catKey of categoryOrder) {
      const items = resultMap[catKey];
      if (items.length > 0) {
        const meta = CATEGORY_META[catKey];
        cats.push({ label: meta.label, icon: meta.icon, items });
        for (const item of items) {
          flat.push({ ...item, globalIndex: globalIdx++ });
        }
      }
    }

    return { categories: cats, flatItems: flat };
  }, [searchResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatItems.length, debouncedSearch]);

  // Mount guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open, mounted]);

  // Focus input on open, reset search on close
  useEffect(() => {
    if (open) {
      // Slight delay to allow animation to start
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    } else {
      setRawSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Navigate to result
  const navigateTo = useCallback(
    (item: SearchResult) => {
      onOpenChange(false);
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [onOpenChange, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            navigateTo(flatItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [flatItems, selectedIndex, navigateTo, onOpenChange]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector(
      `[data-result-index="${selectedIndex}"]`
    );
    selected?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  if (!mounted) return null;

  const hasResults = flatItems.length > 0;
  const hasQuery = rawSearch.trim().length >= 2;
  const showEmpty = hasQuery && !isSearching && !hasResults;

  // Track global index for rendering
  let runningIndex = 0;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] md:pt-[18vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropSpring}
        >
          {/* Backdrop — dark glass */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropSpring}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative z-10 w-full max-w-[560px] bg-zinc-950 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: "min(520px, 60vh)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px -16px rgba(0,0,0,0.7), 0 0 80px -20px rgba(212,175,55,0.06)",
            }}
            initial={{ opacity: 0, scale: 0.94, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={panelSpring}
            onKeyDown={handleKeyDown}
          >
            {/* ─── Search Input Bar ─── */}
            <div
              className="flex items-center gap-3 px-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <MagnifyingGlass
                size={16}
                weight="regular"
                className="text-zinc-500 shrink-0"
              />
              <input
                ref={inputRef}
                type="text"
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                placeholder="Search portfolios, assets, documents..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder:text-zinc-600 py-3.5 font-mono"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {isSearching && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <CircleNotch
                    size={14}
                    weight="bold"
                    className="text-zinc-500"
                  />
                </motion.div>
              )}
              {rawSearch && (
                <button
                  onClick={() => setRawSearch("")}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-600 font-mono shrink-0">
                esc
              </kbd>
            </div>

            {/* ─── Results Area ─── */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
            >
              <AnimatePresence mode="wait">
                {/* Idle / hint state */}
                {!hasQuery && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="px-5 py-8 flex flex-col items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <Compass
                        size={18}
                        weight="duotone"
                        className="text-zinc-600"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 font-medium">
                        Search across your workspace
                      </p>
                      <p className="text-[11px] text-zinc-700 mt-1">
                        Portfolios, assets, documents, and articles
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Loading skeletons */}
                {hasQuery && isSearching && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="p-3"
                  >
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="px-3 py-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div
                            className="h-3 rounded bg-white/[0.06] animate-pulse"
                            style={{ width: `${55 + i * 15}%` }}
                          />
                          <div
                            className="h-2.5 rounded bg-white/[0.03] animate-pulse"
                            style={{ width: `${35 + i * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* No results */}
                {showEmpty && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-5 py-10 flex flex-col items-center gap-2"
                  >
                    <MagnifyingGlass
                      size={20}
                      weight="regular"
                      className="text-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">
                      No results for &ldquo;
                      <span className="text-zinc-400 font-mono">
                        {rawSearch.trim()}
                      </span>
                      &rdquo;
                    </p>
                    <p className="text-[11px] text-zinc-700">
                      Try a different search term
                    </p>
                  </motion.div>
                )}

                {/* Results */}
                {hasResults && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="py-1.5"
                  >
                    {categories.map((cat, catIdx) => {
                      const catMeta =
                        CATEGORY_META[cat.items[0]?.category] || CATEGORY_META.portfolio;
                      return (
                        <div key={cat.label}>
                          {/* Category header */}
                          <motion.div
                            className="flex items-center gap-2 px-4 pt-3 pb-1.5"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              ...itemStagger,
                              delay: catIdx * 0.04,
                            }}
                          >
                            <div
                              className="w-[3px] h-3 rounded-full"
                              style={{
                                background: catMeta.accentColor,
                              }}
                            />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                              {cat.label}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-700">
                              {cat.items.length}
                            </span>
                          </motion.div>

                          {/* Result rows */}
                          {cat.items.map((item) => {
                            const globalIndex = runningIndex++;
                            const isSelected = globalIndex === selectedIndex;
                            const IconComp =
                              ICON_MAP[item.icon] || ChartPieSlice;

                            return (
                              <motion.button
                                key={item.id}
                                data-result-index={globalIndex}
                                onClick={() => navigateTo(item)}
                                onMouseEnter={() =>
                                  setSelectedIndex(globalIndex)
                                }
                                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-75 cursor-pointer group ${
                                  isSelected
                                    ? "bg-white/[0.05]"
                                    : "hover:bg-white/[0.03]"
                                }`}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  ...itemStagger,
                                  delay: globalIndex * 0.025 + catIdx * 0.03,
                                }}
                              >
                                {/* Icon badge */}
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors duration-100"
                                  style={{
                                    background: isSelected
                                      ? `${catMeta.accentColor}14`
                                      : "rgba(255,255,255,0.03)",
                                    borderColor: isSelected
                                      ? `${catMeta.accentColor}30`
                                      : "rgba(255,255,255,0.04)",
                                  }}
                                >
                                  <IconComp
                                    size={13}
                                    weight={isSelected ? "duotone" : "regular"}
                                    style={{
                                      color: isSelected
                                        ? catMeta.accentColor
                                        : "rgba(255,255,255,0.35)",
                                    }}
                                  />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-medium truncate transition-colors duration-75 ${
                                      isSelected
                                        ? "text-white"
                                        : "text-zinc-300"
                                    }`}
                                  >
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-zinc-600 truncate mt-0.5">
                                    {item.subtitle}
                                  </div>
                                </div>

                                {/* Action hint */}
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="shrink-0 flex items-center gap-1"
                                  >
                                    {item.external && (
                                      <span className="text-[9px] text-zinc-600 font-mono mr-1">
                                        ext
                                      </span>
                                    )}
                                    <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white/[0.06] border border-white/[0.06]">
                                      <ArrowElbowDownLeft
                                        size={10}
                                        weight="bold"
                                        className="text-zinc-500"
                                      />
                                    </kbd>
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Footer Bar ─── */}
            <div
              className="hidden md:flex items-center justify-between px-4 py-2 border-t text-[10px] text-zinc-600"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    <ArrowUp size={8} weight="bold" className="text-zinc-500" />
                  </kbd>
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    <ArrowDown
                      size={8}
                      weight="bold"
                      className="text-zinc-500"
                    />
                  </kbd>
                  <span className="ml-0.5">navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    <ArrowElbowDownLeft
                      size={8}
                      weight="bold"
                      className="text-zinc-500"
                    />
                  </kbd>
                  <span className="ml-0.5">open</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono">
                    esc
                  </kbd>
                  <span className="ml-0.5">close</span>
                </span>
              </div>
              <span className="font-mono text-zinc-700">
                {hasResults
                  ? `${flatItems.length} result${flatItems.length !== 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Global Keyboard Hook ────────────────────────────────────────
// Use this in header.tsx or layout to register ⌘K / Ctrl+K globally
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
