# V2 Redesign Documentation

## Overview
The V2 redesign is a comprehensive reimagining of the portfolio tracker interface, combining the best elements from Redesign 10 (Cinematic) and Redesign 7 (Bold Typography with Tabs). This version connects to live Convex data and provides a production-ready user interface.

## Design Philosophy

### Key Inspirations
- **Redesign 10**: Clean cinematic layout, ticker strip, oversized numbers, sparklines
- **Redesign 7**: Bold typography hero, tabbed navigation, minimal floating header

### Core Design Principles
1. **Data-First**: Prioritize displaying portfolio data clearly and actionably
2. **Progressive Disclosure**: Use tabs to organize content without overwhelming users
3. **Visual Hierarchy**: Large, bold numbers for key metrics; subtle text for supporting info
4. **Responsive Layout**: Grid-based design that adapts to all screen sizes
5. **Live Data**: Real-time connection to Convex database with optimistic updates

## Layout Structure

### Main Dashboard (`/v2`)
```
┌─────────────────────────────────────────────────────────┐
│ [Nav: Logo | Search | Notifications | Profile]          │
├─────────────────────────────────────────────────────────┤
│ [Hero Section]                                          │
│ ┌───────────── 60% ─────────────┬──── 40% ────┐       │
│ │ Net Worth (Large Display)      │ AI Intelligence│     │
│ │ Change (+ Trend Indicator)     │ Card with Glow│     │
│ └────────────────────────────────┴────────────────┘     │
├─────────────────────────────────────────────────────────┤
│ [Benchmark Ticker Strip]                                │
│ │ S&P 500 | NASDAQ | DOW | Russell | VIX                │
├─────────────────────────────────────────────────────────┤
│ [Tab Navigation]                                        │
│ │ Portfolios | Markets | [Future Tabs]                 │
├─────────────────────────────────────────────────────────┤
│ [Tab Content Area]                                      │
│ • Portfolios Tab: Grid of portfolio cards + allocation │
│ • Markets Tab: Benchmark data visualization            │
└─────────────────────────────────────────────────────────┘
```

### Portfolio Detail Page (`/v2/portfolio/[id]`)
```
┌─────────────────────────────────────────────────────────┐
│ [Back Button] Portfolio Name & Description              │
├─────────────────────────────────────────────────────────┤
│ [Header Section - 60/40 Split]                          │
│ ┌───────────── 60% ─────────────┬──── 40% ────┐       │
│ │ • Total Value                  │ Performance  │       │
│ │ • Change (Today)               │ Chart with   │       │
│ │ • Total Assets                 │ Tooltip      │       │
│ └────────────────────────────────┴────────────────┘     │
├─────────────────────────────────────────────────────────┤
│ [Stats Row]                                             │
│ │ Cost Basis | Unrealized Gain | Allocation           │
├─────────────────────────────────────────────────────────┤
│ [AI Summary Card]                                       │
├─────────────────────────────────────────────────────────┤
│ [Tab Navigation]                                        │
│ │ Holdings | Portfolio Analytics | Vault               │
├─────────────────────────────────────────────────────────┤
│ [Tab Content Area]                                      │
│ • Holdings: Asset table grouped by type                │
│ • Portfolio Analytics: Performance metrics + charts    │
│ • Vault: Goals, documents, articles                    │
└─────────────────────────────────────────────────────────┘
```

## Components Architecture

### Reusable V2 Components (`/components/v2/`)
- **`v2-header.tsx`**: Top navigation bar with search, notifications, user profile
- **`v2-hero-split.tsx`**: 60/40 split hero section (Net Worth + AI or Stats + Chart)
- **`v2-ticker.tsx`**: Horizontal scrolling benchmark ticker with sparklines
- **`v2-tabs.tsx`**: Tab navigation system with active indicator
- **`v2-portfolio-card.tsx`**: Individual portfolio card for grid display
- **`v2-allocation-bar.tsx`**: Segmented horizontal bar chart for allocations
- **`v2-ai-card.tsx`**: AI intelligence card with gradient glow effect
- **`v2-performance-chart.tsx`**: Portfolio performance chart with tooltips (no axis labels)
- **`v2-stats-row.tsx`**: Row of key metric cards
- **`v2-asset-table.tsx`**: Holdings table grouped by asset type

## Data Flow

### Convex Queries Used
1. **`api.users.getUserByClerkId`**: Get current user data
2. **`api.portfolios.getUserPorfolios`**: Fetch all user portfolios
3. **`api.portfolios.getPortfolioById`**: Fetch single portfolio details
4. **`api.marketData.getBenchmarkData`**: Fetch benchmark indices
5. **`api.marketData.getHistoricalData`**: Fetch historical performance data
6. **`api.ai.getAiNewsSummary`**: Fetch AI-generated market intelligence
7. **`api.ai.getAiPortfolioSummary`**: Fetch AI portfolio analysis

### Mutations Used
1. **`api.portfolios.createPortfolio`**: Create new portfolio
2. **`api.portfolios.updatePortfolio`**: Edit portfolio metadata
3. **`api.portfolios.deletePortfolio`**: Delete portfolio
4. **`api.assets.createAsset`**: Add asset to portfolio
5. **`api.assets.updateAsset`**: Edit asset details
6. **`api.assets.deleteAsset`**: Remove asset from portfolio

## Feature Breakdown

### Main Dashboard Features
- [x] Live net worth calculation across all portfolios
- [x] Today's change with trend indicator
- [x] Real-time benchmark ticker strip with sparklines
- [x] Tab-based content organization
- [x] Portfolio grid with hover effects and live data
- [x] Asset allocation visualization (on Portfolios tab)
- [x] AI market intelligence card
- [x] Create/edit/delete portfolio modals

### Portfolio Detail Features
- [x] 60/40 split header (Stats + Performance Chart)
- [x] Performance chart with date range selector and tooltips
- [x] Stats row: Cost Basis, Unrealized Gain, Allocation
- [x] AI portfolio summary card
- [x] Tab navigation: Holdings, Analytics, Vault
- [x] Holdings table grouped by asset type
- [x] Portfolio Analytics with detailed metrics
- [x] Vault: Goals, Documents, Articles
- [x] Add/edit/delete assets

## Design Tokens & Theme

### Color Palette
- **Background**: `oklch(0.12)` - Near black
- **Card**: `oklch(0.15)` - Slightly lighter black
- **Primary**: `oklch(0.75 0.08 85)` - Gold/beige
- **Secondary**: Red for losses
- **Muted**: `oklch(0.18)` - Dark gray
- **Border**: `oklch(0.25)` - Light border

### Typography
- **Headings**: Geist Sans, bold, large scale (3xl-6xl for hero)
- **Body**: Geist Sans, regular/medium
- **Monospace**: Geist Mono (for numbers, tickers)

### Spacing & Layout
- **Max Width**: 1600px container
- **Padding**: 8 (32px) on desktop, 6 (24px) on mobile
- **Gap**: 6 (24px) between cards
- **Border Radius**: 2xl (16px) for cards, xl (12px) for smaller components

## Future Roadmap

### Planned Pages
- [ ] `/v2/news` - Redesigned news feed with AI summaries
- [ ] `/v2/watchlist` - Stock watchlist with real-time quotes
- [ ] `/v2/research` - Research hub with saved articles
- [ ] `/v2/earnings` - Earnings calendar and reports
- [ ] `/v2/settings` - User settings and preferences

### Missing Settings Features
- [ ] Theme customization (dark/light mode toggle)
- [ ] Currency preferences (USD, EUR, GBP, etc.)
- [ ] Notification preferences (email, push, in-app)
- [ ] Data export (CSV, PDF reports)
- [ ] Two-factor authentication setup
- [ ] API key management
- [ ] Portfolio sharing permissions
- [ ] Benchmark comparison preferences
- [ ] Display preferences (compact/comfortable view)
- [ ] Language selection

### Feature Enhancements
- [ ] Portfolio comparison view (side-by-side)
- [ ] Advanced filtering and sorting on holdings
- [ ] Drag-and-drop portfolio reordering
- [ ] Customizable dashboard widgets
- [ ] Real-time collaboration (share portfolios with team)
- [ ] Mobile-optimized responsive design
- [ ] PWA support for offline access
- [ ] Export portfolio as shareable link
- [ ] Integration with brokerage APIs (auto-sync)
- [ ] Tax loss harvesting recommendations

## Technical Notes

### Performance Optimizations
- React Query caching via Convex subscriptions
- Optimistic UI updates for mutations
- Lazy loading for charts and heavy components
- Virtualized lists for large holdings tables

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus management in modals and tabs
- Proper semantic HTML structure

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: In Development
