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
const isDev = process.env.NODE_ENV === 'development';
const isDevMode = process.env.DEV_MODE === 'true';

// When in dev mode, enable all features
const devModeOverride = isDev && isDevMode;

export const featureFlags: FeatureFlags = {
  watchlist: devModeOverride || process.env.ENABLE_WATCHLIST === 'true',
  research: devModeOverride || process.env.ENABLE_RESEARCH === 'true',
  earningsCalendar: devModeOverride || process.env.ENABLE_EARNINGS_CALENDAR === 'true',
  byoai: devModeOverride || process.env.ENABLE_BYOAI === 'true',
  apiKeyManagement: devModeOverride || process.env.ENABLE_API_KEY_MANAGEMENT === 'true',
  appearanceToggle: devModeOverride || process.env.ENABLE_APPEARANCE_TOGGLE === 'true',
  portfolioAnalytics: devModeOverride || process.env.ENABLE_PORTFOLIO_ANALYTICS === 'true',
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

// Export for debugging in development
if (isDev) {
  console.log('Feature Flags:', featureFlags);
}