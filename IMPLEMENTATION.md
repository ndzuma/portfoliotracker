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
| Goals CRUD | `convex/goals.ts` |
| Main dashboard page | `app/page.tsx` |
| Portfolio detail page | `app/(webapp)/portfolio/[id]/page.tsx` |
| News page | `app/(webapp)/news/page.tsx` |
| Header (animated nav) | `components/header.tsx` |
| Tabs (ticker-DNA style) | `components/tabs.tsx` |
| Ticker strip | `components/ticker.tsx` |
| AI card | `components/ai-card.tsx` |
| AI summary popup | `components/ai-summary-popup.tsx` |
| Vault (goals, articles, docs) | `components/vault.tsx` |
| Add asset dialog | `components/add-asset-dialog.tsx` |
| Edit asset dialog | `components/edit-asset-dialog.tsx` |
| Create portfolio dialog | `components/create-portfolio-dialog.tsx` |
| Edit portfolio dialog | `components/edit-portfolio-dialog.tsx` |
| Allocation bar | `components/allocation-bar.tsx` |
| Holdings table | `components/holdings.tsx` |
| Analytics | `components/analytics.tsx` |
| Types | `components/types.ts` |

**Schema gaps the frontend doesn't use yet**:
- `userDocuments.type` — 7 document types defined in schema, never sent from frontend
- `userDocuments.format` — never populated
- `userArticles.notes` — field exists in schema, `saveArticle` mutation doesn't accept it
- `portfolios.includeInNetworth` / `portfolios.allowSubscriptions` — schema fields, not in any dialog
- `goals.targetYearlyReturn` — schema field, not surfaced in UI
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

- [ ] **Step 15 — Goals tab redesign**
  - Schema: consider new `portfolioGoals` table for multiple goals per portfolio, or extend current `goals` table
  - Convex: CRUD for individual goals
  - Frontend: "Goals" tab on portfolio page, goal cards with half-radial gauge charts
  - Add/Edit/Delete per goal
  - Files: `convex/schema.ts`, new `convex/portfolioGoals.ts`, `app/(webapp)/portfolio/[id]/page.tsx`, new goal components

- [ ] **Step 16 — Global search**
  - Convex: add search indexes to `portfolios`, `assets`, `userDocuments`, `userArticles`
  - New `convex/search.ts` with `globalSearch` query, results limited to top 5
  - Frontend: command palette (⌘K / Ctrl+K), categorized results, Framer Motion animation
  - Files: `convex/schema.ts`, new `convex/search.ts`, new `components/command-palette.tsx`, `components/header.tsx`

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
```

---

## Changelog

| Date | Steps | Notes |
|---|---|---|
| 2026-02-09 | 1, 2, 3, 4 | Phase 1 complete — AI card, holdings header, delete portfolio, vault search |
| 2026-02-09 | 5, 6, 7 | Phase 2 partial — allocation bar, article notes+edit, document upload dialog |
| 2026-02-09 | 8 | Moving ticker strip component — infinite marquee with CSS animation |
| 2026-02-09 | 9 | News page header redesign — V2HeroSplit + V2MovingTicker, editorial masthead matching homepage DNA |
| 2026-02-09 | 10, 11, 12, 13, 14 | Phase 3 complete — ResponsiveDialog base component, all 4 dialog redesigns migrated, surfaced `includeInNetworth`/`allowSubscriptions` schema fields, fixed delete portfolio crash |