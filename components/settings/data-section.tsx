"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  CaretDown,
  ArrowsClockwise,
  Check,
} from "@phosphor-icons/react";
import { Section, SettingRow, StatusDot } from "./settings-primitives";
import {
  CURRENCIES,
  searchCurrencies,
  type CurrencyMeta,
} from "@/lib/currency";

/* ─── Market Region Options ─── */
const MARKET_REGIONS = [
  { value: "US", label: "US", flag: "🇺🇸" },
  { value: "EU", label: "Europe", flag: "🇪🇺" },
  { value: "APAC", label: "Asia-Pacific", flag: "🌏" },
  { value: "AF", label: "Africa", flag: "🌍" },
  { value: "GLOBAL", label: "Global", flag: "🌐" },
] as const;

/* ─── FX age helper ─── */
function fxAge(updatedAt: number | undefined): {
  label: string;
  status: "live" | "amber" | "off";
} {
  if (!updatedAt) return { label: "No data", status: "off" };

  const now = Date.now();
  const ageMs = now - updatedAt;
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours < 2) return { label: "Just now", status: "live" };
  if (ageHours < 12)
    return { label: `${Math.floor(ageHours)}h ago`, status: "live" };
  if (ageHours < 36)
    return { label: `${Math.floor(ageHours)}h ago`, status: "amber" };

  const ageDays = Math.floor(ageHours / 24);
  return { label: `${ageDays}d ago`, status: "amber" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CURRENCY PICKER — searchable dropdown with flags
   ═══════════════════════════════════════════════════════════════════════════ */

function CurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = searchCurrencies(query);
  const selected = CURRENCIES.find((c) => c.code === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 bg-zinc-900 border text-zinc-300 text-xs
          pl-3 pr-2 py-1.5 rounded-lg cursor-pointer min-w-[160px] h-8
          hover:border-white/[0.12] hover:text-white transition-colors
          ${open ? "border-white/[0.2] ring-1 ring-white/10" : "border-white/[0.06]"}
        `}
      >
        {selected && (
          <span className="text-sm leading-none">{selected.flag}</span>
        )}
        <span className="flex-1 text-left font-semibold">{value}</span>
        {selected && (
          <span className="text-zinc-600 text-[10px]">{selected.symbol}</span>
        )}
        <CaretDown
          className={`h-3 w-3 text-zinc-600 transition-transform ml-1 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 right-0 w-[280px] rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
              <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currencies…"
                className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none w-full"
              />
            </div>

            {/* List */}
            <div className="max-h-[260px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-zinc-600">
                  No currencies found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={`
                      flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors
                      hover:bg-white/[0.04]
                      ${c.code === value ? "bg-white/[0.04]" : ""}
                    `}
                  >
                    <span className="text-sm w-6 text-center shrink-0">
                      {c.flag}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        c.code === value ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {c.code}
                    </span>
                    <span className="text-[11px] text-zinc-600 flex-1 truncate">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-zinc-700 shrink-0 w-5 text-right">
                      {c.symbol}
                    </span>
                    {c.code === value && (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA SECTION — currency, market region, FX status
   ═══════════════════════════════════════════════════════════════════════════ */

interface DataSectionProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  marketRegion: string;
  onMarketRegionChange: (region: string) => void;
}

export function DataSection({
  currency,
  onCurrencyChange,
  marketRegion,
  onMarketRegionChange,
}: DataSectionProps) {
  const fxRates = useQuery(api.marketData.getFxRates);
  const fx = fxAge(fxRates?.updatedAt);

  const rateCount = fxRates?.rates
    ? Object.keys(fxRates.rates as Record<string, number>).length
    : 0;

  const selectedRegion = MARKET_REGIONS.find((r) => r.value === marketRegion);

  return (
    <Section
      title="Data & Markets"
      description="Currency, region & feeds"
      status={fx.status}
    >
      {/* Base Currency */}
      <SettingRow
        label="Base Currency"
        description="All portfolio values are converted to this currency"
      >
        <CurrencyPicker value={currency} onChange={onCurrencyChange} />
      </SettingRow>

      {/* Market Region */}
      <SettingRow
        label="Market Region"
        description="Preferred region for news and market data"
      >
        <div className="relative">
          <select
            value={marketRegion}
            onChange={(e) => onMarketRegionChange(e.target.value)}
            className="
              appearance-none bg-zinc-900 border border-white/[0.06] text-zinc-300 text-xs
              pl-3 pr-8 py-1.5 rounded-lg cursor-pointer h-8 min-w-[140px]
              hover:border-white/[0.12] hover:text-white transition-colors
              focus:outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/10
            "
          >
            {MARKET_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.flag} {r.label}
              </option>
            ))}
          </select>
          <CaretDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
        </div>
      </SettingRow>

      {/* FX Sync Status */}
      <SettingRow
        label="FX Rate Sync"
        description={`${rateCount} currency pairs tracked · Updated daily`}
      >
        <div className="flex items-center gap-2.5">
          <StatusDot status={fx.status} pulse={fx.status === "live"} />
          <span className="text-[11px] text-zinc-500 tabular-nums">
            {fx.label}
          </span>
          <div className="w-px h-3 bg-white/[0.06]" />
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            Base: EUR
          </span>
        </div>
      </SettingRow>
    </Section>
  );
}
