# Portfolio Tracker — V2 Implementation Plan

## Context

This plan addresses 6 interconnected workstreams that bring consistency to the project's DNA:
- **DNA**: Dark zinc `#09090b`, gold accents `var(--primary)` / `#d4af37`, `rgba(255,255,255,0.06)` borders, `ResponsiveDialog` for all popups, monospace data density, spring-based Framer Motion, Phosphor icons.
- **Stack**: Next.js (App Router), TailwindCSS, Framer Motion (`motion/react`), Convex (backend/DB), Clerk (auth), shadcn/ui primitives.
- **No new dependencies** — everything uses the existing stack.

### Key Reference Files

| Area | Path |
|---|---|
| Schema | `convex/schema.ts` |
| FX utilities | `convex/fx.ts` |
| Market data + FX rates | `convex/marketData.ts` |
| Transactions CRUD | `convex/transactions.ts` |
| User prefs CRUD | `convex/users.ts` |
| Feature flags | `convex/flags.ts` |
| Currency formatting | `lib/currency.ts` |
| Currency hook | `hooks/useCurrency.ts` |
| Responsive dialog | `components/responsive-dialog.tsx` |
| Transaction dialog (old) | `components/transaction-dialog.tsx` |
| Edit asset dialog | `components/edit-asset-dialog.tsx` |
| Add asset dialog | `components/add-asset-dialog.tsx` |
| Holdings table | `components/holdings.tsx` |
| Settings page | `app/(webapp)/settings/page.tsx` |
| Settings sections | `components/settings/*.tsx` |
| Earnings page | `app/(webapp)/earnings/page.tsx` |
| Watchlist page | `app/(webapp)/watchlist/page.tsx` |
| Research page | `app/(webapp)/research/` (empty) |

---

## Execution Steps

### Step 1 — Dynamic Currency List from Backend ✅

> **Why first**: Every other workstream (transactions, edit asset, add asset, settings) depends on having a full currency list. The current `lib/currency.ts` hardcodes 42 currencies, but the `fxRates` table from ExchangeRatesAPI stores 160+ EUR-based pairs. Users need access to all of them.

**Backend**:
- `convex/marketData.ts` — Add `getAvailableCurrencies` query that reads `fxRates` document and returns an array of currency code strings from `rates` keys (plus `"EUR"` which is the base and not in the rates map).

**Library**:
- `lib/currency.ts` — Add `buildCurrencyList(backendCodes: string[]): CurrencyMeta[]` function:
  - Starts with the existing `CURRENCIES` array (42 enriched entries with flags, symbols, decimals).
  - For every code in `backendCodes` that isn't already in `CURRENCIES`, generates a fallback `CurrencyMeta` using `Intl.DisplayNames` for the name and `Intl.NumberFormat` for the symbol, with a generic `🏳️` flag and 2 decimal places.
  - Returns the merged list sorted: enriched entries first (original order), then auto-generated entries alphabetically.
  - Export a `getCurrencyMeta(code: string): CurrencyMeta` helper that checks the enriched set first, then falls back to Intl-generated metadata.

**Hook**:
- `hooks/useCurrency.ts` — Add `useAvailableCurrencies()` hook:
  - Calls `useQuery(api.marketData.getAvailableCurrencies)`.
  - Calls `buildCurrencyList(data)` with the result.
  - Returns `{ currencies: CurrencyMeta[], loading: boolean }`.
  - When backend data is loading/unavailable, falls back to the hardcoded `CURRENCIES` array.

**Files touched**:
| File | Action |
|---|---|
| `convex/marketData.ts` | Edit — add `getAvailableCurrencies` query |
| `lib/currency.ts` | Edit — add `buildCurrencyList()`, `getCurrencyMeta()` |
| `hooks/useCurrency.ts` | Edit — add `useAvailableCurrencies()` export |

---

### Step 2 — Wire Dynamic Currencies into Pickers ✅

> **Why now**: With the dynamic list available, wire it into every currency picker so all subsequent work (transactions, settings) uses the full list.

**Edit Asset Dialog**:
- `components/edit-asset-dialog.tsx` — Update `PortalCurrencyPicker` to accept an optional `currencies?: CurrencyMeta[]` prop. When provided, use it instead of importing `CURRENCIES` directly. In `V2EditAssetDialog`, call `useAvailableCurrencies()` and pass the result to the picker.

**Add Asset Dialog**:
- `components/add-asset-dialog.tsx` — Same pattern: call `useAvailableCurrencies()`, pass to whatever currency selector is used in the Details step.

**Settings Data Section**:
- `components/settings/data-section.tsx` — Update `CurrencyPicker` to accept an optional `currencies` prop. In `DataSection`, call `useAvailableCurrencies()` and pass down.

**Files touched**:
| File | Action |
|---|---|
| `components/edit-asset-dialog.tsx` | Edit — wire dynamic currencies into `PortalCurrencyPicker` |
| `components/add-asset-dialog.tsx` | Edit — wire dynamic currencies |
| `components/settings/data-section.tsx` | Edit — wire dynamic currencies into `CurrencyPicker` |

---

### Step 3 — Transaction Backend: FX-Aware Stats & Enrichment ✅

> **Why now**: Before rebuilding the dialog, the backend needs to return currency-aware data. Transactions don't need their own `currency` field — they inherit the currency from their parent asset (via `assets.currency`). The backend just needs to surface that currency and provide converted totals when the user's display currency differs.

**No schema changes** — the existing `transactions` table is unchanged. Assets already store `currency: v.optional(v.string())`.

**Transaction queries**:
- `convex/transactions.ts`:
  - `getAssetTransactionStats` — All existing stats (`totalBuyAmount`, `totalSellAmount`, `avgBuyPrice`, `totalFees`, `totalDividends`, `netAmount`, etc.) remain **in the asset's original currency** — nothing changes there. Additions:
    - Look up the parent asset to get its `currency` (default `"USD"`).
    - Accept an optional `displayCurrency` arg (the user's base currency).
    - Return `assetCurrency` in the response so the frontend knows what currency the raw numbers are in.
    - When `displayCurrency` is provided and differs from `assetCurrency`, load `fxRates` doc internally and use `convex/fx.ts` `convert()` to produce a single extra field: `convertedNetValue` (the net investment total converted to the user's display currency). This is the only converted value — everything else stays original.
    - If currencies match or FX data is unavailable, `convertedNetValue` is omitted / `null`.
  - `getPortfolioTransactions` — Already enriches with `assetName`, `assetSymbol`, `assetType`. Add `assetCurrency` (from `asset.currency || "USD"`) to each enriched transaction.
  - `getAssetTransactions` — No changes needed (returns raw transaction data; the frontend will know the asset's currency from the dialog props).

**Files touched**:
| File | Action |
|---|---|
| `convex/transactions.ts` | Edit — FX-aware stats, enrich with `assetCurrency` |

---

### Step 4 — Transaction Dialog Rebuild ✅

> **Why now**: Backend is ready, currency list is dynamic. Time to tear down the old `<Dialog>`-based implementation and rebuild with `ResponsiveDialog`.

**Delete & rewrite** `components/transaction-dialog.tsx`:

**Architecture**:
- Uses `ResponsiveDialog` with `maxWidth="640px"` (wider than other dialogs to fit transaction data density).
- Mobile: bottom sheet. Desktop: centered modal. Step indicator with gold accent. All matching DNA.

**Views/Steps**:

1. **List View** (default when opened):
   - Header: asset name/symbol + "Add" button (same as current but in `ResponsiveDialog` frame).
   - Stats bar: 4-cell ticker-strip grid showing Quantity, Avg Buy Price, Total Invested, Transaction Count — all in the asset's original currency.
     - When asset currency ≠ user's display currency: a subtle summary row beneath the stats shows `convertedNetValue` (e.g. `≈ $12,340.00 in USD`) with the `FxBadge` (reuse pattern from `holdings.tsx`).
   - Transaction rows: each shows type icon + badge, date, amounts in asset's original currency (e.g. `€150.00`). No per-row conversion — the single converted total in the stats bar is sufficient context.
   - Hover-reveal edit/delete actions (matching current pattern).

2. **Type Step**: 3-card grid (Buy/Sell/Dividend) — auto-advances on click (matching add-asset pattern).

3. **Details Step**:
   - Currency indicator showing the asset's currency (read-only, informational — transactions are always in asset currency).
   - Date, Quantity (not for dividends), Price per unit (with asset currency symbol prefix), Fees, Notes.
   - Live "Total" summary panel in asset currency. When currencies differ, a muted secondary line shows the converted equivalent.

4. **Confirm Step**: Row-based summary in asset's original currency. When currencies differ, the total row includes a secondary converted value.

**Currency logic**:
- Transactions are always recorded and displayed in the **asset's currency** (from `asset.currency`, defaulting to `"USD"`).
- `useCurrency()` provides the user's display currency for informational conversion display.
- FX conversion display is informational only — the actual stored values are always in the asset's original currency.

**Props**: Same interface as current (`isOpen`, `onOpenChange`, `assetId`, `assetName`, `assetType`, `assetSymbol`) plus new optional `assetCurrency?: string`.

**Files touched**:
| File | Action |
|---|---|
| `components/transaction-dialog.tsx` | Overwrite — full rebuild with `ResponsiveDialog` |
| `components/holdings.tsx` | Edit — pass `assetCurrency` to `V2TransactionDialog` |

---

### Step 5 — Feature Flag Infrastructure

> **Why now**: Before touching settings and pages, we need a clean hook and gate pattern.

**Hook**:
- `hooks/useFeatureFlag.ts` — **Create**:
  - `useFeatureFlag(key: string): boolean | undefined` — wraps `useQuery(api.flags.getFlag, { key, userEmail })` with auto-injected Clerk user email.
  - Returns `undefined` while loading, `true`/`false` when resolved.
  - Memoizes the user email lookup.

**No gate component** — pages that are behind flags simply check the flag and render `null` / redirect, pushing the user to the 404 catch-all. The page should not render at all — users shouldn't know it exists.

**Files touched**:
| File | Action |
|---|---|
| `hooks/useFeatureFlag.ts` | Create — reusable feature flag hook |

---

### Step 6 — Feature Flags on Pages

> **Why now**: Earnings, Watchlist, and Research need gating. Research doesn't even have a page yet.

**Earnings**:
- `app/(webapp)/earnings/page.tsx` — Import `useFeatureFlag("earnings-calendar")`. If flag is `false`, redirect to 404. If `undefined` (loading), render nothing. Otherwise render the page.

**Watchlist**:
- `app/(webapp)/watchlist/page.tsx` — Same pattern with `useFeatureFlag("watchlist")`.

**Research**:
- `app/(webapp)/research/page.tsx` — **Create** a minimal placeholder page wrapped in `useFeatureFlag("research")`. When flag is off → redirect to 404.

**Important**: Since these are client components using hooks, they can't call `notFound()` directly (that's a server function). Instead, use `router.replace("/404")` and render `null`, or use `redirect()` from a useEffect. The key is that the page never renders — users are pushed to the catch-all 404 as if the route doesn't exist.

**Files touched**:
| File | Action |
|---|---|
| `app/(webapp)/earnings/page.tsx` | Edit — wrap in feature flag |
| `app/(webapp)/watchlist/page.tsx` | Edit — wrap in feature flag |
| `app/(webapp)/research/page.tsx` | Create — basic page with feature flag |

---

### Step 7 — Settings: Multi-Channel Notifications

> **Why now**: Users need to subscribe to multiple notification channels simultaneously, not pick one.

**Schema**:
- `convex/schema.ts`:
  - Replace `marketPulseChannel: v.optional(v.union(...))` with `marketPulseChannels: v.optional(v.array(v.union(v.literal("email"), v.literal("discord"), v.literal("telegram"))))`.
  - Replace single `marketPulseWebhookUrl` with per-channel fields: `discordWebhookUrl: v.optional(v.string())`, `telegramWebhookUrl: v.optional(v.string())`.

**Backend**:
- `convex/users.ts` — Update `updateUserPreferences` args and handler to accept the new array field and per-channel webhook URLs.

**Frontend**:
- `components/settings/alerts-section.tsx` — Rewrite channel selector:
  - Each channel (Email, Discord, Telegram) gets its own toggle row (checkbox-style, not radio).
  - Multiple can be active simultaneously.
  - Discord/Telegram each show their own webhook URL input when toggled on.
  - "Armed channels" indicator shows all active channels.
  - Props change from single `marketPulseChannel` to `marketPulseChannels: ChannelType[]` and callbacks.

- `app/(webapp)/settings/page.tsx` — Update state management for the new multi-channel model. Wrap the Alerts section in a `marketPulse` feature flag. Wrap earnings reminders display in an `earningsReminders` flag.

**Files touched**:
| File | Action |
|---|---|
| `convex/schema.ts` | Edit — multi-channel notification fields |
| `convex/users.ts` | Edit — handle new fields |
| `components/settings/alerts-section.tsx` | Edit — multi-channel UI |
| `app/(webapp)/settings/page.tsx` | Edit — update state, add flag wrapping |

---

### Step 8 — Settings: Help & Search Section

> **Why now**: Settings needs a discoverability layer — users should find what actions and features are available.

**Create** `components/settings/help-section.tsx`:

**Design**:
- Searchable catalog of all available actions and features.
- Search input at top (monospace, matching command palette style).
- Items grouped by category with colored accent bars (matching command palette DNA):
  - **Navigation** — Dashboard, Portfolio, News, Settings, etc.
  - **Portfolio Actions** — Add Asset, Edit Asset, Create Portfolio, Edit Portfolio, Record Transaction, Set Goals.
  - **Keyboard Shortcuts** — ⌘K Search, Escape to close, Arrow keys navigation.
  - **Data Actions** — Export Data, Change Currency, Sync FX Rates.
  - **AI Features** — Generate Summary, Market Pulse, BYOAI Config.
- Each item: icon + title + description (searchable by description content, not just keywords).
- Search filters items in real-time across all categories.
- Empty state when no results match.
- Dense ticker-strip rows, `text-xs`, `border-white/[0.06]` dividers.

**Settings page**:
- `app/(webapp)/settings/page.tsx` — Add "Help" tab to the tab array, render `HelpSection` when active.

**Files touched**:
| File | Action |
|---|---|
| `components/settings/help-section.tsx` | Create — searchable action/feature catalog |
| `app/(webapp)/settings/page.tsx` | Edit — add Help tab |

---

### Step 9 — Settings Feature Flag Wrapping

> **Why now**: Final polish — ensure incomplete or WIP settings features don't confuse users.

- `app/(webapp)/settings/page.tsx`:
  - Wrap the entire **Alerts tab** content in `useFeatureFlag("notifications")` — only render `AlertsSection` when flag is enabled, otherwise show a muted "Notifications coming soon" inline message.
  - The **AI tab** already partially gates BYOAI behind `byoai` flag — extend to also wrap `aiSummaryFrequency` selector in a `ai-summaries` flag.
  - **Appearance** section already gated by `appearance` flag ✅.
  - **Help tab** is always visible (no flag needed — it's informational).

**Files touched**:
| File | Action |
|---|---|
| `app/(webapp)/settings/page.tsx` | Edit — wrap sections in feature flags |

---

## Full File Touch Summary

| File | Steps | Action |
|---|---|---|
| `convex/schema.ts` | 7 | Edit — multi-channel notification fields |
| `convex/transactions.ts` | 3 | Edit — FX-aware stats, enrich with `assetCurrency` |
| `convex/marketData.ts` | 1 | Edit — add `getAvailableCurrencies` query |
| `convex/users.ts` | 7 | Edit — multi-channel notification prefs |
| `lib/currency.ts` | 1 | Edit — `buildCurrencyList()`, `getCurrencyMeta()` |
| `hooks/useCurrency.ts` | 1 | Edit — `useAvailableCurrencies()` |
| `hooks/useFeatureFlag.ts` | 5 | Create — reusable flag hook |
| `components/transaction-dialog.tsx` | 4 | Overwrite — full `ResponsiveDialog` rebuild |
| `components/holdings.tsx` | 4 | Edit — pass `assetCurrency` to transaction dialog |
| `components/edit-asset-dialog.tsx` | 2 | Edit — wire dynamic currencies |
| `components/add-asset-dialog.tsx` | 2 | Edit — wire dynamic currencies |
| `components/settings/data-section.tsx` | 2 | Edit — wire dynamic currencies |
| `components/settings/alerts-section.tsx` | 7 | Edit — multi-channel UI |
| `components/settings/help-section.tsx` | 8 | Create — help/search catalog |
| `app/(webapp)/settings/page.tsx` | 7, 8, 9 | Edit — multi-channel state, Help tab, flag wrapping |
| `app/(webapp)/earnings/page.tsx` | 6 | Edit — feature flag gate |
| `app/(webapp)/watchlist/page.tsx` | 6 | Edit — feature flag gate |
| `app/(webapp)/research/page.tsx` | 6 | Create — page with feature flag gate |

---

## Changelog

| Date | Step | Description |
|---|---|---|
| — | — | Plan created |
| 2026-02-10 | 1 | ✅ Dynamic currency list — added `getAvailableCurrencies` query to `convex/marketData.ts`, added `getCurrencyMeta()` + `buildCurrencyList()` to `lib/currency.ts`, added `useAvailableCurrencies()` hook to `hooks/useCurrency.ts`. `searchCurrencies()` now accepts optional custom list. `currencySymbol()` + formatter cache now use `getCurrencyMeta()` for universal fallback. 0 new errors. |
| 2026-02-10 | 2 | ✅ Wired dynamic currencies into all 3 pickers — `PortalCurrencyPicker` in `edit-asset-dialog.tsx` and `add-asset-dialog.tsx` now accepts optional `currencies?: CurrencyMeta[]` prop; both parent components call `useAvailableCurrencies()` and pass the result down. `CurrencyPicker` in `settings/data-section.tsx` same pattern. All pickers now use `searchCurrencies(query, list)` against the dynamic list. 0 new errors. |