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

- [ ] **Step 5 — Asset allocation bar on portfolio page**
  - Create tooltip-based variant of `V2AllocationBar` (tooltips, no labels)
  - Use portfolio's asset type allocation data
  - Layout below stats: `[AI Card | Allocation Bar]` side by side
  - Files: `components/allocation-bar.tsx`, `app/(webapp)/portfolio/[id]/page.tsx`

- [ ] **Step 6 — Research links: notes + edit button**
  - Convex: update `saveArticle` to accept `notes`. Create `updateArticle` mutation (title, url, notes)
  - Frontend: notes textarea in add flow, edit button per article, inline edit or dialog
  - Files: `convex/articles.ts`, `components/vault.tsx`

- [ ] **Step 7 — Document upload dialog revamp**
  - Replace raw file input with drag-and-drop dialog
  - Add document type selector (7 types from schema)
  - Add confirm step before upload
  - Pass `type` to `uploadDocument` mutation
  - Files: `components/vault.tsx`

- [ ] **Step 8 — Moving ticker strip**
  - New `V2MovingTicker` component with CSS infinite scroll animation
  - Duplicate items for seamless loop, pause on hover
  - Files: new `components/moving-ticker.tsx`

- [ ] **Step 9 — News page header redesign**
  - Match hero-split DNA layout for title + AI card
  - Swap in `V2MovingTicker` (depends on Step 8)
  - Match ticker strip border language
  - File: `app/(webapp)/news/page.tsx`

### Phase 3: Dialog System Overhaul

- [ ] **Step 10 — Responsive dialog base component**
  - Extract mobile bottom-sheet / desktop modal pattern from `ai-summary-popup.tsx`
  - Reusable `ResponsiveDialog` with step indicator support
  - Reduce backdrop blur
  - File: new `components/responsive-dialog.tsx`

- [ ] **Step 11 — Create Portfolio dialog redesign**
  - Migrate to `ResponsiveDialog`
  - Steps: Name & Description → Strategy (risk, time horizon, includeInNetworth, allowSubscriptions) → Confirm
  - File: `components/create-portfolio-dialog.tsx`

- [ ] **Step 12 — Edit Portfolio dialog redesign**
  - Same `ResponsiveDialog` base
  - Surface `includeInNetworth` / `allowSubscriptions` from schema
  - File: `components/edit-portfolio-dialog.tsx`

- [ ] **Step 13 — Edit Asset dialog redesign**
  - Migrate to `ResponsiveDialog`
  - Steps: Asset Info → Pricing → Notes → Confirm
  - File: `components/edit-asset-dialog.tsx`

- [ ] **Step 14 — Add Asset dialog redesign**
  - Migrate to `ResponsiveDialog`
  - Steps: Type (keep card selector) → Asset Details → Purchase Info → Notes → Confirm
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