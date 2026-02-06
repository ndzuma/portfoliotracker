# V2 Redesign Documentation

## Overview
The V2 redesign combines elements from Redesign 10 (Cinematic layout, ticker strip, oversized numbers) and Redesign 7 (bold typography, tab navigation). All components are purpose-built for V2 -- no pre-existing custom components are reused. Connected to live Convex data.

## Layout Structure

### Main Dashboard (`/v2`)
```
[Header: Meridian logo | Nav links | Search | Notifications | Avatar]
[Hero 60/40: Net Worth + change | divider | AI Market Intelligence (expandable)]
[Benchmark Ticker Strip with sparklines]
[Tabs: Portfolios | Markets]
[Content: Portfolio grid + allocation bar OR Market benchmark cards]
```

### Portfolio Detail (`/v2/portfolio/[id]`)
```
[Header]
[Back link]
[Hero 60/40: Portfolio name + value | divider | Performance chart with date range]
[Stats: Holdings count | Top Holding | YTD Return | Volatility]
[AI Summary (expandable)]
[Tabs: Holdings | Portfolio Analytics | Vault]
[Content: V2 Holdings table | V2 Analytics grid | V2 Vault cards]
```

### News (`/v2/news`)
```
[Header]
[Ticker Strip]
[Title + AI Summary card (side by side)]
[Filter dropdown]
[News card grid with images]
[Pagination]
```

### Settings (`/v2/settings`)
```
[Header]
[Title + Save button]
[Setting sections: Appearance | Language | Currency | Export | BYOAI]
```

## V2 Components (`/components/v2/`)

| Component | File | Purpose |
|-----------|------|---------|
| V2Header | `v2-header.tsx` | Top navbar with pathname-based active detection |
| V2HeroSplit | `v2-hero-split.tsx` | 60/40 flex split with divider line |
| NetWorthHero | `v2-hero-split.tsx` | Large number display with change indicator |
| V2Ticker | `v2-ticker.tsx` | Horizontal scrolling benchmark strip with SVG sparklines |
| V2Tabs | `v2-tabs.tsx` | Underlined tab navigation |
| V2AICard | `v2-ai-card.tsx` | Clean AI text with expand/collapse, no background box |
| V2PortfolioCard | `v2-portfolio-card.tsx` | Portfolio card with value, change badge, link |
| V2AllocationBar | `v2-allocation-bar.tsx` | Segmented bar with legend |
| V2PerformanceChart | `v2-performance-chart.tsx` | Area chart, no axis labels, tooltip only |
| V2StatsRow | `v2-stats-row.tsx` | Generic stat card grid |
| V2Holdings | `v2-holdings.tsx` | Grouped asset table with type icons, hover actions |
| V2Analytics | `v2-analytics.tsx` | Full analytics in stat-block grid layout |
| V2Vault | `v2-vault.tsx` | Goals, articles, documents in V2-styled wrappers |

## Pages

| Route | Status |
|-------|--------|
| `/v2` | Done |
| `/v2/portfolio/[id]` | Done |
| `/v2/news` | Done |
| `/v2/settings` | Done |
| `/v2/watchlist` | Planned |
| `/v2/research` | Planned |
| `/v2/earnings` | Planned |

## Future: Missing Settings
- Notification preferences (email, push, in-app)
- Two-factor authentication
- Portfolio sharing permissions
- Benchmark comparison preferences
- Display density (compact/comfortable)
- Widget customization
- Integration with brokerage APIs

## Future: Pages to Redesign
- Watchlist: real-time quote tracking with alerts
- Research: saved research notes and articles
- Earnings: calendar view with upcoming earnings dates
- Settings: the above missing features

## Technical
- Auth wrapper excludes `/v2` routes from showing the old sidebar
- Header uses `usePathname()` for active nav state (no prop needed)
- AI card uses refs to measure content height and shows expand/collapse
- Holdings are grouped by asset type with hover-reveal action menus
- Analytics renders as a grid of stat blocks (not the old expand/collapse pattern)
- All buttons use native HTML with Tailwind, not shadcn Button (for consistent V2 styling)
