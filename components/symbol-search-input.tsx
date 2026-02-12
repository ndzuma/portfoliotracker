"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlass,
  CircleNotch,
  TrendUp,
  Coins,
  Bank,
  Buildings,
  Diamond,
  Money,
  Globe,
  Tag,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useSymbolSearch, type SymbolResult } from "@/hooks/useSymbolSearch";

// ─── Category badge config ───────────────────────────────────────
const CATEGORY_BADGE: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof TrendUp }
> = {
  stock: {
    label: "Stock",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: TrendUp,
  },
  crypto: {
    label: "Crypto",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: Coins,
  },
  bond: {
    label: "Bond",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    icon: Bank,
  },
  commodity: {
    label: "Commodity",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    icon: Diamond,
  },
  reit: {
    label: "REIT",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    icon: Buildings,
  },
  etf: {
    label: "ETF",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    icon: TrendUp,
  },
  currency: {
    label: "Currency",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: Money,
  },
  index: {
    label: "Index",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    icon: Globe,
  },
};

const FALLBACK_BADGE = {
  label: "Other",
  color: "text-zinc-400",
  bg: "bg-zinc-500/10",
  icon: Tag,
};

// ─── Props ───────────────────────────────────────────────────────
export interface SymbolSearchSelection {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  country: string;
  type: string;
  category: string;
}

interface SymbolSearchInputProps {
  /** Current text value of the input */
  value: string;
  /** Called on every keystroke — parent controls the input value */
  onChange: (value: string) => void;
  /** Called when a result is selected from the dropdown */
  onSelect: (result: SymbolSearchSelection) => void;
  /** The asset type for category-filtered search (stock, crypto, bond, etc.) */
  assetType?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Whether to autofocus the input */
  autoFocus?: boolean;
  /** Additional className for the input */
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════
   SYMBOL SEARCH INPUT
   Portal-based autocomplete that queries the Market Data API.
   Follows the PortalCurrencyPicker architecture for consistent
   positioning and overflow escape.
   ═══════════════════════════════════════════════════════════════════ */

export function SymbolSearchInput({
  value,
  onChange,
  onSelect,
  assetType,
  placeholder = "Search assets…",
  autoFocus = false,
  className = "",
}: SymbolSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  // Search hook — debounced, cancellable
  const { results, loading, total } = useSymbolSearch(value, assetType, 8);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open dropdown when we have results, input is focused, and query is long enough
  useEffect(() => {
    if (results.length > 0 && value.trim().length >= 2 && isFocused) {
      setOpen(true);
      setSelectedIdx(-1);
    } else if (value.trim().length < 2) {
      setOpen(false);
    }
  }, [results, value, isFocused]);

  // ─── Position the dropdown beneath the input ────────────────
  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 360),
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open, updatePosition]);

  // ─── Close on outside click ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ─── Handle selection — autofill + blur ─────────────────────
  const handleSelect = useCallback(
    (result: SymbolResult) => {
      onSelect({
        symbol: result.symbol,
        name: result.name,
        currency: result.currency,
        exchange: result.exchange,
        country: result.country,
        type: result.type,
        category: result.category,
      });
      setOpen(false);
      setSelectedIdx(-1);
      // Blur the input so focus leaves the search field
      inputRef.current?.blur();
    },
    [onSelect],
  );

  // ─── Keyboard navigation ───────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = selectedIdx < results.length - 1 ? selectedIdx + 1 : 0;
          setSelectedIdx(next);
          itemRefs.current.get(next)?.scrollIntoView({ block: "nearest" });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = selectedIdx > 0 ? selectedIdx - 1 : results.length - 1;
          setSelectedIdx(prev);
          itemRefs.current.get(prev)?.scrollIntoView({ block: "nearest" });
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (selectedIdx >= 0 && selectedIdx < results.length) {
            handleSelect(results[selectedIdx]);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setOpen(false);
          setSelectedIdx(-1);
          inputRef.current?.blur();
          break;
        }
      }
    },
    [open, results, selectedIdx, handleSelect],
  );

  // ─── Highlight matching text ────────────────────────────────
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-white font-semibold">
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  // ─── Dropdown portal ────────────────────────────────────────
  const dropdown =
    mounted && open
      ? createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              className="fixed rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                zIndex: 99999,
              }}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {/* Results header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.15em]">
                  {loading ? "Searching…" : `${total.toLocaleString()} results`}
                </span>
                {loading && (
                  <CircleNotch className="h-3 w-3 text-zinc-600 animate-spin" />
                )}
              </div>

              {/* Results list */}
              <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-hide">
                {results.length === 0 && !loading ? (
                  <div className="px-4 py-6 text-center">
                    <MagnifyingGlass className="h-5 w-5 text-zinc-700 mx-auto mb-2" />
                    <p className="text-[11px] text-zinc-600">
                      No matches found
                    </p>
                  </div>
                ) : (
                  results.map((result, i) => {
                    const badge =
                      CATEGORY_BADGE[result.category] || FALLBACK_BADGE;
                    const BadgeIcon = badge.icon;
                    const isSelected = i === selectedIdx;

                    return (
                      <motion.button
                        ref={(el) => {
                          if (el) {
                            itemRefs.current.set(i, el);
                          } else {
                            itemRefs.current.delete(i);
                          }
                        }}
                        key={`${result.symbol}-${result.exchange}-${result.mic_code}`}
                        type="button"
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIdx(i)}
                        className={`
                          flex items-start gap-3 w-full px-3 py-2.5 text-left transition-colors
                          ${isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}
                        `}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.12,
                          delay: i * 0.025,
                          ease: "easeOut",
                        }}
                      >
                        {/* Category icon */}
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${badge.bg}`}
                        >
                          <BadgeIcon
                            className={`h-3.5 w-3.5 ${badge.color}`}
                            weight="fill"
                          />
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Symbol + Name */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold tracking-wide shrink-0 text-zinc-300">
                              {highlightMatch(result.symbol, value)}
                            </span>
                            <span className="text-xs truncate text-zinc-500">
                              {highlightMatch(result.name, value)}
                            </span>
                          </div>

                          {/* Row 2: Exchange · Country · Type */}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {result.exchange && (
                              <span className="text-[10px] text-zinc-600 font-medium">
                                {result.exchange}
                              </span>
                            )}
                            {result.exchange && result.country && (
                              <span className="text-zinc-800 text-[10px]">
                                ·
                              </span>
                            )}
                            {result.country && (
                              <span className="text-[10px] text-zinc-600">
                                {result.country}
                              </span>
                            )}
                            {result.type && result.type !== "Common Stock" && (
                              <>
                                <span className="text-zinc-800 text-[10px]">
                                  ·
                                </span>
                                <span className="text-[10px] text-zinc-600 italic">
                                  {result.type}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Currency tag */}
                        <span className="text-[10px] text-zinc-700 font-mono font-medium bg-zinc-900 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                          {result.currency}
                        </span>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer hint */}
              {results.length > 0 && (
                <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center gap-3">
                  <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
                    <kbd className="inline-flex items-center justify-center w-4 h-3.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-600 font-mono mr-0.5">
                      ↑
                    </kbd>
                    <kbd className="inline-flex items-center justify-center w-4 h-3.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-600 font-mono mr-1">
                      ↓
                    </kbd>
                    navigate
                  </span>
                  <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
                    <kbd className="inline-flex items-center justify-center px-1 h-3.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-600 font-mono mr-1">
                      ↵
                    </kbd>
                    select
                  </span>
                  <span className="text-[9px] text-zinc-700 uppercase tracking-wider">
                    <kbd className="inline-flex items-center justify-center px-1 h-3.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] text-zinc-600 font-mono mr-1">
                      esc
                    </kbd>
                    close
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0 && value.trim().length >= 2) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Small delay to allow click events on dropdown items to fire first
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setOpen(false);
              }
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-9 pr-3 ${
            open ? "border-white/[0.2] ring-1 ring-white/10" : ""
          } ${className}`}
        />
        {loading && value.trim().length >= 2 && (
          <CircleNotch className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 animate-spin" />
        )}
      </div>
      {dropdown}
    </div>
  );
}
