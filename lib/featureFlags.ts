/**
 * Feature Flags Configuration
 *
 * This file manages feature flags throughout the application.
 * In dev mode, all features are enabled regardless of individual flags.
 */

export interface FeatureFlags {
  watchlist: boolean;
  research: boolean;
  earningsCalendar: boolean;
  byoai: boolean;
  apiKeyManagement: boolean;
  appearanceToggle: boolean;
  portfolioAnalytics: boolean;
}

// Check if we're in development mode
const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

// When in dev mode, enable all features
const devModeOverride = isDev && isDevMode;

export const featureFlags: FeatureFlags = {
  watchlist:
    devModeOverride || process.env.NEXT_PUBLIC_ENABLE_WATCHLIST === "true",
  research:
    devModeOverride || process.env.NEXT_PUBLIC_ENABLE_RESEARCH === "true",
  earningsCalendar:
    devModeOverride ||
    process.env.NEXT_PUBLIC_ENABLE_EARNINGS_CALENDAR === "true",
  byoai: devModeOverride || process.env.NEXT_PUBLIC_ENABLE_BYOAI === "true",
  apiKeyManagement:
    devModeOverride ||
    process.env.NEXT_PUBLIC_ENABLE_API_KEY_MANAGEMENT === "true",
  appearanceToggle:
    devModeOverride ||
    process.env.NEXT_PUBLIC_ENABLE_APPEARANCE_TOGGLE === "true",
  portfolioAnalytics:
    devModeOverride ||
    process.env.NEXT_PUBLIC_ENABLE_PORTFOLIO_ANALYTICS === "true",
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

// Export for debugging in development
if (isDev) {
  console.log("values:", {
    NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
    devModeOverride,
  });
  console.log("Feature Flags:", featureFlags);
}
