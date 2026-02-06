# V2 Portfolio Tracker - Redesign Plan

## Overview
This document outlines the step-by-step plan for building V2 of the portfolio tracker, combining the best design elements from Redesign 10's cinematic aesthetic with Redesign 7's tabbed navigation structure, connected to live Convex data.

## Design Direction

### Core Design Elements (from Redesign 10)
- **Dark theme** with `#09090b` background
- **Cinematic typography**: Bold 7xl/88px hero numbers for net worth
- **Ticker strip**: Horizontal benchmark data strip with inline sparkline SVGs
- **Card-based layout**: Rounded-2xl borders with `border-white/[0.06]` and `bg-zinc-950`
- **Meridian branding**: Wallet icon logo with white background
- **Subtle gradients**: Radial gradients for accent areas `bg-[radial-gradient(...)]`
- **Inline sparklines**: SVG polyline sparklines embedded in cards

### Navigation Structure (from Redesign 7)
- **Tab navigation**: Portfolios | Markets | Intelligence
- **Bottom border active state**: Active tab has `border-b-2 border-primary`
- **Floating header**: Sticky top navbar with logo, nav links, user profile

### Key Modifications
1. **Portfolio grid** (not carousel): 3-column responsive grid using same card components
2. **60/40 header split**: Net worth (60%) | AI Intelligence (40%) with vertical separator
3. **Conditional allocation**: Asset allocation only shows when "Portfolios" tab is active
4. **Portfolio page enhancements**:
   - Performance chart in header 40% section
   - Tab navigation: Holdings | Portfolio Analytics | Vault
   - Stats row maintained
   - AI summary maintained

## File Structure

```
app/
└── (redesign)/
    └── v2/
        ├── REDESIGN_PLAN.md           # This file
        ├── OUTCOMES.md                # Results & design decisions
        ├── layout.tsx                 # V2 layout wrapper
        ├── page.tsx                   # Main dashboard
        ├── [id]/
        │   └── page.tsx              # Portfolio detail page
        └── components/
            ├── v2-header.tsx         # Shared header component
            ├── v2-net-worth-section.tsx
            ├── v2-ai-intelligence.tsx
            ├── v2-ticker-strip.tsx
            ├── v2-portfolio-grid.tsx
            ├── v2-portfolio-card.tsx
            ├── v2-tab-navigation.tsx
            ├── v2-allocation-section.tsx
            ├── v2-benchmark-grid.tsx
            └── v2-performance-chart.tsx
```

## Step-by-Step Implementation Plan

### Phase 1: Setup & Structure
- [x] Create `/app/(redesign)/v2/` directory structure
- [ ] Create `REDESIGN_PLAN.md` (this file)
- [ ] Create `layout.tsx` with base styling
- [ ] Set up component directory structure

### Phase 2: Reusable Components
- [ ] **v2-header.tsx**: Top navbar with logo, nav links, user button
- [ ] **v2-net-worth-section.tsx**: Hero section with total net worth (60% width)
- [ ] **v2-ai-intelligence.tsx**: AI insight card (40% width)
- [ ] **v2-ticker-strip.tsx**: Horizontal benchmark strip with sparklines
- [ ] **v2-portfolio-card.tsx**: Individual portfolio card with sparkline watermark
- [ ] **v2-portfolio-grid.tsx**: Grid container for portfolio cards
- [ ] **v2-tab-navigation.tsx**: Tab switcher (Portfolios | Markets | Intelligence)
- [ ] **v2-allocation-section.tsx**: Asset allocation bar + legend (conditional render)
- [ ] **v2-benchmark-grid.tsx**: Market data cards grid
- [ ] **v2-performance-chart.tsx**: Portfolio performance chart with date range selector

### Phase 3: Main Dashboard Page (`page.tsx`)
- [ ] Import and connect Convex hooks:
  - `useUser()` from Clerk
  - `useQuery(api.users.getUserByClerkId)`
  - `useQuery(api.portfolios.getUserPorfolios)`
  - `useQuery(api.ai.getAiNewsSummary)`
  - `useQuery(api.marketData.getBenchmarkData)`
- [ ] Calculate aggregated totals (totalValue, totalChange, totalChangePercent)
- [ ] Implement header section:
  - 60% Net Worth Section (left)
  - Vertical separator line
  - 40% AI Intelligence (right)
- [ ] Implement ticker strip below header
- [ ] Implement tab navigation
- [ ] Conditional content based on active tab:
  - **Portfolios tab**: Portfolio grid + Allocation section
  - **Markets tab**: Benchmark cards grid
  - **Intelligence tab**: Full AI analysis card
- [ ] Create/Edit/Delete portfolio modals (from current implementation)

### Phase 4: Portfolio Detail Page (`[id]/page.tsx`)
- [ ] Import and connect Convex hooks:
  - `useQuery(api.portfolios.getPortfolioById)`
  - `useQuery(api.portfolios.canUserAccessPortfolio)`
  - `useQuery(api.marketData.getHistoricalData)` for chart
- [ ] Implement header section:
  - 60% Portfolio hero (name, value, change)
  - Vertical separator line
  - 40% Performance chart with date range selector
- [ ] Implement stats row (Total Value, Holdings, Top Holding, Top Weight)
- [ ] Implement AI summary card
- [ ] Implement tab navigation (Holdings | Portfolio Analytics | Vault)
- [ ] Conditional content based on active tab:
  - **Holdings tab**: Asset sections by type (stocks, crypto, real estate, etc.)
  - **Portfolio Analytics tab**: Existing `<PortfolioAnalytics />` component
  - **Vault tab**: Goals, documents, articles (existing bunker components)
- [ ] Back button to main dashboard

### Phase 5: Styling & Polish
- [ ] Verify dark theme consistency across all components
- [ ] Ensure responsive breakpoints (mobile, tablet, desktop)
- [ ] Add hover states and transitions
- [ ] Test sparkline SVG rendering
- [ ] Verify gradient overlays
- [ ] Test loading states

### Phase 6: Integration & Testing
- [ ] Test with live Convex data
- [ ] Verify all mutations work (create/edit/delete portfolio, assets)
- [ ] Test authentication flow
- [ ] Verify portfolio access controls
- [ ] Test chart date range selector
- [ ] Test tab navigation state persistence
- [ ] Verify responsive design on all screen sizes

### Phase 7: Future Enhancements (Post-Launch)
- [ ] Redesign Settings page to match V2 aesthetic
- [ ] Redesign News page
- [ ] Redesign Research page
- [ ] Redesign Earnings page
- [ ] Redesign Watchlist page
- [ ] Document missing settings features plan

## Data Flow

### Main Dashboard
```
User (Clerk)
  ↓
getUserByClerkId
  ↓
userId
  ↓
getUserPorfolios(userId) → Portfolio[]
getAiNewsSummary() → { analysis, timestamp }
getBenchmarkData() → Benchmark[]
  ↓
Aggregate totals
  ↓
Render components
```

### Portfolio Detail
```
Route params.id
  ↓
canUserAccessPortfolio(portfolioId) → boolean
getPortfolioById(portfolioId) → Portfolio
getHistoricalData(portfolioId, dateRange) → ChartData[]
  ↓
Render portfolio detail
```

## Design Tokens

```css
/* Colors */
--background: #09090b (zinc-950)
--card: #18181b (zinc-900)
--border: rgba(255,255,255,0.06)
--primary: #22c55e (emerald-500) for positive
--secondary: #ef4444 (red-500) for negative
--muted: #71717a (zinc-500)
--text-primary: #ffffff
--text-muted: #52525b (zinc-600)

/* Typography */
--hero-size: 88px (text-7xl lg:text-[88px])
--title-size: 32px (text-3xl)
--body-size: 14px (text-sm)

/* Spacing */
--section-padding: 48px (py-12)
--card-padding: 24px (p-6)
--card-gap: 20px (gap-5)

/* Borders */
--border-radius-card: 16px (rounded-2xl)
--border-radius-badge: 8px (rounded-lg)
```

## Component Props

### NetWorthSection
```typescript
interface NetWorthSectionProps {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  portfolioCount: number;
}
```

### AIIntelligence
```typescript
interface AIIntelligenceProps {
  analysis: string;
  timestamp?: string;
}
```

### TickerStrip
```typescript
interface TickerStripProps {
  benchmarks: {
    name: string;
    ticker: string;
    value: number;
    change: number;
  }[];
}
```

### PortfolioCard
```typescript
interface PortfolioCardProps {
  portfolio: {
    _id: string;
    name: string;
    description: string;
    currentValue: number;
    change: number;
    changePercent: number;
    assetsCount: number;
  };
}
```

### TabNavigation
```typescript
interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}
```

## Notes
- All components use live Convex data (no mock data)
- Maintain consistency with existing Convex schema
- Reuse existing mutation functions from current implementation
- Use existing shadcn/ui components (Button, Card, Dialog, etc.)
- Follow existing authentication patterns with Clerk
- Asset allocation calculation reuses existing `ChartRadialStacked` logic
- Performance chart reuses existing `PorfolioPerformanceChart` component

## Success Criteria
- [ ] Dashboard loads with live data
- [ ] Portfolio CRUD operations work
- [ ] Tab navigation works smoothly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Maintains dark theme aesthetic from Redesign 10
- [ ] Performance chart renders correctly
- [ ] Asset allocation only shows on Portfolios tab
- [ ] All existing features maintained (Vault, Analytics, etc.)
