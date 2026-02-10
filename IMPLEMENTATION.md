# Portfolio Tracker — UI/UX Implementation Plan

## Context for AI Navigation

**Project**: Portfolio Tracker — a dark-themed financial dashboard built with Next.js (App Router), TailwindCSS, Framer Motion, Convex (backend/DB), and Clerk (auth).

**Design DNA**: The app follows a "ticker strip" visual language — border-separated cells (`rgba(255,255,255,0.06)`), full-height dividers, gold accent underlines (`var(--primary)` / `#d4af37`), `text-sm font-semibold` for data, `text-xs` for labels, dark zinc backgrounds (`#09090b`), and spring-based Framer Motion animations. Icons use `@phosphor-icons/react`. UI primitives are shadcn/ui under `components/ui/*` (do NOT modify those).

**Key files you'll need frequently**:

| Area | Path |
|---|---|
| Schema (all tables) | `convex/schema.ts` |
| Portfolio CRUD | `convex/portfolios.ts` |
| Asset CRUD + transactions | `convex/assets.ts` |
| Articles CRUD | `convex/articles.ts` |
| Documents CRUD | `convex/documents.ts` |
| Portfolio Goals CRUD | `convex/portfolioGoals.ts` |
| Main dashboard page | `app/page.tsx` |
| Portfolio detail page | `app/(webapp)/portfolio/[id]/page.tsx` |
| News page | `app/(webapp)/news/page.tsx` |
| Header (animated nav) | `components/header.tsx` |
| Tabs (ticker-DNA style) | `components/tabs.tsx` |
| Ticker strip | `components/ticker.tsx` |
| AI card | `components/ai-card.tsx` |
| AI summary popup | `components/ai-summary-popup.tsx` |
| Vault (articles, docs) | `components/vault.tsx` |
| Portfolio Goals tab | `components/portfolio-goals.tsx` |
| Add asset dialog | `components/add-asset-dialog.tsx` |
| Edit asset dialog | `components/edit-asset-dialog.tsx` |
| Create portfolio dialog | `components/create-portfolio-dialog.tsx` |
| Edit portfolio dialog | `components/edit-portfolio-dialog.tsx` |
| Allocation bar | `components/allocation-bar.tsx` |
| Holdings table | `components/holdings.tsx` |
| Analytics | `components/analytics.tsx` |
| Types | `components/types.ts` |

**Schema gaps the frontend doesn't use yet**:
- `userDocuments.format` — never populated
- `articles.editArticleUrl` — mutation exists, no frontend button

**Design rules**:
- Every dialog should be responsive: bottom sheet on mobile, centered popup on desktop (see `ai-summary-popup.tsx` for reference pattern)
- Dialogs use step indicators at the top (see `add-asset-dialog.tsx` for reference)
- Buttons: primary = `bg-white text-black hover:bg-zinc-200`, ghost = `text-zinc-500 hover:text-white`
- Border color everywhere: `rgba(255,255,255,0.06)` or `border-white/[0.06]`
- Labels: `text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]`
- Inputs: `bg-zinc-900 border-white/[0.06] text-white h-10 text-sm`
- Reduce backdrop blur on dialogs (current AI popup has too much)

---

## Implementation Steps

### Phase 1: Quick Surgical Fixes

- [x] **Step 1 — AI card rename + refresh button restyle**
  - Portfolio page: rename "AI Market Intelligence" → "AI Portfolio Insight"
  - Replace raw SVG refresh icon with Phosphor `ArrowsClockwise`, styled as ghost button
  - Accept a `label` prop on `V2AICard` so each usage can set its own title
  - File: `components/ai-card.tsx`

- [x] **Step 2 — Holdings section header (Option 2)**
  - Remove floating `justify-end` wrapper for Add Asset button
  - Add section header row: "Holdings" h2 left + Add Asset button right
  - Match style of dashboard's "Your Portfolios" header
  - File: `app/(webapp)/portfolio/[id]/page.tsx`

- [x] **Step 3 — Delete portfolio button**
  - Add "Delete Portfolio" button next to "Edit Portfolio" with a `|` divider
  - Confirmation dialog (use simple window.confirm or a styled dialog)
  - Call `api.portfolios.deletePortfolio` mutation
  - `router.push("/")` after success
  - File: `app/(webapp)/portfolio/[id]/page.tsx`

- [x] **Step 4 — Vault search field**
  - Add search input at top of Vault container
  - Pass filter string to GoalTracker, ArticlesList, DocumentsList
  - Filter articles by title/URL/notes, documents by fileName/type
  - Goals section doesn't need filtering (small data)
  - File: `components/vault.tsx`

### Phase 2: Medium Components

- [x] **Step 5 — Asset allocation bar on portfolio page**
  - Created `V2AssetAllocationBar` component with tooltip-based segments (no external labels)
  - Groups assets by type with color-coded segments, hover-dim effect, and compact legend
  - Placed in 2-column grid alongside AI card on portfolio detail page
  - Files: `components/allocation-bar.tsx`, `app/(webapp)/portfolio/[id]/page.tsx`

- [x] **Step 6 — Research links: notes + edit button**
  - Convex: updated `saveArticle` to accept optional `notes`, created `updateArticle` mutation (title, url, notes)
  - Frontend: notes textarea in save article dialog, edit button (pencil icon) per article, full edit dialog with title/url/notes
  - Notes preview shown inline on article rows (italic, line-clamped)
  - Files: `convex/articles.ts`, `components/vault.tsx`

- [x] **Step 7 — Document upload dialog revamp**
  - Replaced raw file input with drag-and-drop `UploadDocumentDialog` component
  - Step 1: drag-drop zone + document type selector grid (7 schema types with emoji icons)
  - Step 2: confirm step with file summary (name, format, size, type)
  - Step indicators in dialog header, Framer Motion step transitions
  - Passes `type` to `uploadDocument` mutation
  - Files: `components/vault.tsx`

- [x] **Step 8 — Moving ticker strip**
  - New `V2MovingTicker` component with CSS `@keyframes` infinite scroll animation
  - Duplicated content for seamless loop, pause on hover, speed prop for tuning
  - Edge fade masks via CSS `mask-image` gradient, gold accent bottom border glow
  - Sparklines per benchmark, tabular-nums formatting, `aria-hidden` on duplicate set
  - Keyframes in `app/globals.css`, duration auto-calculated from content width ÷ speed
  - Files: new `components/moving-ticker.tsx`, `app/globals.css`

- [x] **Step 9 — News page header redesign**
  - Replaced `V2Ticker` with `V2MovingTicker` (infinite marquee, speed=35)
  - Swapped ad-hoc flex hero for `V2HeroSplit` — same 60/40 DNA as homepage
  - Left panel: editorial masthead with live pulse indicator, "Updated at" timestamp, dramatic 56px title, subtitle
  - Right panel: `V2AICard` placed raw (no wrapping card) — matches homepage pattern exactly
  - Filter bar enhanced with contextual label (shows active category inline)
  - Derived latest article timestamp from news data for masthead
  - File: `app/(webapp)/news/page.tsx`

### Phase 3: Dialog System Overhaul

- [x] **Step 10 — Responsive dialog base component**
  - Portal-based `ResponsiveDialog` with Framer Motion `AnimatePresence`
  - Mobile: bottom sheet with drag handle, touch drag-to-dismiss (120px threshold), spring slide-up animation
  - Desktop: centered modal with scale entrance, configurable `maxWidth`
  - Step indicator with gold `var(--primary)` accent underline via `layoutId` spring animation
  - Step content transitions slide horizontally (`x: 16 → 0 → -16`) between steps
  - Reduced backdrop blur (`backdrop-blur-[2px]`) per design rules
  - Body scroll lock via `position: fixed` (preserves scroll position on close)
  - Accessibility: `role="dialog"`, `aria-modal`, `aria-label`, escape key, focus management
  - File: new `components/responsive-dialog.tsx`

- [x] **Step 11 — Create Portfolio dialog redesign**
  - Migrated to `ResponsiveDialog` with 3-step flow: Name → Strategy → Confirm
  - Step 2 "Strategy": risk tolerance card selector (3 cards with icons — ShieldCheck/ChartLineUp, colored accents), time horizon card selector (Clock icons), plus toggle panel for `includeInNetworth` and `allowSubscriptions` with Switch component
  - Convex: updated `createPortfolio` mutation to accept `includeInNetworth` (default true) and `allowSubscriptions` (default false)
  - Confirm step: clean row-based summary with `border-b` separators
  - Files: `components/create-portfolio-dialog.tsx`, `convex/portfolios.ts`

- [x] **Step 12 — Edit Portfolio dialog redesign**
  - Migrated to `ResponsiveDialog` with 3-step flow: Details → Strategy → Confirm
  - Same Strategy step visual pattern as create dialog (risk cards, time horizon cards, toggle panel)
  - Confirm step shows **diff view** — only changed fields with strikethrough old → ArrowRight → new value; disables save if no changes
  - Convex: updated `updatePortfolio` mutation to accept and patch `includeInNetworth` and `allowSubscriptions`
  - `useEffect` syncs state when initial props change (e.g. after refetch)
  - Bug fix: `getPortfolioById` returns `null` instead of throwing on missing portfolio — fixes delete race condition crash
  - Bug fix: portfolio page `useEffect` redirects to `/` when `portfolio === null`
  - Files: `components/edit-portfolio-dialog.tsx`, `convex/portfolios.ts`, `app/(webapp)/portfolio/[id]/page.tsx`

- [x] **Step 13 — Edit Asset dialog redesign**
  - Migrated to `ResponsiveDialog` with 4-step flow: Asset Info → Pricing → Notes → Confirm
  - Step 1 "Asset Info": read-only type badge (icon + colored circle), name input, symbol input (stock/crypto only)
  - Step 2 "Pricing": currency selector (cash) or current price with `$` prefix input (non-cash), live "Current Value" context panel showing qty × price
  - Step 3 "Notes": focused textarea step with placeholder guidance
  - Step 4 "Confirm": row-based summary, notes truncated to 80 chars
  - Type metadata map (`TYPE_META`) for icon/color lookup per asset type
  - File: `components/edit-asset-dialog.tsx`

- [x] **Step 14 — Add Asset dialog redesign**
  - Migrated to `ResponsiveDialog` with 5-step flow: Type → Details → Purchase → Notes → Confirm
  - Step 1 "Type": enhanced card selector — added descriptions per type, selection dot indicator, auto-advances to step 2 on click
  - Step 2 "Details": compact type badge with "Change" button to go back, name/symbol/currency inputs
  - Step 3 "Purchase": quantity, purchase price with `$` prefix, date, current price, fees — live "Total Cost" summary panel with breakdown
  - Step 4 "Notes": focused textarea step
  - Step 5 "Confirm": full row-based summary + "Total Investment" highlight panel
  - Per-step validation: details requires name, purchase requires price + quantity
  - Footer adapts: type step shows "Select an asset type" hint, other steps show Back/Continue
  - File: `components/add-asset-dialog.tsx`

### Phase 4: Large Features

- [x] **Step 15 — Goals tab redesign**
  - Schema: renamed `goals` table → `portfolioGoals` with new multi-goal structure — each goal is its own row with `name`, `type` (5 variants: `portfolio_value`, `annual_return`, `yearly_return`, `monthly_contribution`, `custom`), `targetValue`, `currentValue`, `unit` (`currency`/`percentage`), `icon`, `color`, `deadline`, `notes`
  - Convex: new `convex/portfolioGoals.ts` with full CRUD — `getGoalsByPortfolio`, `getGoalById`, `createGoal`, `updateGoal`, `deleteGoal`, `deleteGoalsByPortfolio`, plus `createGoalsFromOnboarding` (legacy bridge for onboarding flow)
  - Deleted old `convex/goals.ts` (single-row-per-portfolio model replaced)
  - Frontend: new `components/portfolio-goals.tsx` with SVG half-radial gauge cards — 180° arc gauges with gradient fill, tick marks, animated `pathLength` reveal via Framer Motion, status labels (GETTING STARTED → IN PROGRESS → ON TRACK → COMPLETE → EXCEEDED)
  - Goal cards: accent top-line, icon badge, current→target display, deadline/notes footer, hover-reveal edit/delete actions
  - Add Goal dialog: `ResponsiveDialog` 3-step flow (Type → Details → Confirm) with card selector auto-advance, type badge with "Change" button, $/%  prefix inputs, optional deadline/notes, confirm step with preview gauge
  - Edit Goal dialog: `ResponsiveDialog` 2-step flow (Details → Confirm) with read-only type badge
  - Summary bar: completed/near-target counts, next deadline display
  - Empty state: dashed border card with Target icon and "Create Your First Goal" CTA
  - Added "Goals" tab to portfolio page between Analytics and Vault
  - Removed `GoalTracker` from `components/vault.tsx`, simplified `V2VaultProps` (removed `portfolioValue`/`annualReturn`), changed vault grid from 3-col to 2-col
  - Updated `components/onboarding-flow.tsx` to use `api.portfolioGoals.createGoalsFromOnboarding`
  - Files: `convex/schema.ts`, new `convex/portfolioGoals.ts`, deleted `convex/goals.ts`, new `components/portfolio-goals.tsx`, `app/(webapp)/portfolio/[id]/page.tsx`, `components/vault.tsx`, `components/onboarding-flow.tsx`

- [x] **Step 16 — Global search**
  - Convex: added search indexes to `portfolios` (by name), `assets` (by name), `userDocuments` (by fileName), `userArticles` (by title)
  - New `convex/search.ts` with `globalSearch` query — searches 6 categories in parallel:
    - **Portfolios**: search by name (via search index), includes risk tolerance + time horizon + description in subtitle
    - **Assets**: search by name (search index) + symbol/ticker (filter scan) + notes content (filter scan), deduplicated and merged with name matches prioritized
    - **Documents**: search by fileName (search index) + document type (filter scan) + format (filter scan), merged with deduplication
    - **Articles**: search by title (search index) + URL (filter scan) + notes content (filter scan), merged with deduplication
    - **Market Data**: searches `marketCurrentData` by ticker + name, and `marketBenchmarks` by ticker + name, includes live price + change% in subtitle
    - **Quick Actions**: static navigation items (Settings, News, Watchlist, Dashboard, Earnings, Research) with keyword-based fuzzy matching — e.g. typing "dark mode" surfaces Settings, "earnings" surfaces Earnings Calendar
  - Frontend: new `components/command-palette.tsx` — portal-rendered command palette
    - Triggered by ⌘K / Ctrl+K (global keyboard listener via `useCommandPalette` hook)
    - Framer Motion scale-in entrance with dark glass backdrop (`bg-black/70 backdrop-blur-[6px]`)
    - Monospace search input (`font-mono`) at top with real-time debounced search (180ms)
    - Results grouped by category with colored accent bars: gold (portfolios), green (assets), blue (documents), amber (articles), purple (market data), slate (quick actions)
    - Each result row: colored icon badge (shifts to duotone on selection) + title + subtitle + enter-key hint
    - Full keyboard navigation: ↑↓ arrow keys, Enter to select, Escape to close
    - Mouse hover updates selection, click navigates
    - Loading state: skeleton rows with staggered pulse animation
    - Empty state: "No results" with search term echo in monospace
    - Idle state: compass icon with "Search across your workspace" hint
    - Footer bar: keyboard shortcut legend (navigate / open / close) + result count in monospace
    - External links (articles) open in new tab, internal links use `router.push`
    - Body scroll lock while open, focus trap on input
  - Header integration: replaced static search `<motion.button>` with `SearchNavButton` component — uses `NavItem`-style expand-on-hover pattern (icon only → expands to show "Search" label + `⌘K` kbd badge on hover)
  - Mobile: search button in top bar opens the same command palette (works as full-width overlay at `12vh` from top)
  - Files: `convex/schema.ts`, new `convex/search.ts`, new `components/command-palette.tsx`, `components/header.tsx`

### Phase 5: Command System (`@` Routing)

> **Status**: Planned — builds on Step 16's command palette infrastructure. The palette is already a portal-rendered dialog with keyboard navigation and category rendering. Phase 5 extends it from "search and navigate" to "search, navigate, AND execute actions."

- [ ] **Step 17 — Command parser + `@` mode switching**
  - Detect `@` prefix in search input → switch palette into **command mode**
  - Parse input as `@namespace [subcommand] [args]` (e.g. `@market AAPL`, `@settings theme dark`)
  - When user types `@`, show all available namespaces as selectable cards (replacing search results)
  - When a namespace is selected (click or type), filter to that namespace's subcommands
  - Visual mode indicator: colored namespace badge appears in the input bar (e.g. `[@market]` in purple pill), input placeholder changes to namespace-specific hint
  - Tab key auto-completes the current namespace/subcommand suggestion
  - Backspace on empty subcommand exits back to namespace selector
  - Files: `components/command-palette.tsx` (extend existing component)

- [ ] **Step 18 — `@portfolio` namespace**
  - **Subcommands**:
    - `@portfolio list` — list all portfolios with value + change (quick nav to each)
    - `@portfolio create` — opens Create Portfolio dialog inline or navigates to dashboard with dialog pre-opened
    - `@portfolio [name]` — fuzzy search portfolios by name, select to navigate
    - `@portfolio [name] summary` — triggers AI portfolio summary generation, shows loading → result inline in palette
    - `@portfolio [name] analytics` — navigates to portfolio's Analytics tab
    - `@portfolio [name] goals` — navigates to portfolio's Goals tab
    - `@portfolio [name] holdings` — navigates to portfolio's Holdings tab
  - Convex: may reuse existing `api.portfolios.getUserPorfolios` and `api.ai.generateAiPortfolioSummary`
  - UI: results render as portfolio cards with value/change inline; summary results render as expandable markdown preview
  - Files: `components/command-palette.tsx`, potentially new `lib/command-handlers.ts`

- [ ] **Step 19 — `@market` namespace**
  - **Subcommands**:
    - `@market [TICKER]` — look up current price, change%, type, name from `marketCurrentData` table; if not found, attempt live fetch via market data service
    - `@market [TICKER] price` — show just the price in a bold display format
    - `@market [TICKER] chart` — navigate to watchlist page with ticker pre-selected (or open inline sparkline if data available in `marketHistoricData`)
    - `@market [TICKER] add` — add ticker to watchlist (when watchlist feature is fully built)
    - `@market benchmarks` — show all benchmark data (S&P 500, NASDAQ, etc.) with live prices + change%
    - `@market insiders [TICKER]` — look up insider trading activity (requires new external API integration — SEC EDGAR or similar)
  - Convex: reuse `api.marketData.getBenchmarkData`, `marketCurrentData` queries; new `api.marketData.lookupTicker` action for live API calls
  - UI: price results render as large monospace numbers with green/red change indicators; benchmark results as a mini table
  - External API dependency: insider trading data requires SEC EDGAR API or alternative (e.g. finnhub.io insider transactions endpoint)
  - Files: `components/command-palette.tsx`, `convex/marketData.ts` (new queries), potentially new `convex/insiders.ts`

- [ ] **Step 20 — `@news` namespace**
  - **Subcommands**:
    - `@news` / `@news latest` — show latest news headlines (from market data service), select to open article
    - `@news search [term]` — search saved articles by term (reuses existing article search from Step 16)
    - `@news summary` — show latest AI news summary (from `marketNewsSummary` table), or trigger generation if stale (> 24h)
    - `@news sentiment` — generate market sentiment analysis via AI service; show inline result with sentiment score (bullish/neutral/bearish) + key factors
    - `@news refresh` — trigger `api.ai.generateAiNewsSummary` action, show loading state → confirmation
  - Convex: reuse `api.ai.getAiNewsSummary`, `api.ai.triggerAiNewsSummaryUpdate`; new `api.ai.generateSentimentAnalysis` action (calls AI service with sentiment-specific prompt)
  - UI: news results render as article rows with source + timestamp; sentiment result renders as colored gauge (red → amber → green) with analysis text
  - Files: `components/command-palette.tsx`, `convex/ai.ts` (new sentiment action)

- [ ] **Step 21 — `@settings` namespace**
  - **Subcommands**:
    - `@settings` — navigate to settings page
    - `@settings theme [dark|light]` — toggle theme immediately (calls `setTheme` from `next-themes` + persists via `api.users.updateUserPreferences`)
    - `@settings currency [USD|EUR|GBP|...]` — change base currency
    - `@settings language [en|...]` — change display language
    - `@settings export [json]` — trigger data export (same as settings page export button)
    - `@settings ai [default|openrouter|self-hosted]` — switch AI provider
  - Convex: reuse `api.users.updateUserPreferences` mutation
  - UI: toggle commands show immediate visual confirmation in the palette (e.g. "Theme → Dark ✓"); settings that require page context navigate to settings with the section pre-scrolled
  - State management: theme toggle needs access to `next-themes` context; palette component will need a callback prop or context bridge for settings mutations
  - Files: `components/command-palette.tsx`, potentially `lib/command-handlers.ts`

- [ ] **Step 22 — `@watchlist` namespace**
  - **Subcommands**:
    - `@watchlist` — navigate to watchlist page
    - `@watchlist add [TICKER]` — add a symbol to the watchlist (requires watchlist CRUD — currently the watchlist page is a stub with no backend)
    - `@watchlist remove [TICKER]` — remove from watchlist
    - `@watchlist list` — show all watched symbols with current prices
  - **Prerequisite**: watchlist backend must be built first — need a `watchlist` table in schema with `userId`, `ticker`, `addedAt` fields, plus CRUD mutations
  - Convex: new `convex/watchlist.ts` with `addToWatchlist`, `removeFromWatchlist`, `getWatchlist` queries/mutations; new `watchlist` table in schema
  - Files: `convex/schema.ts`, new `convex/watchlist.ts`, `components/command-palette.tsx`, `app/(webapp)/watchlist/page.tsx` (full rebuild)

- [ ] **Step 23 — `@ai` namespace**
  - **Subcommands**:
    - `@ai portfolio [name]` — generate AI portfolio analysis (same as `@portfolio [name] summary`)
    - `@ai news` — generate AI news summary (same as `@news summary`)
    - `@ai sentiment` — generate market sentiment analysis (same as `@news sentiment`)
    - `@ai compare [portfolio1] [portfolio2]` — compare two portfolios side by side (new AI prompt)
    - `@ai risk [portfolio]` — focused risk analysis for a portfolio
    - `@ai rebalance [portfolio]` — AI-suggested rebalancing for a portfolio
  - These are convenience aliases that route to the same underlying AI actions, plus new comparison/risk/rebalance prompts
  - Convex: new action endpoints in `convex/ai.ts` for comparison, risk analysis, rebalance suggestions
  - UI: results render as expandable markdown cards with copy-to-clipboard button; long-running actions show a pulsing "Generating..." state
  - Files: `convex/ai.ts`, `components/command-palette.tsx`

#### Command System Architecture Notes

- **Parser**: Simple tokenizer — split input on first `@`, then split remainder on spaces. First token is namespace, rest is subcommand + args. No complex grammar needed.
- **Handler registry**: `Map<string, CommandHandler>` where each handler receives `{ subcommand: string, args: string[], userId: Id<"users"> }` and returns `{ type: "results" | "action" | "navigation" | "inline", data: any }`.
- **Result types**:
  - `results` — render as standard search result rows (navigate on select)
  - `action` — execute a mutation/action, show confirmation inline
  - `navigation` — immediately navigate to a route
  - `inline` — render rich content inline in the palette (markdown, charts, gauges)
- **Loading states**: Each handler can be async. Show skeleton specific to the result type while loading.
- **Error handling**: Errors render as a red-accent row in the palette with the error message + "Try again" action.
- **Telemetry**: Log command usage to understand which commands are popular (PostHog events: `command_executed`, `command_error`).

#### Files Touched Summary (Phase 5)

| File | Change |
|---|---|
| `components/command-palette.tsx` | Command parser, namespace mode UI, handler dispatch, inline result rendering |
| `lib/command-handlers.ts` | **NEW** — handler registry, individual namespace handlers |
| `convex/schema.ts` | Add `watchlist` table (Step 22) |
| `convex/watchlist.ts` | **NEW** — watchlist CRUD (Step 22) |
| `convex/ai.ts` | New actions: sentiment analysis, portfolio comparison, risk analysis, rebalance suggestions (Steps 20, 23) |
| `convex/marketData.ts` | New query for ticker lookup by partial match (Step 19) |
| `convex/insiders.ts` | **NEW** — SEC EDGAR / finnhub insider trading integration (Step 19) |
| `app/(webapp)/watchlist/page.tsx` | Full rebuild to use watchlist backend (Step 22) |

---

### Phase 6: Settings Revamp (Sectioned Control Room)

> **Status**: ✅ Complete — aligns Settings with the News/Home/Portfolio DNA and expands available controls.
> **Aesthetic**: Mission Control Minimalism — Bloomberg terminal meets modern control panel. Dense but legible, with monospace section headers, status dots, and armed/disarmed indicators.

#### Schema Additions (Phase 6)

All new fields are **optional** on `userPreferences` (non-breaking):
- `marketRegion: optional(string)` — preferred market region
- `aiSummaryFrequency: optional("12h" | "daily" | "weekly" | "monthly" | "manual")` — portfolio AI summary generation cadence
- `earningsReminders: optional(boolean)` — earnings calendar reminders
- `marketPulseEnabled: optional(boolean)` — AI Market Pulse notification toggle
- `marketPulseChannel: optional("email" | "discord" | "telegram")` — notification delivery channel
- `marketPulseWebhookUrl: optional(string)` — Discord webhook URL or Telegram bot URL

New table for multi-currency conversion:
- `fxRates: { base: string, rates: any, updatedAt: number }` — single EUR-based document, updated daily via cron

#### Steps

- [x] **Step 24 — Settings page architecture + layout system**
  - New **sectioned grid** with asymmetric panels and ticker-strip subrows
  - Add **Settings Pulse Strip** header (live status: last sync, FX rate date, active currency, default portfolio)
  - Each section uses: title + muted description + compact rows with dividers
  - Shared primitives extracted: `Section`, `SettingRow`, `Toggle`, `StatusDot`
  - Files: `app/(webapp)/settings/page.tsx`, new `components/settings/settings-primitives.tsx`

- [x] **Step 25 — Identity & Profile section**
  - Profile essentials: display name, avatar (from Clerk), risk profile, time horizon
  - Default portfolio selector + "include in net worth" toggle
  - Compact summary card with current configuration
  - Files: `components/settings/identity-section.tsx` (new), `app/(webapp)/settings/page.tsx`

- [x] **Step 26 — Data & Market Feeds section**
  - Base currency selector (searchable, 40+ currencies with flags — powered by `lib/currency.ts`)
  - Market region preference (US, EU, Asia-Pacific, Africa, Global)
  - Currency selector wired to `useCurrency` hook — changes trigger Convex-side FX conversion
  - Files: `components/settings/data-section.tsx` (new)

- [x] **Step 27 — Notifications & Alerts section**
  - **AI Market Pulse** — daily/weekly AI-generated market summary delivered to your inbox, Discord, or Telegram
    - Toggle: enable/disable Market Pulse
    - Channel selector: Email / Discord / Telegram
    - Webhook URL input (for Discord/Telegram — masked, with test button)
    - Preview: "You'll receive a concise AI market brief every morning at 8:00 AM"
  - Earnings calendar reminders toggle
  - "Armed" indicator row in ticker-strip style showing active notification channels
  - Files: `components/settings/alerts-section.tsx` (new)

- [x] **Step 28 — Command & Search section (partial — search updated, command section deferred to Phase 5)**
  - ⌘K behavior (open on global, scope defaults)
  - `@` command namespace toggles (depends on Phase 5 completion)
  - Quick action defaults (News/Portfolio/Watchlist priority)
  - Files: `components/settings/command-section.tsx` (new)

- [x] **Step 29 — AI & Research section**
  - Portfolio AI summary frequency selector: `12h` / `daily` / `weekly` / `monthly` / `manual trigger only`
  - BYOAI provider config (moved from current settings — Default / OpenRouter / Self-Hosted)
  - OpenRouter API key input (masked) + Self-Hosted tunnel config
  - Files: `components/settings/ai-section.tsx` (new)

- [x] **Step 30 — Danger / Advanced section**
  - Data export (JSON) — moved from current settings
  - CSV, PDF, Excel export (disabled, coming soon)
  - Clear cache / reset search index
  - Delete account (destructive, gated behind confirmation dialog with red border)
  - Files: `components/settings/advanced-section.tsx` (new)

#### Files Touched Summary (Phase 6)

| File | Action |
|---|---|
| `convex/schema.ts` | Edit — add `fxRates` table + new `userPreferences` fields |
| `convex/users.ts` | Edit — handle new fields in `updateUserPreferences` |
| `convex/fx.ts` | Create — pure `convert()` + `resolveAssetCurrency()` utility |
| `convex/marketData.ts` | Edit — add `fetchFxRates` action, `storeFxRates` mutation, `getFxRates` query, `getFxRatesInternal` query; thread FX conversion into `getHistoricalData` + `calculatePortfolioValueAtDate` |
| `convex/portfolios.ts` | Edit — thread FX conversion into `getUserPortfolios` + `getPortfolioById` via `loadFxContext` + `toBase` helpers |
| `convex/crons.ts` | Edit — add daily `fetchFxRates` cron |
| `lib/currency.ts` | Create — `formatMoney`, `formatCompact`, `formatPercent`, `currencySymbol`, `searchCurrencies` + `CURRENCIES` metadata (40+ currencies with flags/symbols/decimals) |
| `hooks/useCurrency.ts` | Create — reads user's `currency` pref from Convex, returns `{ format, compact, percent, symbol, currency, loading }` |
| `components/hero-split.tsx` | Edit — replace hardcoded `$` with `useCurrency` hook |
| `components/portfolio-card.tsx` | Edit — replace hardcoded `$` with `useCurrency` hook |
| `components/holdings.tsx` | Edit — replace hardcoded `$` with `useCurrency` hook |
| `components/settings/settings-primitives.tsx` | Create — shared `Section`, `SettingRow`, `Toggle`, `StatusDot` |
| `components/settings/identity-section.tsx` | Create — profile & identity settings |
| `components/settings/data-section.tsx` | Create — currency, market region |
| `components/settings/alerts-section.tsx` | Create — Market Pulse notifications, earnings reminders |
| `components/settings/command-section.tsx` | Create — ⌘K and `@` command prefs |
| `components/settings/ai-section.tsx` | Create — AI summary frequency, BYOAI provider |
| `components/settings/advanced-section.tsx` | Create — export, cache, danger zone |
| `app/(webapp)/settings/page.tsx` | Overwrite — rebuilt with pulse strip + all sections |

---

## Dependency Graph

```
Phase 1 (Steps 1–4) ─── all independent, do in parallel
Step 5  ─── independent
Step 6  ─── independent (Convex + frontend)
Step 7  ─── independent
Step 8  ─── independent
Step 9  ─── depends on Step 8 (uses MovingTicker)
Step 10 ─── independent (shared component)
Steps 11–14 ─── depend on Step 10 (use ResponsiveDialog)
Step 15 ─── independent (schema change is standalone)
Step 16 ─── independent (but do last — most complex)
Step 17 ─── depends on Step 16 (extends command palette)
Steps 18–23 ─── depend on Step 17 (use command parser + handler registry)
Step 22 ─── requires watchlist backend (new schema table + CRUD)
Step 19 (insiders) ─── requires external API key (SEC EDGAR or finnhub)
Step 23 ─── depends on Steps 20 + 18 (reuses AI actions from both)
```

### Phase 7: Internationalization (`next-intl`)

> **Status**: Proposed — adds multi-language support using `next-intl` (App Router native, TypeScript-safe, ICU pluralization, number/date formatting).

- [ ] **Step 31 — Install `next-intl` + configure routing & middleware**
  - `pnpm add next-intl` — ~15KB, App Router native, maintained by Vercel-adjacent devs
  - Create `i18n/request.ts` — next-intl request config (reads locale from cookie/header, fallback to `en`)
  - Create `i18n/routing.ts` — supported locales list (`en`, `es`, `fr`, `de`, `ja`, `zh`, `pt`, `ar`), default locale `en`
  - Update `middleware.ts` — integrate `createMiddleware` from `next-intl/middleware` with existing Clerk middleware (chain them)
  - Update `next.config.mjs` — add `createNextIntlPlugin` wrapper
  - Files: new `i18n/request.ts`, new `i18n/routing.ts`, `middleware.ts`, `next.config.mjs`

- [ ] **Step 32 — Create English message file (full coverage)**
  - Create `messages/en.json` — namespace-structured translations covering all UI areas:
    - `common` — buttons (Save, Cancel, Delete, Edit, Close, Refresh), labels, empty states
    - `nav` — header items (Dashboard, News, Settings, Search), mobile nav
    - `dashboard` — Total Net Worth, Your Portfolios, Market Benchmarks, AI Market Intelligence
    - `portfolio` — Holdings, Analytics, Goals, Vault, risk tolerance labels, time horizon labels
    - `assets` — asset types (Stock, Crypto, Bond, etc.), Add Asset dialog steps, Edit Asset fields
    - `goals` — goal types, status labels (GETTING STARTED → EXCEEDED), Add/Edit Goal dialogs
    - `settings` — section titles, field labels, AI provider options, currency/language selectors
    - `news` — headlines, sources, timestamps, AI summary labels
    - `search` — command palette text, category labels, keyboard shortcuts
    - `auth` — sign in/up, onboarding steps
    - `errors` — validation messages, API errors, not found states
    - `formats` — date patterns, number patterns (used by `next-intl`'s `formatNumber`/`formatDateTime`)
  - Files: new `messages/en.json`

- [ ] **Step 33 — Create starter translation files for 7 languages**
  - Copy `en.json` structure to: `es.json`, `fr.json`, `de.json`, `ja.json`, `zh.json`, `pt.json`, `ar.json`
  - Translate `common`, `nav`, and `dashboard` namespaces (highest-impact surface area)
  - Leave other namespaces as English placeholders with `// TODO: translate` markers
  - Arabic (`ar.json`) — add RTL metadata, ensure layout system respects `dir="rtl"` when active
  - Files: new `messages/{es,fr,de,ja,zh,pt,ar}.json`

- [ ] **Step 34 — Wire `NextIntlClientProvider` into app layout**
  - Update `app/layout.tsx` — wrap with `NextIntlClientProvider`, pass `messages` and `locale`
  - Set `<html lang={locale}>` dynamically based on user preference
  - For `ar` locale, set `<html dir="rtl">` automatically
  - Read locale from user preferences (`userPreferences.language`) via Convex, sync with next-intl
  - Files: `app/layout.tsx`

- [ ] **Step 35 — Migrate core components to `useTranslations`**
  - Priority order (highest visibility first):
    1. `components/header.tsx` — nav labels
    2. `components/hero-split.tsx` — "Total Net Worth", "today across X portfolios"
    3. `components/ticker.tsx` — market status labels
    4. `components/ai-card.tsx` — "AI Market Intelligence", "Read Full Analysis", "Refresh"
    5. `components/portfolio-card.tsx` — "today", asset count labels
    6. `components/holdings.tsx` — column headers, type labels, "alloc", "avg buy", "current"
    7. `components/tabs.tsx` — tab labels
    8. `app/(webapp)/page.tsx` — "Your Portfolios", "Market Benchmarks", "active"
    9. `app/(webapp)/portfolio/[id]/page.tsx` — section headers, stat labels
    10. `app/(webapp)/news/page.tsx` — news page headers
  - Use `useTranslations('namespace')` hook pattern — e.g. `const t = useTranslations('dashboard')`
  - For pluralization: `t('portfolioCount', { count: portfolioCount })`
  - For number formatting: integrate with `useCurrency` hook (currency-aware `formatNumber`)
  - Files: all components listed above

- [ ] **Step 36 — Migrate dialogs and forms to `useTranslations`**
  - `components/add-asset-dialog.tsx` — step labels, field labels, type options, confirm text
  - `components/edit-asset-dialog.tsx` — field labels, save/cancel
  - `components/create-portfolio-dialog.tsx` — step labels, risk tolerance options, time horizon options
  - `components/edit-portfolio-dialog.tsx` — field labels
  - `components/portfolio-goals.tsx` — goal type labels, status labels, Add/Edit Goal dialogs
  - `components/vault.tsx` — document/article labels, upload dialog
  - `components/command-palette.tsx` — search placeholder, category labels, keyboard hints
  - `components/transaction-dialog.tsx` — transaction type labels, field labels
  - Files: all dialog components

- [ ] **Step 37 — Language picker in settings**
  - Searchable language selector (reuse combobox pattern from currency picker)
  - Each option: flag emoji + native language name + English name (e.g. "🇯🇵 日本語 — Japanese")
  - Preview: show a sample translated string live as user hovers options
  - Saves to `userPreferences.language` in Convex
  - On change: update next-intl locale cookie, trigger page reload for server components
  - Files: `components/settings/language-section.tsx` (new), settings page

### Phase 8: BYOAI Tunnel (Go CLI + Embedded Web UI)

> **Status**: Proposed — enables users to connect their own AI (Ollama, LM Studio, etc.) to PulsePortfolio via an encrypted tunnel.

#### Architecture Overview

The BYOAI system has **three tiers**:
1. **Default** — Uses PulsePortfolio's hosted AI service (OpenRouter → Grok). No config needed.
2. **Bring Your Own Key** — User provides an OpenRouter API key. Backend proxies through their key instead.
3. **Self-Hosted Tunnel** — User runs `pulse-tunnel` CLI on their machine. It opens a persistent WebSocket tunnel from their local Ollama/LM Studio to PulsePortfolio's backend. All AI requests route through the tunnel to the user's local model.

#### Tunnel CLI (`pulse-tunnel`) — Go Binary

- [ ] **Step 38 — Go module scaffolding + CLI entry point**
  - Initialize `tunnel/` directory as a Go module (`go mod init github.com/pulseportfolio/pulse-tunnel`)
  - CLI using Go `flag` package (no cobra dependency — keep binary small):
    - `--token` — Auth token (from PulsePortfolio settings page)
    - `--ollama-url` — Local Ollama endpoint (default: `http://localhost:11434`)
    - `--backend-url` — PulsePortfolio backend WebSocket endpoint (default: `wss://tunnel.pulsefolio.net`)
    - `--port` — Local web UI port (default: `9876`)
    - `--headless` — Skip opening browser, run in terminal-only mode
    - `--verbose` — Debug logging
  - On start: validate token → discover local Ollama → open WebSocket tunnel → serve embedded web UI → auto-open browser
  - Files: new `tunnel/cmd/pulse-tunnel/main.go`, new `tunnel/go.mod`

- [ ] **Step 39 — WebSocket tunnel client**
  - Persistent WebSocket connection to backend with:
    - TLS encryption (standard `wss://`)
    - Token-based auth in initial handshake headers
    - Heartbeat ping/pong every 30s (detect dead connections)
    - Exponential backoff reconnect (1s → 2s → 4s → ... → 60s max)
    - Connection state machine: `CONNECTING` → `AUTHENTICATING` → `CONNECTED` → `DISCONNECTED`
  - Message protocol (JSON over WebSocket):
    - Backend → Tunnel: `{ type: "ai_request", id: "uuid", payload: { messages, model, temperature, max_tokens } }`
    - Tunnel → Backend: `{ type: "ai_response", id: "uuid", payload: { content, model, tokens_used, processing_time_ms } }`
    - Tunnel → Backend: `{ type: "ai_error", id: "uuid", error: "message" }`
    - Bidirectional: `{ type: "ping" }` / `{ type: "pong" }`
    - Tunnel → Backend: `{ type: "status", models: ["llama3.2", "mistral"], ollama_version: "0.6.1" }`
  - Files: new `tunnel/internal/tunnel/client.go`

- [ ] **Step 40 — Ollama proxy + API translation**
  - Proxy handler: receives AI requests from WebSocket, forwards to local Ollama
  - Translation layer (OpenAI Chat Completions format ↔ Ollama API):
    - Maps `messages` array (role/content) to Ollama's `/api/chat` format
    - Maps `model` names (e.g. "llama3.2:latest") to Ollama model tags
    - Extracts token counts from Ollama response (`eval_count`, `prompt_eval_count`)
    - Handles streaming responses (Ollama streams by default) — buffers and sends complete response
  - Local Ollama discovery: `GET http://localhost:11434/api/tags` to list available models
  - Health check: verify Ollama is running before establishing tunnel
  - Files: new `tunnel/internal/proxy/handler.go`, new `tunnel/internal/proxy/translate.go`

- [ ] **Step 41 — Embedded web dashboard**
  - Go `embed` package to bundle a tiny HTML/CSS/JS dashboard into the binary
  - Dashboard served on `localhost:9876` (configurable via `--port`)
  - Features:
    - **Connection status** — green/amber/red indicator with live state name
    - **Token input** — paste tunnel token from settings page (saved to local config file)
    - **Ollama config** — URL field, model selector (populated from Ollama's `/api/tags`)
    - **Connection log** — scrolling log of tunnel events (connected, request proxied, errors)
    - **Stats** — requests proxied, avg response time, uptime
  - Design: dark theme matching PulsePortfolio DNA (zinc backgrounds, gold accents, monospace type)
  - Auto-opens in default browser on start (unless `--headless`)
  - Files: new `tunnel/internal/web/dashboard.html`, new `tunnel/internal/web/server.go`

- [ ] **Step 42 — Auth, config persistence, and Makefile**
  - Token auth: validate token against backend's `/tunnel/validate` endpoint on connect
  - Config file: `~/.config/pulse-tunnel/config.json` — persists token, Ollama URL, port, last-used model
  - Makefile targets: `build` (current OS), `build-all` (cross-compile for linux/darwin/windows × amd64/arm64), `release` (versioned binaries + checksums)
  - README.md with: quick start, requirements (Go 1.22+, Ollama running), architecture diagram, troubleshooting
  - Files: new `tunnel/internal/auth/token.go`, new `tunnel/internal/config/config.go`, new `tunnel/Makefile`, new `tunnel/README.md`

#### Backend AI Service Changes (for tunnel routing)

- [ ] **Step 43 — AI service tunnel endpoint + routing logic**
  - New WebSocket endpoint in AI service: `/tunnel/connect` — accepts tunnel connections, validates tokens
  - Tunnel registry: in-memory map of `tunnel_id → WebSocket connection`
  - Modified request flow in `ai_client.py`:
    1. Check user's `aiProvider` preference (from request header or lookup)
    2. If `"default"` → route to OpenRouter (existing behavior)
    3. If `"openrouter_byokey"` → route to OpenRouter with user's API key (from `openRouterApiKey`)
    4. If `"self_hosted"` → look up tunnel by `tunnelId`, send request through WebSocket, await response
  - Token generation: new endpoint `POST /tunnel/generate-token` — creates a signed JWT with `user_id` + `tunnel_id` claim
  - Files: AI service `main.py`, `ai_client.py`, new `tunnel_manager.py`

#### Frontend Settings UI (BYOAI)

- [ ] **Step 44 — AI provider settings section**
  - Three-option radio card selector:
    - **PulsePortfolio AI** (default) — "Powered by Grok via OpenRouter. No setup needed."
    - **Bring Your Own Key** — OpenRouter API key input (masked, with test connection button)
    - **Self-Hosted** — Tunnel setup: shows tunnel token (generate/regenerate), connection status (live via Convex query), model selector (populated from tunnel's reported models), download link for `pulse-tunnel` binary
  - Saves to `userPreferences.aiProvider`, `openRouterApiKey`, `tunnelId`
  - Connection status indicator: green pulse when tunnel is connected, amber when reconnecting, red when offline
  - Files: `components/settings/ai-section.tsx` (new)

---

## Changelog

| Date | Steps | Notes |
|---|---|---|
| 2026-02-09 | 1, 2, 3, 4 | Phase 1 complete — AI card, holdings header, delete portfolio, vault search |
| 2026-02-09 | 5, 6, 7 | Phase 2 partial — allocation bar, article notes+edit, document upload dialog |
| 2026-02-09 | 8 | Moving ticker strip component — infinite marquee with CSS animation |
| 2026-02-09 | 9 | News page header redesign — V2HeroSplit + V2MovingTicker, editorial masthead matching homepage DNA |
| 2026-02-09 | 10, 11, 12, 13, 14 | Phase 3 complete — ResponsiveDialog base component, all 4 dialog redesigns migrated, surfaced `includeInNetworth`/`allowSubscriptions` schema fields, fixed delete portfolio crash |
| 2026-02-09 | 15 | Phase 4 partial — Goals tab redesign: renamed `goals` → `portfolioGoals` table, multi-goal CRUD, SVG half-radial gauge cards, Add/Edit dialogs, summary bar, moved goals out of Vault into own tab |
| 2026-02-09 | 16 | Global search — search indexes on 4 tables, `globalSearch` query (6 categories: portfolios, assets by name+symbol+notes, documents by fileName+type+format, articles by title+URL+notes, market data by ticker+name, quick actions with keyword matching), command palette component with ⌘K trigger, keyboard navigation, categorized results with colored accent bars, SearchNavButton expand-on-hover pattern in header |
| 2026-02-10 | — | **Multi-currency conversion (server-side)** — `convex/fx.ts` (pure `convert` + `resolveAssetCurrency`, 6-line EUR cross-rate formula), `fxRates` table (single document, EUR-based, daily cron via `fetchFxRates` action → market-data `/fx` endpoint), `loadFxContext` helper reads user's base currency from `userPreferences` + FX rates in one call, threaded into `getUserPortfolios`, `getPortfolioById`, `getHistoricalData`, `calculatePortfolioValueAtDate` — every monetary value now converted from asset's native `currency` field to user's `baseCurrency`. Client side: `lib/currency.ts` (40+ currencies with metadata, `formatMoney`/`formatCompact`/`formatPercent`/`currencySymbol`/`searchCurrencies` via `Intl.NumberFormat` with formatter cache), `hooks/useCurrency.ts` (reads preference, returns `{ format, compact, percent, symbol, currency }`). Components updated: `hero-split.tsx`, `portfolio-card.tsx`, `holdings.tsx`. Schema: `userPreferences` extended with `marketRegion`, `aiSummaryFrequency`, `earningsReminders`, `marketPulseEnabled/Channel/WebhookUrl`. |
| 2026-02-10 | 24–30 | **Phase 6 complete + polish pass** — Settings: tabbed layout (V2Tabs: Profile, Data & Markets, Alerts, AI, Advanced), PulseStrip telemetry bar, all Phase 6 fields wired to Convex mutations, save/discard sticky bar. Identity section: avatar+name+email from Clerk, **fixed Manage Account** button (now uses `useClerk().openUserProfile()` instead of broken DOM selector). Data section: searchable CurrencyPicker (40+ currencies with flags), market region selector, FX sync status. Alerts: Market Pulse toggle/channel/webhook. AI: summary frequency + BYOAI config. Advanced: JSON export, cache clear, delete-account gate. |
| 2026-02-10 | — | **Portfolio page currency conversion** — Replaced all hardcoded `$` + `toLocaleString` in portfolio detail header (`portfolio/[id]/page.tsx`) with `useCurrency().format()`. **Moved percentage change** from next-to-name to next-to-value for better visual hierarchy. Stats row (Top Holding value) also converted. |
| 2026-02-10 | — | **Add Asset dialog — currency prompt for ALL types** — Added searchable `AssetCurrencyPicker` (full 42-currency list with flags) to the Details step for every asset type (stock, crypto, cash, bond, real estate, commodity), not just cash. Defaults to user's base currency. Currency is now passed to `createAsset` for all types. |
| 2026-02-10 | — | **Edit Asset dialog — full currency list** — Replaced hardcoded 7-currency `<Select>` with same searchable `EditCurrencyPicker` component. Currency field shown for ALL asset types. Currency symbol in price input dynamically reflects selected currency. Confirm step shows full currency info with flag+name. |
| 2026-02-10 | — | **Holdings table — expandable rows** — Replaced hidden `DotsThree` dropdown menu with **click-to-expand row pattern**. Clicking a holding row reveals an inline panel with: info grid (quantity, avg buy, current price, total value), action buttons (Transactions, Edit, Delete). No more hidden dots. Added `CaretDown` chevron with rotation animation as expand indicator. |
| 2026-02-10 | — | **FX conversion badge** — When an asset's native currency differs from the user's display currency, a small `⇄ USD→GBP` amber pill badge appears next to the asset name in the holdings table (`ArrowsLeftRight` icon + currency codes). |
| 2026-02-10 | — | **Portfolio Analytics accordion** — Refactored `V2Analytics` into 5 collapsible `AccordionSection` components (Performance Metrics, Rolling Returns, Best & Worst Periods, Risk Analysis, Benchmark Comparison). Only Performance Metrics is open by default. Each section has chevron with smooth rotation animation and height-based open/close via `motion/react`. |
| 2026-02-10 | — | **Search updates** — Added `nav-currency` quick action to `convex/search.ts` with 30+ currency-related keywords (all major currency names/codes). Asset search now includes currency code matches (`assetsByCurrency` batch). Asset result subtitles now include non-USD currency codes. Command palette placeholder updated to mention currencies. |