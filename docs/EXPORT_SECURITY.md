# Export Data Security Changes

This document outlines the security improvements made to the portfolio export functionality to filter out sensitive data.

## Problem Statement
The original export functionality included sensitive internal data that users don't need:
- Database IDs (`_id` fields)
- Creation timestamps (`_creationTime` fields)
- User email addresses
- Authentication system IDs (Clerk ID)
- Internal references between entities

## Solution Implemented

### 1. New Filtered Export Function
Created `extractAccountDataForExport` in `convex/users.ts` that provides a clean export without sensitive data.

### 2. Data Filtering Strategy

#### Before (Original Export):
```json
{
  "user": {
    "_id": "user123",
    "_creationTime": 1234567890,
    "name": "John Doe",
    "email": "john@example.com",
    "clerkId": "clerk_123"
  },
  "portfolios": [{
    "_id": "portfolio123",
    "_creationTime": 1234567890,
    "userId": "user123",
    "name": "My Portfolio",
    "assets": [{
      "_id": "asset123",
      "_creationTime": 1234567890,
      "portfolioId": "portfolio123",
      "symbol": "AAPL",
      "transactions": [{
        "_id": "transaction123",
        "_creationTime": 1234567890,
        "assetId": "asset123",
        "type": "buy"
      }]
    }]
  }]
}
```

#### After (Filtered Export):
```json
{
  "user": {
    "name": "John Doe"
  },
  "portfolios": [{
    "name": "My Portfolio",
    "assets": [{
      "symbol": "AAPL",
      "transactions": [{
        "type": "buy"
      }]
    }]
  }]
}
```

### 3. Sensitive Data Removed

| Entity | Filtered Fields |
|--------|----------------|
| User | `_id`, `_creationTime`, `email`, `clerkId` |
| Portfolio | `_id`, `_creationTime`, `userId` |
| Asset | `_id`, `_creationTime`, `portfolioId` |
| Transaction | `_id`, `_creationTime`, `assetId` |

### 4. Data Preserved

All business-relevant data is preserved:
- Portfolio names and descriptions
- Asset symbols, names, types, prices
- Transaction details (type, date, quantity, price, fees)
- User-entered notes and preferences
- Investment tracking data

## Security Benefits

1. **Privacy Protection**: No personal email addresses in exports
2. **System Security**: No internal database IDs exposed
3. **Clean Data**: Exports contain only user-relevant information
4. **Compliance**: Reduces risk of exposing sensitive system data

## Usage

The settings page now automatically uses the filtered export function. Users get the same export functionality but with enhanced privacy and security.

## Testing

Manual testing confirms that:
- All sensitive fields are successfully filtered out
- All business-relevant data is preserved
- Export functionality continues to work as expected
- File downloads include only clean, user-friendly data