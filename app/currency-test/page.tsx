"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";
import { formatCurrency, convertFromUSD, getSupportedCurrencies } from "@/lib/currency";

export default function CurrencyTestPage() {
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  
  // Initialize sample FX rates
  const initializeFxRates = useMutation(api.fx.initializeFxRates);
  
  // Get FX rate for selected currency
  const fxRate = useQuery(api.fx.getLatestFxRate, {
    baseCurrency: "USD",
    targetCurrency: selectedCurrency,
  });
  
  // Get available currencies
  const availableCurrencies = useQuery(api.fx.getAvailableCurrencies);
  
  const handleInitialize = async () => {
    await initializeFxRates();
  };
  
  const sampleUSDAmounts = [1000, 5000, 10000, 50000];
  const supportedCurrencies = getSupportedCurrencies();
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Multi-Currency Test Page</h1>
        
        <div className="grid gap-6">
          {/* Initialize FX Rates */}
          <Card>
            <CardHeader>
              <CardTitle>1. Initialize Sample FX Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleInitialize}>
                Initialize Sample FX Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will populate the database with sample exchange rates.
              </p>
            </CardContent>
          </Card>
          
          {/* Available Currencies */}
          <Card>
            <CardHeader>
              <CardTitle>2. Available Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Currencies in database: {availableCurrencies?.join(", ") || "None"}</p>
            </CardContent>
          </Card>
          
          {/* Currency Selection */}
          <Card>
            <CardHeader>
              <CardTitle>3. Test Currency Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select Target Currency:
                </label>
                <select 
                  value={selectedCurrency} 
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  {supportedCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <p className="mb-4">
                Current FX Rate (USD to {selectedCurrency}): {fxRate || "Not available"}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Conversions:</h4>
                {sampleUSDAmounts.map(amount => (
                  <div key={amount} className="flex justify-between items-center">
                    <span>{formatCurrency(amount, "USD")}</span>
                    <span>→</span>
                    <span>
                      {fxRate ? 
                        formatCurrency(convertFromUSD(amount, selectedCurrency, fxRate), selectedCurrency) : 
                        "No FX rate available"
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* All Currencies Display */}
          <Card>
            <CardHeader>
              <CardTitle>4. USD $10,000 in All Supported Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedCurrencies.map(currency => {
                  const rate = useQuery(api.fx.getLatestFxRate, {
                    baseCurrency: "USD",
                    targetCurrency: currency.code,
                  });
                  
                  return (
                    <div key={currency.code} className="border rounded p-3">
                      <div className="font-medium">{currency.name}</div>
                      <div className="text-2xl font-bold">
                        {rate ? 
                          formatCurrency(convertFromUSD(10000, currency.code, rate), currency.code) : 
                          "N/A"
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rate: {rate || "Not set"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}