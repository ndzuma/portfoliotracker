import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

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

// Generate AI news summaries every 90 minutes
crons.interval(
  "update AI news summaries",
  { minutes: 90 },
  api.ai.generateAiNewsSummary,
)

export default crons;
