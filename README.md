portfoliotracker/README.md
# Portfolio Tracker

A comprehensive investment portfolio management application built with Next.js, featuring AI-powered insights, multi-asset tracking, and advanced analytics.

## 🌟 Features

### Core Portfolio Management
- **Multiple Portfolios**: Create and manage multiple investment portfolios
- **Asset Tracking**: Support for stocks, bonds, commodities, real estate, cash, crypto, and other assets
- **Transaction Management**: Track buy/sell transactions and dividends
- **Real-time Valuation**: Automatic portfolio valuation with live market data
- **Performance Analytics**: Comprehensive portfolio performance metrics and charts

### AI-Powered Insights
- **BYOAI (Bring Your Own AI)**: Choose your preferred AI provider
  - Default hosted AI service
  - OpenRouter integration for multiple LLM models
  - Self-hosted AI models via secure tunnel
- **Market Summaries**: AI-generated daily market insights
- **Portfolio Analysis**: Intelligent portfolio recommendations and risk assessment

### Advanced Features
- **Watchlist**: Track and monitor favorite securities
- **Research Tools**: Advanced research capabilities for investment analysis
- **Earnings Calendar**: Stay updated with corporate earnings reports
- **Market News**: Real-time financial news and market updates
- **Benchmark Tracking**: Compare portfolio performance against market indices

### User Experience
- **Dark/Light Theme**: Customizable interface with theme switching
- **Multi-currency Support**: Support for USD, EUR, GBP, CAD, JPY, AUD, CHF
- **Responsive Design**: Optimized for desktop and mobile devices
- **Feature Flags**: Granular control over application features
- **Data Export**: Export portfolio data in JSON, CSV, PDF, and Excel formats

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Recharts** - Data visualization library
- **React Hook Form + Zod** - Form handling and validation

### Backend & Database
- **Convex** - Serverless backend and database
- **Clerk** - Authentication and user management

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Railway** - Deployment platform

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** 18.x or later
- **npm** or **yarn** package manager
- **Git** for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_OUT_URL=/

   # Convex Database
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

   # Feature Flags (Client-side accessible)
   NEXT_PUBLIC_NODE_ENV=development
   NEXT_PUBLIC_DEV_MODE=true
   NEXT_PUBLIC_ENABLE_WATCHLIST=true
   NEXT_PUBLIC_ENABLE_RESEARCH=true
   NEXT_PUBLIC_ENABLE_EARNINGS_CALENDAR=true
   NEXT_PUBLIC_ENABLE_BYOAI=true
   NEXT_PUBLIC_ENABLE_API_KEY_MANAGEMENT=true
   NEXT_PUBLIC_ENABLE_APPEARANCE_TOGGLE=true
   NEXT_PUBLIC_ENABLE_PORTFOLIO_ANALYTICS=true
   ```

4. **Convex Setup**
   ```bash
   npx convex dev --once
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Getting Started

1. **Sign Up/Login**: Use Clerk authentication to create an account
2. **Complete Onboarding**: Set up your initial preferences
3. **Create Your First Portfolio**: Add a new portfolio to start tracking investments
4. **Add Assets**: Populate your portfolio with stocks, crypto, or other assets
5. **Track Transactions**: Record buy/sell transactions and dividends

### Key Workflows

#### Portfolio Management
- Navigate to the dashboard to view all portfolios
- Click "Create Portfolio" to add a new investment portfolio
- Use the portfolio cards to view detailed performance
- Edit or delete portfolios using the dropdown menu

#### Asset Tracking
- Within a portfolio, add assets with current prices
- Record transactions with dates, quantities, and prices
- View asset allocation with interactive charts
- Monitor performance against benchmarks

#### AI Features
- Configure AI provider in Settings > BYOAI Settings
- Choose between default, OpenRouter, or self-hosted options
- View AI-generated market summaries on the dashboard
- Get portfolio insights and recommendations

## ⚙️ Configuration

### Feature Flags

The application uses a feature flag system to control functionality:

```typescript
// Feature flags are controlled via environment variables
const featureFlags = {
  watchlist: process.env.NEXT_PUBLIC_ENABLE_WATCHLIST === 'true',
  research: process.env.NEXT_PUBLIC_ENABLE_RESEARCH === 'true',
  earningsCalendar: process.env.NEXT_PUBLIC_ENABLE_EARNINGS_CALENDAR === 'true',
  byoai: process.env.NEXT_PUBLIC_ENABLE_BYOAI === 'true',
  // ... other features
};
```

### AI Provider Configuration

#### OpenRouter Setup
1. Create an account at [OpenRouter.ai](https://openrouter.ai)
2. Generate an API key
3. Add the key to your environment variables
4. Select preferred AI model in settings

#### Self-Hosted Setup
1. Install the tunnel software on your AI server
2. Configure the tunnel ID and authentication
3. Set up the self-hosted URL (optional)
4. Test the connection in settings

## 📊 Database Schema

The application uses Convex with the following main tables:

- **users**: User profiles and authentication data
- **portfolios**: Investment portfolios
- **assets**: Individual securities and holdings
- **transactions**: Buy/sell/dividend records
- **marketData**: Current and historical market prices
- **userPreferences**: User settings and configurations
- **documents**: User-uploaded files and statements

## 🔧 API Reference

### Convex Functions

#### Portfolio Operations
- `portfolios.getUserPortfolios` - Get all user portfolios
- `portfolios.createPortfolio` - Create a new portfolio
- `portfolios.updatePortfolio` - Update portfolio details
- `portfolios.deletePortfolio` - Delete a portfolio

#### Asset Operations
- `assets.getPortfolioAssets` - Get assets in a portfolio
- `assets.createAsset` - Add a new asset
- `assets.updateAsset` - Update asset information

#### Transaction Operations
- `transactions.getAssetTransactions` - Get transactions for an asset
- `transactions.createTransaction` - Record a new transaction

#### Market Data
- `marketData.getBenchmarkData` - Get market benchmark data
- `marketData.getCurrentPrices` - Get current asset prices

## 🧪 Testing

### Feature Flags Testing
Visit `/feature-flags-test` to verify feature flag functionality and debug configuration issues.

### AI Connection Testing
Use the "Test AI Connection" button in Settings > BYOAI Settings to verify your AI provider configuration.

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**
   ```bash
   # Deploy to Railway
   railway deploy
   ```

2. **Environment Variables**
   Set all environment variables in your Railway dashboard:
   - Clerk keys
   - Convex URL
   - Feature flag variables

3. **Convex Deployment**
   ```bash
   npx convex deploy
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📝 License

This project is proprietary software. All rights reserved.

## 🙋 Support

For support and questions:

- **Documentation**: Check the `/docs` folder for detailed guides
- **Internal Support**: Contact the development team for assistance

## 🗺️ Roadmap

### Planned Features
- [ ] Advanced portfolio analytics and reporting
- [ ] Social features for portfolio sharing
- [ ] Integration with more brokerage APIs
- [ ] Mobile app development
- [ ] Advanced risk management tools
- [ ] Tax optimization features

### Recent Updates
- ✅ BYOAI feature implementation
- ✅ Feature flags system
- ✅ Enhanced UI/UX with new design system
- ✅ Multi-currency support
- ✅ Advanced portfolio analytics

---

**Built with ❤️ for investors who demand the best tools for managing their portfolios.**

**Live at: [www.pulsefolio.net](https://www.pulsefolio.net)**