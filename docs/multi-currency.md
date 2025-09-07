# Multi-Currency Support Implementation

This implementation adds comprehensive multi-currency support to the portfolio tracker application while maintaining USD as the internal storage currency.

## Architecture Overview

### Data Storage
- **Internal Storage**: All monetary values are stored in USD in the database
- **Display Currency**: Values are converted to the user's preferred currency for display
- **Exchange Rates**: Stored in the `currencyRates` table with daily updates

### Components

#### 1. Database Schema (`convex/schema.ts`)
```typescript
currencyRates: defineTable({
  baseCurrency: v.string(),    // Base currency (USD)
  targetCurrency: v.string(),  // Target currency (EUR, GBP, etc.)
  rate: v.number(),           // Exchange rate from base to target
  date: v.string(),           // Date in YYYY-MM-DD format
  updatedAt: v.number(),      // Timestamp when rate was last updated
}).index("byCurrency", ["baseCurrency", "targetCurrency", "date"])
```

#### 2. FX Management (`convex/fx.ts`)
- `updateFxRates`: Fetches daily rates from market data API
- `initializeFxRates`: Populates sample data for testing
- `getLatestFxRate`: Retrieves current exchange rate
- `convertCurrency`: Handles currency conversion logic

#### 3. Currency Utilities (`lib/currency.ts`)
- `formatCurrency`: Formats numbers with proper currency symbols
- `convertFromUSD`: Converts USD amounts to target currency
- `getSupportedCurrencies`: Returns list of supported currencies

#### 4. UI Components
- **Portfolio Page**: Displays total value in user's preferred currency
- **AssetRow**: Shows individual asset values with currency conversion
- **AssetSection**: Passes currency parameters to child components

## Supported Currencies

- USD (US Dollar) - Base currency
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- JPY (Japanese Yen)
- AUD (Australian Dollar)
- CHF (Swiss Franc)

## Currency Conversion Flow

1. **Data Input**: All transactions and prices stored in USD
2. **User Preference**: Retrieved from `userPreferences.currency`
3. **FX Rate Lookup**: Current exchange rate fetched from `currencyRates` table
4. **Conversion**: USD amount × FX rate = Display amount
5. **Formatting**: Proper currency symbol and locale formatting applied

## Automatic Updates

The system includes a daily cron job that:
- Fetches current FX rates from the market data API
- Updates the `currencyRates` table
- Handles both single and batch rate updates
- Maintains historical rate data

## Testing

A test page is available at `/currency-test` that demonstrates:
- FX rate initialization
- Currency conversion examples
- Real-time rate display
- Multi-currency formatting

## Usage Examples

### Frontend Currency Display
```typescript
// Get user's preferred currency and FX rate
const userCurrency = userPreferences?.currency || "USD";
const fxRate = useQuery(api.fx.getLatestFxRate, {
  baseCurrency: "USD",
  targetCurrency: userCurrency,
}) || 1;

// Convert and format values
const convertedValue = convertFromUSD(usdAmount, userCurrency, fxRate);
const formattedValue = formatCurrency(convertedValue, userCurrency);
```

### Backend FX Rate Management
```typescript
// Initialize sample rates
await ctx.runMutation(api.fx.initializeFxRates);

// Get current rate
const rate = await ctx.runQuery(api.fx.getLatestFxRate, {
  baseCurrency: "USD",
  targetCurrency: "EUR"
});

// Convert currency
const eurAmount = await ctx.runQuery(api.fx.convertCurrency, {
  amount: 1000,
  fromCurrency: "USD",
  toCurrency: "EUR"
});
```

## Future Enhancements

- **Chart Integration**: Convert historical data for charts
- **Transaction Currency**: Support entering transactions in non-USD currencies
- **Real-time Rates**: WebSocket updates for live exchange rates
- **More Currencies**: Extend to additional world currencies
- **Rate Alerts**: Notify users of significant exchange rate changes

## Troubleshooting

### No FX Rates Available
1. Run the initialization: `api.fx.initializeFxRates`
2. Check market data API connectivity
3. Verify cron job execution

### Incorrect Conversions
1. Verify FX rate accuracy in database
2. Check base currency assumption (USD)
3. Validate conversion logic in utilities

### UI Not Updating
1. Ensure user preferences are loaded
2. Check FX rate query execution
3. Verify currency parameter passing to components