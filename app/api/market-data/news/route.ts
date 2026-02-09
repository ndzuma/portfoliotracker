import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const marketDataServiceUrl = process.env.MARKET_DATA_SERVICE_URL;
    if (!marketDataServiceUrl) {
      throw new Error(
        "MARKET_DATA_SERVICE_URL environment variable is not set",
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";

    const response = await fetch(
      `${marketDataServiceUrl}/v2/news?page=${page}&limit=${limit}`,
    );
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
