import { NextResponse } from "next/server"

export async function GET() {
  const benchmarks = [
    {
      name: "TSX Comp",
      value: 15990.46,
      change: 55.09,
      changePercent: 0.35,
    },
    {
      name: "NASDAQ",
      value: 6795.33,
      change: -2.04,
      changePercent: -0.05,
    },
    {
      name: "Dow",
      value: 1288.3,
      change: 10.9,
      changePercent: 0.85,
    },
  ]

  return NextResponse.json(benchmarks)
}
