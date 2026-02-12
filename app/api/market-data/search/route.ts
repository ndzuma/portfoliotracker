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
    const q = searchParams.get("q") || "";
    const limit = searchParams.get("limit") || "8";
    const offset = searchParams.get("offset") || "0";
    const type = searchParams.get("type") || "";

    if (!q || q.trim().length < 1) {
      return NextResponse.json({ data: [], total: 0, limit: 0, offset: 0 });
    }

    const params = new URLSearchParams({ q, limit, offset });
    if (type) {
      params.set("type", type);
    }

    const response = await fetch(
      `${marketDataServiceUrl}/search?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        `Market data search failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying market data search:", error);
    return NextResponse.json(
      { error: "Failed to search market data", data: [], total: 0 },
      { status: 500 },
    );
  }
}
