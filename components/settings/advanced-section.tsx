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
      <Section title="Data Export" description="Download your data">
        <SettingRow
          label="Export Portfolio Data"
          description="Download all portfolios, assets, and transactions as JSON"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-40"
            >
              <DownloadSimple className="h-3 w-3" />
              {isExporting ? "Exporting…" : "JSON"}
            </button>
            {["CSV", "PDF", "Excel"].map((f) => (
              <button
                key={f}
                disabled
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] text-zinc-700 cursor-not-allowed"
                title={`${f} export coming soon`}
              >
                <DownloadSimple className="h-3 w-3" /> {f}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          label="Export Format"
          description="Additional formats are being developed"
        >
          <div className="flex items-center gap-2.5">
            <StatusDot status="live" />
            <span className="text-[11px] text-zinc-500">JSON available</span>
            <div className="w-px h-3 bg-white/[0.06]" />
            <span className="text-[10px] text-zinc-700">
              CSV, PDF, Excel coming soon
            </span>
          </div>
        </SettingRow>
      </Section>

      {/* ── Cache & Storage ── */}
      <Section title="Cache & Storage" description="Local data management">
        <SettingRow
          label="Clear Local Cache"
          description="Remove cached data from this browser. Your account data is safe in the cloud."
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
                Cleared
              </>
            ) : (
              <>
                <ArrowsClockwise className="h-3 w-3" />
                Clear Cache
              </>
            )}
          </button>
        </SettingRow>
      </Section>

      {/* ── Danger Zone ── */}
      <Section
        title="Danger Zone"
        description="Irreversible actions"
        status="off"
      >
        <SettingRow
          label="Delete Account"
          description="Permanently remove your account and all associated data. This action cannot be undone."
        >
          {!deleteConfirmOpen ? (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-red-500/20 text-red-500/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
            >
              <Trash className="h-3 w-3" />
              Delete Account
            </button>
          ) : (
            <button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteText("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5"
            >
              Cancel
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
                  This action is permanent
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                All your portfolios, assets, transactions, documents, and
                preferences will be permanently deleted. This cannot be
                recovered.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-zinc-600">
                  Type{" "}
                  <span className="text-red-400 font-medium">
                    DELETE MY ACCOUNT
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="
                    bg-zinc-900 border border-red-500/20 text-zinc-300 text-xs
                    px-3 py-2 rounded-lg h-8
                    hover:border-red-500/30 transition-colors
                    focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10
                    placeholder:text-zinc-800
                  "
                />
                <button
                  disabled={deleteText !== "DELETE MY ACCOUNT"}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all mt-1
                    ${
                      deleteText === "DELETE MY ACCOUNT"
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        : "bg-red-500/10 text-red-500/30 cursor-not-allowed"
                    }
                  `}
                  title="Account deletion is not yet implemented"
                >
                  <Trash className="h-3 w-3" />
                  Permanently Delete Everything
                </button>
                <p className="text-[10px] text-zinc-700 mt-1">
                  Account deletion is not yet implemented. This button will be
                  activated in a future update.
                </p>
              </div>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
