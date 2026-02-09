# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Package Management
This project uses pnpm as the package manager.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: Radix UI components with custom styled wrappers
- **Styling**: Tailwind CSS v4.1.9 with custom PostCSS setup
- **TypeScript**: Full TypeScript support with strict configuration
- **Theme System**: next-themes with system/dark/light mode support
- **Charts**: Recharts for data visualization
- **Analytics**: Vercel Analytics integration

### Project Structure
```
app/                          # Next.js App Router
├── dashboard/               # Main dashboard area (protected)
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Portfolio overview & management
│   ├── news/               # Market news (placeholder)
│   └── settings/           # User settings & export
├── layout.tsx              # Root layout with theme provider
├── page.tsx                # Landing page
└── globals.css             # Global styles

components/
├── ui/                     # Reusable UI components (Radix-based)
├── sidebar.tsx             # Collapsible navigation sidebar
├── theme-provider.tsx      # Theme context provider
└── types.tsx               # TypeScript interfaces & shared components

lib/
└── utils.ts                # Utility functions (cn for className merging)

hooks/
└── use-toast.ts            # Toast notification hook
```

### Key Architecture Patterns

**Route Organization**: Uses Next.js App Router with nested layouts
- Root layout provides theme system and global providers
- Dashboard layout adds sidebar navigation
- Pages are server/client components as needed

**Component Architecture**: 
- UI components follow Radix patterns with custom styling
- Shared types defined in `components/types.tsx`
- Client state managed with React hooks (no external state library)

**Data Flow**: 
- Mock data structure for portfolios/benchmarks
- Local state management in components
- LocalStorage for settings persistence
- API endpoints referenced but not implemented (`/api/portfolios`, `/api/benchmarks`)

**Styling System**:
- Tailwind CSS v4 with PostCSS
- CSS custom properties for theming
- Geist font family (Sans & Mono variants)
- Consistent design tokens via Tailwind classes

### Navigation Structure
- **Dashboard** (`/dashboard`): Portfolio overview with benchmarks, portfolio management
- **News** (`/dashboard/news`): Market news (placeholder implementation)  
- **Settings** (`/dashboard/settings`): Theme, language, currency, export functionality

### Data Models
Key TypeScript interfaces:
- `Portfolio`: Core portfolio entity with assets, performance metrics
- `Asset`: Individual holdings (stocks, properties, commodities, bonds)
- `Benchmark`: Market benchmark data for comparison
- `AISummaryCard`: AI-generated portfolio insights component

## Development Notes

### Configuration Details
- **TypeScript**: Strict mode enabled, path aliases configured (`@/*` maps to `./`)
- **Next.js Config**: Build errors ignored for development, images unoptimized
- **ESLint**: Configured but build-time checking disabled
- **Theme System**: Supports system/light/dark with localStorage persistence

### v0.app Integration
This project is automatically synced with v0.app deployments. Changes made in the v0 interface are pushed to this repository, and Vercel deploys from here.

### Mock vs Real Data
- Currently uses static/mock data for portfolios and benchmarks
- API endpoints referenced but return mock responses
- Export functionality partially implemented (CSV/JSON work, PDF/Excel are placeholders)

### Testing
No testing framework currently configured. The project structure would support adding Jest, Vitest, or similar testing tools.

### Deployment
- **Platform**: Vercel
- **Live URL**: https://vercel.com/mrmalates-projects/v0-portfolio-dashboard-clone
- **Auto-deploy**: Connected to this repository via v0.app
