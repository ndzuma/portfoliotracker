import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const marketDataServiceUrl = process.env.MARKET_DATA_SERVICE_URL;
    if (!marketDataServiceUrl) {
      throw new Error(
        "MARKET_DATA_SERVICE_URL environment variable is not set",
      );
    }

    // Fetch from your market data service
    const response = await fetch(`${marketDataServiceUrl}/news`);
    if (!response.ok) {
      throw new Error(`Failed to fetch market news: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching market news:", error);
    return NextResponse.json(
      { error: "Failed to fetch market news" },
      { status: 500 },
    );
  }
}
