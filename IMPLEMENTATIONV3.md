# Phase 7 — Internationalization (`next-intl`)

> **Scope**: Cookie-based i18n (no URL prefixes) using `next-intl` v4.8.2. Convex `userPreferences.language` is the source of truth; a `NEXT_LOCALE` cookie acts as a sync cache for server-side rendering. Proof-of-concept with **English (`en`) + Portuguese/Portugal (`pt`)** only.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Locale Flow                              │
│                                                                 │
│  Convex (source of truth)                                       │
│    userPreferences.language = "pt"                              │
│            │                                                    │
│            ▼                                                    │
│  useLocaleSync hook (client)                                    │
│    detects mismatch → sets NEXT_LOCALE cookie → reloads page    │
│            │                                                    │
│            ▼                                                    │
│  middleware.ts                                                  │
│    reads NEXT_LOCALE cookie → injects locale into response      │
│            │                                                    │
│            ▼                                                    │
│  i18n/request.ts                                                │
│    reads cookie → loads messages/{locale}.json                  │
│            │                                                    │
│            ▼                                                    │
│  NextIntlClientProvider (layout.tsx)                             │
│    provides messages + locale to all client components           │
│            │                                                    │
│            ▼                                                    │
│  useTranslations('namespace') in components                     │
│    t('key') → localized string                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why cookie-based, not URL-based?

- No `/en/`, `/pt/` URL prefixes — avoids restructuring the entire `app/` directory
- Clerk auth, PostHog tracking, and existing routes remain untouched
- Convex already stores `userPreferences.language` — we just sync it to a cookie
- Account switching works correctly: logout clears cookie, login reads new user's Convex preference

### Account switching edge case

| Scenario | What happens |
|---|---|
| User A (pt) logs out, User B (en) logs in | Cookie cleared on logout → set to `"en"` from User B's Convex prefs on login |
| User opens app in new browser (no cookie) | Defaults to `"en"` → Convex loads → sync hook sets correct cookie |
| User clears cookies | Same as above — Convex rehydrates the cookie on next auth |
| Unauthenticated pages (sign-in/sign-up) | No Convex prefs → falls back to browser `Accept-Language` header, then `"en"` |

---

## Key Files Reference

| Area | Path |
|---|---|
| Routing config (supported locales) | `i18n/routing.ts` |
| Server request config (cookie → messages) | `i18n/request.ts` |
| Next.js config (plugin wrapper) | `next.config.mjs` |
| Middleware (Clerk + locale chaining) | `middleware.ts` |
| English messages | `messages/en.json` |
| Portuguese messages | `messages/pt.json` |
| App layout (provider) | `app/layout.tsx` |
| Locale sync hook | `hooks/useLocaleSync.ts` |
| Language picker (settings) | `components/settings/language-section.tsx` |

---

## Steps

### Step 31 — Install `next-intl` + configure routing & middleware ✅

> **Status**: Complete

- [x] `next-intl` v4.8.2 already installed via `pnpm add next-intl`
- [x] Created `i18n/routing.ts` — supported locales list (`en`, `pt`), default locale `en`
- [x] Created `i18n/request.ts` — reads `NEXT_LOCALE` cookie via `cookies()`, validates against supported locales, dynamically imports `messages/{locale}.json`
- [x] Updated `next.config.mjs` — wrapped with `createNextIntlPlugin("./i18n/request.ts")`
- [x] Updated `middleware.ts` — added `resolveLocale()` function that reads cookie → `Accept-Language` header → fallback `"en"`. Sets `NEXT_LOCALE` cookie (1-year expiry, `sameSite: lax`) on every request. Chained cleanly with existing Clerk admin route protection — all existing auth/admin logic preserved, `NextResponse.next()` returned with cookie attached

**Files touched**: `i18n/routing.ts` (new), `i18n/request.ts` (new), `next.config.mjs`, `middleware.ts`

---

### Step 32 — Create English message file (full coverage) ✅

> **Status**: Complete

- [x] Created `messages/en.json` — 471 lines, 18 namespaces covering every user-facing string in the app

**Namespaces**:

| Namespace | Coverage |
|---|---|
| `common` | Buttons (Save, Cancel, Delete, Edit, Close, Refresh), labels, empty states, units |
| `nav` | Header items (Overview, News, Watchlist, Research, Earnings, Settings) |
| `dashboard` | Total Net Worth, Your Portfolios, Market Benchmarks, portfolio count with ICU pluralization |
| `portfolio` | Holdings, Analytics, Goals, Vault, risk tolerance labels, time horizon labels |
| `assets` | Asset types (Stock, Crypto, Bond, etc.), field labels, column headers |
| `goals` | Goal types, status labels (Getting Started → Exceeded), metric categories |
| `settings` | Section titles, field labels, AI provider options, frequency labels, PulseStrip labels |
| `news` | Headlines, Live Feed, article count, loading states |
| `search` | Command palette text, category labels, keyboard shortcut |
| `auth` | Sign in/up/out |
| `errors` | 404 page, validation messages, API errors, not found states |
| `ai` | AI Market Intelligence, Read Full Analysis, Refresh, Generate, analyzing states |
| `vault` | Documents, Articles, document types, upload dialog steps, dropzone labels |
| `transactions` | Buy, Sell, Dividend, step labels, field labels, confirm text |
| `dialogs` | Create/Edit Portfolio, Add/Edit Asset — all step labels, field labels, placeholders |
| `onboarding` | Welcome, setup steps |
| `allocation` | Title, by type/portfolio |
| `chart` | Performance, date range labels (1W, 1M, 3M, 6M, 1Y, All) |

**ICU patterns used**:
- Pluralization: `"{count, plural, one {# portfolio} other {# portfolios}}"`
- Interpolation: `"{change} today across {count, plural, ...}"`

**Files touched**: `messages/en.json` (new)

---

### Step 33 — Create Portuguese (Portugal) translation ✅

> **Status**: Complete

- [x] Created `messages/pt.json` — 471 lines, 18 namespaces, **100% key parity** with English (verified programmatically — all keys match across all namespaces)
- [x] Uses European Portuguese (PT-PT) vocabulary throughout, not Brazilian Portuguese:

| English | PT-PT (used) | PT-BR (avoided) |
|---|---|---|
| Save | Guardar | Salvar |
| Settings | Definições | Configurações |
| Loading… | A carregar… | Carregando… |
| Delete | Eliminar | Excluir |
| Portfolio | Carteira | Portfólio |
| Upload | Carregar | Enviar |
| Download | Transferir | Baixar |
| File | Ficheiro | Arquivo |

- [x] Financial terminology adapted: "Matérias-Primas" (commodities), "Obrigações" (bonds), "Liquidez" (cash), "Imobiliário" (real estate), "Ações" (stocks)
- [x] Chart date ranges localized: "1A" for "1Y", "1S" for "1W", "Tudo" for "All"
- [x] Build passes cleanly — zero regressions, all 13 pages generate successfully

**Files touched**: `messages/pt.json` (new)

---

### Step 34 — Wire `NextIntlClientProvider` into app layout + locale sync hook ✅

> **Status**: Complete

- [x] Updated `app/layout.tsx`:
  - Made the root layout `async` to use `getLocale()` and `getMessages()` from `next-intl/server`
  - Wraps all children with `<NextIntlClientProvider locale={locale} messages={messages}>` — positioned as the outermost provider (above PostHog, ThemeProvider, Clerk, Convex) so translations are available everywhere
  - `<html lang={locale}>` now set dynamically from the resolved locale (was hardcoded `"en"`)

- [x] Created `hooks/useLocaleSync.ts`:
  - Reads `userPreferences.language` from Convex via `useQuery(api.users.getUserPreferences)`
  - Reads current `NEXT_LOCALE` cookie from `document.cookie`
  - On mismatch: sets cookie via `document.cookie` (1-year expiry, `path=/`, `samesite=lax`), triggers `window.location.reload()` so server components re-render in the correct locale
  - On Clerk sign-out (detected via `useUser().isSignedIn` transitioning `true` → `false`): resets cookie to default locale (`"en"`)
  - Guards against infinite reload loops via `hasReloaded` ref — only triggers one reload per session
  - Skips sync entirely for unauthenticated users and while Convex data is still loading
  - Validates locale against `routing.locales` before setting cookie

- [x] Wired `useLocaleSync()` into `app/auth-wrapper.tsx` — called inside `AuthenticatedWrapper` which already wraps all authenticated content and has access to Clerk/Convex providers. The hook internally skips unauthenticated users, so it's safe to call unconditionally.

**Files touched**: `app/layout.tsx`, `hooks/useLocaleSync.ts` (new), `app/auth-wrapper.tsx`

**Build result**: All 13 pages compile and generate successfully. Zero regressions.

---

### Step 35 — Migrate core components to `useTranslations`

> **Status**: Pending — depends on Step 34

- [ ] Migrate in priority order (highest visibility first):

| # | Component | Namespace | Strings to replace |
|---|---|---|---|
| 1 | `components/header.tsx` | `nav` | Overview, News, Watchlist, Research, Earnings, Settings, Search |
| 2 | `components/hero-split.tsx` | `dashboard` | "Total Net Worth", "today across X portfolios" (ICU plural) |
| 3 | `components/ticker.tsx` | — | Minimal text, mostly data-driven |
| 4 | `components/ai-card.tsx` | `ai` | "AI Market Intelligence", "Read Full Analysis", "Refresh", "Generate", "Analyzing" |
| 5 | `components/portfolio-card.tsx` | `dashboard`, `common` | "today", "assets", "View details" |
| 6 | `components/holdings.tsx` | `assets` | Column headers (Asset, Qty, Value, Change), type group labels (Stocks, Crypto…), expanded panel labels (Quantity, Avg Buy Price, Current Price, Total Value), action buttons (Transactions, Edit, Delete) |
| 7 | `components/tabs.tsx` | — | Tab labels are passed as props — parent components will pass translated strings |
| 8 | `app/(webapp)/page.tsx` | `dashboard` | "Your Portfolios", "Market Benchmarks", tab labels ("Portfolios", "Markets"), "{count} active", empty states |
| 9 | `app/(webapp)/portfolio/[id]/page.tsx` | `portfolio` | Tab labels, section headers, stat labels, action buttons |
| 10 | `app/(webapp)/news/page.tsx` | `news` | "News & Insights", subtitle, "Live Feed", "Updated {time}", "Showing X–Y of Z articles", empty/loading states |

**Pattern**: Each component adds `const t = useTranslations('namespace')` and replaces hardcoded strings with `t('key')` or `t('key', { variable })` for interpolation.

**Files**: All 10 components listed above

---

### Step 36 — Migrate dialogs and forms to `useTranslations`

> **Status**: Pending — depends on Step 34

- [ ] Migrate all dialog/form components:

| Component | Namespace | Key strings |
|---|---|---|
| `components/add-asset-dialog.tsx` | `dialogs.addAsset`, `assets` | Step labels (Type, Details, Purchase, Notes, Confirm), field labels, type options with descriptions, confirm summary row labels |
| `components/edit-asset-dialog.tsx` | `dialogs.editAsset`, `assets` | Step labels, field labels, save/cancel, confirm summary |
| `components/create-portfolio-dialog.tsx` | `dialogs.createPortfolio`, `portfolio` | Step labels (Name, Strategy, Confirm), risk tolerance options with descriptions, time horizon options, toggle labels |
| `components/edit-portfolio-dialog.tsx` | `dialogs.editPortfolio`, `portfolio` | Step labels, field labels, change review rows |
| `components/portfolio-goals.tsx` | `goals` | Goal type labels, status labels, preset goal descriptions, metric categories, Add/Edit Goal dialog labels |
| `components/vault.tsx` | `vault` | Tab labels (Documents, Articles), document type names, upload dialog steps, article form fields |
| `components/command-palette.tsx` | `search` | Placeholder text, category labels, empty states, keyboard hints |
| `components/transaction-dialog.tsx` | `transactions` | Type labels (Buy, Sell, Dividend) with descriptions, step labels, field labels, confirm summary |
| `components/not-found-content.tsx` | `errors` | "404", "PAGE NOT FOUND", description text, button labels |

**Files**: All 9 components listed above

---

### Step 37 — Language picker in settings

> **Status**: Pending — depends on Steps 34–35

- [ ] Create `components/settings/language-section.tsx`:
  - Searchable language selector (reuse combobox/popover pattern from existing currency picker in `add-asset-dialog.tsx`)
  - Each option: flag emoji + native language name + English name
    - `🇬🇧 English`
    - `🇵🇹 Português — Portuguese`
  - Live preview: show a sample translated string that changes as user selects a language (e.g., "Total Net Worth" → "Património Líquido Total")
  - On selection: write to `userPreferences.language` via Convex `updateUserPreferences` mutation → `useLocaleSync` hook catches the change → updates cookie → page reloads in new language
  - Aesthetic: matches existing settings section style (zinc-950/60 card, white/[0.06] borders, 11px uppercase tracking labels)

- [ ] Update `app/(webapp)/settings/page.tsx`:
  - Import and render `LanguageSection` within the Profile tab
  - Position after Identity section

- [ ] Update `components/settings/identity-section.tsx`:
  - Remove the static language display row (it'll be handled by the dedicated Language section)
  - Or keep it as a read-only indicator that links/scrolls to the Language section

**Files**: `components/settings/language-section.tsx` (new), `app/(webapp)/settings/page.tsx`, `components/settings/identity-section.tsx`

---

## Dependency Graph

```
Step 31 ✅ ─── next-intl config, routing, middleware
Step 32 ✅ ─── English message catalog (depends on nothing)
Step 33 ✅ ─── Portuguese message catalog (depends on Step 32 for key structure)
Step 34 ✅ ─── Layout provider + locale sync hook (depends on Steps 31–33)
Step 35 ⬜ ─── Core component migration (depends on Step 34)
Step 36 ⬜ ─── Dialog/form migration (depends on Step 34, parallel with Step 35)
Step 37 ⬜ ─── Language picker UI (depends on Steps 34–35)
```

Steps 35 and 36 can be done in parallel once Step 34 is complete. Step 37 depends on the component migration being done so the language switch has visible effect.

---

## Adding a New Language (Future)

To add a new language (e.g., French `fr`):

1. Add `"fr"` to the `locales` array in `i18n/routing.ts`
2. Copy `messages/en.json` → `messages/fr.json`
3. Translate all values in `fr.json`
4. Add the language option to `components/settings/language-section.tsx`
5. Done — middleware, request config, and provider automatically pick it up

No code changes needed beyond these 4 files.

---

## Changelog

| Date | Steps | Notes |
|---|---|---|
| 2025-07-17 | 31 | next-intl v4.8.2 wired — `i18n/routing.ts`, `i18n/request.ts`, `next.config.mjs` wrapped with `createNextIntlPlugin`, `middleware.ts` chained with Clerk (cookie-based locale resolution, no URL rewrites) |
| 2025-07-17 | 32 | English message catalog — `messages/en.json`, 471 lines, 18 namespaces, full app coverage including ICU pluralization patterns |
| 2025-07-17 | 33 | Portuguese (PT-PT) message catalog — `messages/pt.json`, 471 lines, 100% key parity with English, European Portuguese vocabulary throughout |
| 2025-07-17 | 34 | Layout provider + locale sync hook — `app/layout.tsx` made async, wraps all children with `NextIntlClientProvider` (locale + messages from server), `<html lang>` dynamic. `hooks/useLocaleSync.ts` bridges Convex `userPreferences.language` → `NEXT_LOCALE` cookie with reload, sign-out cleanup, loop guard. Wired into `app/auth-wrapper.tsx`. Build clean, zero regressions. |