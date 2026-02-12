"use client";

import { useState } from "react";
import {
  DownloadSimple,
  Trash,
  ArrowsClockwise,
  Warning,
  Check,
} from "@phosphor-icons/react";
import { Section, SettingRow, StatusDot } from "./settings-primitives";
import { useTranslations } from "next-intl";

/* ═══════════════════════════════════════════════════════════════════════════
   ADVANCED SECTION — data export, cache, danger zone
   ═══════════════════════════════════════════════════════════════════════════ */

interface AdvancedSectionProps {
  onExport: () => Promise<void>;
  isExporting: boolean;
}

export function AdvancedSection({
  onExport,
  isExporting,
}: AdvancedSectionProps) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const handleClearCache = () => {
    // Clear any client-side caches (localStorage, sessionStorage search indices, etc.)
    try {
      const keysToPreserve = ["portfolio-theme", "clerk-db"];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (!keysToPreserve.some((preserve) => key.startsWith(preserve))) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch {
      // silently fail if storage is unavailable
    }
  };

  return (
    <>
      {/* ── Data Export ── */}
      <Section title={t("dataExport")} description={t("downloadYourData")}>
        <SettingRow
          label={t("exportPortfolioData")}
          description={t("exportPortfolioDataDesc")}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-40"
            >
              <DownloadSimple className="h-3 w-3" />
              {isExporting ? t("exporting") : t("json")}
            </button>
            {["CSV", "PDF", "Excel"].map((f) => (
              <button
                key={f}
                disabled
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-700 cursor-not-allowed"
                title={t("exportComingSoon", { format: f })}
              >
                <DownloadSimple className="h-3 w-3" /> {f}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label={t("exportFormat")}
          description={t("exportFormatDesc")}
        >
          <div className="flex items-center gap-2.5">
            <StatusDot status="live" />
            <span className="text-[11px] text-zinc-500">{t("jsonAvailable")}</span>
            <div className="w-px h-3 bg-white/[0.06]" />
            <span className="text-[10px] text-zinc-700">
              {t("csvPdfExcelComingSoon")}
            </span>
          </div>
        </SettingRow>
      </Section>

      {/* ── Cache & Storage ── */}
      <Section title={t("cacheStorage")} description={t("localDataManagement")}>
        <SettingRow
          label={t("clearLocalCache")}
          description={t("clearLocalCacheDesc")}
        >
          <button
            onClick={handleClearCache}
            disabled={cacheCleared}
            className={`
              flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all
              ${
                cacheCleared
                  ? "border-emerald-500/20 text-emerald-500 cursor-default"
                  : "border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04]"
              }
            `}
          >
            {cacheCleared ? (
              <>
                <Check className="h-3 w-3" />
                {t("cleared")}
              </>
            ) : (
              <>
                <ArrowsClockwise className="h-3 w-3" />
                {t("clearCache")}
              </>
            )}
          </button>
        </SettingRow>
      </Section>

      {/* ── Danger Zone ── */}
      <Section
        title={t("dangerZone")}
        description={t("irreversibleActions")}
        status="off"
      >
        <SettingRow
          label={t("deleteAccount")}
          description={t("deleteAccountDesc")}
        >
          {!deleteConfirmOpen ? (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-red-500/20 text-red-500/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
            >
              <Trash className="h-3 w-3" />
              {t("deleteAccount")}
            </button>
          ) : (
            <button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteText("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5"
            >
              {tc("cancel")}
            </button>
          )}
        </SettingRow>

        {/* Delete confirmation gate */}
        {deleteConfirmOpen && (
          <div className="py-3 border-b border-white/[0.03] last:border-b-0">
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Warning className="h-4 w-4 text-red-500" />
                <span className="text-xs font-semibold text-red-400">
                  {t("thisActionIsPermanent")}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                {t("deleteAccountWarning")}
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-zinc-600">
                  {t("typeToConfirm", { text: t("deleteMyAccount") })}
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder={t("deleteMyAccount")}
                  className="
                    bg-zinc-900 border border-red-500/20 text-zinc-300 text-xs
                    px-3 py-2 rounded-lg h-8
                    hover:border-red-500/30 transition-colors
                    focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10
                    placeholder:text-zinc-800
                  "
                />
                <button
                  disabled={deleteText !== t("deleteMyAccount")}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all mt-1
                    ${
                      deleteText === t("deleteMyAccount")
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        : "bg-red-500/10 text-red-500/30 cursor-not-allowed"
                    }
                  `}
                  title={t("deleteNotYetImplemented")}
                >
                  <Trash className="h-3 w-3" />
                  {t("permanentlyDeleteEverything")}
                </button>
                <p className="text-[10px] text-zinc-700 mt-1">
                  {t("deleteNotYetImplemented")}
                </p>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
