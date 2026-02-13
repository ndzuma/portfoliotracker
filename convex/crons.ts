import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Update historical market data every 24 hrs
// This job will fetch historical data for existing assets
crons.interval(
  "update historical market data",
  { hours: 24 },
  api.marketData.updateHistoricalData,
);

// Update current market data every 2 hrs
// This job will fetch latest prices for all tracked assets
crons.interval(
  "update current market prices",
  { hours: 2 },
  api.marketData.updateCurrentPrices,
);

// Update portfolio snapshots weekly
// This job will update weekly snapshots for all portfolios
crons.weekly(
  "update portfolio snapshots",
  {
    dayOfWeek: "monday",
    hourUTC: 19,
    minuteUTC: 0,
  },
  api.marketData.updateAllPortfolioSnapshots,
);

// Update benchmark data every x
crons.interval(
  "update benchmark data",
  { minutes: 60 },
  api.marketData.updateBenchmarkData,
);

// Update FX rates daily (EUR-based, used for multi-currency conversion)
crons.interval("update FX rates", { hours: 24 }, api.marketData.fetchFxRates);

// Generate AI news summaries every 90 minutes
crons.interval(
  "update AI news summaries",
  { minutes: 90 },
  api.ai.generateAiNewsSummary,
);

// AI Portfolio Summary Generation Cron Jobs
// These generate portfolio summaries based on user frequency preferences

// Daily at 9 AM UTC - for users with daily frequency
crons.daily(
  "generate AI summaries - daily frequency",
  {
    hourUTC: 9,
    minuteUTC: 0,
  },
  api.ai.scheduleGeneratePortfolioSummariesDaily,
);

// Weekly on Monday at 9 AM UTC - for users with weekly frequency
crons.weekly(
  "generate AI summaries - weekly frequency",
  {
    dayOfWeek: "monday",
    hourUTC: 9,
    minuteUTC: 0,
  },
  api.ai.scheduleGeneratePortfolioSummariesWeekly,
);

// Monthly every 720 hours (30 days) - for users with monthly frequency
crons.interval(
  "generate AI summaries - monthly frequency",
  { hours: 720 },
  api.ai.scheduleGeneratePortfolioSummariesMonthly,
);

export default crons;
