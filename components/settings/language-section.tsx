"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  CaretDown,
  Check,
  GlobeSimple,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Section, SettingRow, StatusDot } from "./settings-primitives";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

/* ─── Language metadata ─── */

interface LanguageMeta {
  code: string;
  flag: string;
  native: string;
  english: string;
  preview: string; // sample phrase in target language
}

const LANGUAGES: LanguageMeta[] = [
  {
    code: "en",
    flag: "🇬🇧",
    native: "English",
    english: "English",
    preview: "Total Net Worth",
  },
  {
    code: "pt",
    flag: "🇵🇹",
    native: "Português",
    english: "Portuguese",
    preview: "Património Líquido Total",
  },
];

function searchLanguages(query: string): LanguageMeta[] {
  if (!query.trim()) return LANGUAGES;
  const q = query.toLowerCase().trim();
  return LANGUAGES.filter(
    (l) =>
      l.native.toLowerCase().includes(q) ||
      l.english.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANGUAGE PICKER — searchable dropdown with flags + preview phrases
   ═══════════════════════════════════════════════════════════════════════════ */

function LanguagePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = searchLanguages(query);
  const selected = LANGUAGES.find((l) => l.code === value);

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
      if (code !== value) {
        onChange(code);
      }
      setOpen(false);
      setQuery("");
    },
    [onChange, value],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`
          flex items-center gap-2 bg-zinc-900 border text-zinc-300 text-xs
          pl-3 pr-2 py-1.5 rounded-lg min-w-[180px] h-8
          hover:border-white/[0.12] hover:text-white transition-colors
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${open ? "border-white/[0.2] ring-1 ring-white/10" : "border-white/[0.06]"}
        `}
      >
        {selected && (
          <span className="text-sm leading-none">{selected.flag}</span>
        )}
        <span className="flex-1 text-left font-semibold">
          {selected?.native || value}
        </span>
        {selected && selected.native !== selected.english && (
          <span className="text-zinc-600 text-[10px]">{selected.english}</span>
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
            className="absolute z-50 top-full mt-1.5 right-0 w-[300px] rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
              <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages…"
                className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none w-full"
              />
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-zinc-600">
                  No languages found
                </div>
              ) : (
                filtered.map((lang) => {
                  const isSelected = lang.code === value;

                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`
                        group flex flex-col w-full px-3 py-2.5 text-left transition-colors
                        hover:bg-white/[0.04]
                        ${isSelected ? "bg-white/[0.04]" : ""}
                      `}
                    >
                      {/* Main row: flag + name + check */}
                      <div className="flex items-center gap-2.5 w-full">
                        <span className="text-base w-6 text-center shrink-0">
                          {lang.flag}
                        </span>
                        <span
                          className={`text-xs font-semibold tracking-wide ${
                            isSelected ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {lang.native}
                        </span>
                        {lang.native !== lang.english && (
                          <span className="text-[11px] text-zinc-600 flex-1">
                            {lang.english}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-3 w-3 text-emerald-500 shrink-0 ml-auto" />
                        )}
                      </div>

                      {/* Preview phrase — subtle teaser */}
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="w-6 shrink-0" />
                        <span className="text-[10px] text-zinc-700 italic group-hover:text-zinc-600 transition-colors truncate">
                          "{lang.preview}"
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-white/[0.06] bg-white/[0.01]">
              <p className="text-[9px] text-zinc-700 uppercase tracking-widest text-center">
                Page will reload on change
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANGUAGE SECTION — settings card with picker + status
   ═══════════════════════════════════════════════════════════════════════════ */

export function LanguageSection() {
  const { user: clerkUser } = useUser();
  const t = useTranslations("settings");

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUser?.id || "",
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );
  const updatePreferences = useMutation(api.users.updateUserPreferences);

  const currentLanguage = userPreferences?.language || routing.defaultLocale;
  const currentMeta = LANGUAGES.find((l) => l.code === currentLanguage);

  const [isSwitching, setIsSwitching] = useState(false);

  const handleLanguageChange = useCallback(
    async (code: string) => {
      if (!userId || code === currentLanguage) return;

      // Validate against supported locales
      if (!routing.locales.includes(code as any)) return;

      setIsSwitching(true);

      try {
        // Instant-apply: save to Convex immediately
        // useLocaleSync will detect the change, update the NEXT_LOCALE cookie, and reload
        await updatePreferences({
          userId,
          language: code,
        });

        // The page will reload automatically via useLocaleSync
        // If for some reason it doesn't reload within 3s, we force it
        setTimeout(() => {
          const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
          if (cookieMatch?.[1] !== code) {
            document.cookie = `NEXT_LOCALE=${code};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
            window.location.reload();
          }
        }, 3000);
      } catch (error) {
        console.error("Failed to update language preference:", error);
        setIsSwitching(false);
      }
    },
    [userId, currentLanguage, updatePreferences],
  );

  // Count of supported locales
  const localeCount = routing.locales.length;

  return (
    <Section
      title={t("language")}
      description={t("languageDescription")}
      status="live"
    >
      {/* Language Picker */}
      <SettingRow
        label={t("language")}
        description={t("languageDescription")}
      >
        {isSwitching ? (
          <div className="flex items-center gap-2.5 min-w-[180px] h-8 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.06]">
            <ArrowsClockwise className="h-3.5 w-3.5 text-zinc-500 animate-spin" />
            <span className="text-xs text-zinc-500 font-medium">
              Switching…
            </span>
          </div>
        ) : (
          <LanguagePicker
            value={currentLanguage}
            onChange={handleLanguageChange}
            disabled={!userId}
          />
        )}
      </SettingRow>

      {/* Coverage indicator */}
      <div className="flex items-center gap-3 px-0 py-3 border-t border-white/[0.03]">
        <GlobeSimple className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1">
            {LANGUAGES.map((lang) => (
              <span
                key={lang.code}
                className={`text-xs ${lang.code === currentLanguage ? "grayscale-0" : "grayscale opacity-40"} transition-all`}
                title={`${lang.native} (${lang.english})`}
              >
                {lang.flag}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-zinc-700 uppercase tracking-wider">
            {localeCount} languages supported
          </span>
        </div>
        {currentMeta && (
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusDot status="live" pulse />
            <span className="text-[10px] text-zinc-600 font-medium">
              {currentMeta.native}
            </span>
          </div>
        )}
      </div>
    </Section>
  );
}
