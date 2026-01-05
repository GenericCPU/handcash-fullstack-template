import { type NextRequest, NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getTargetAppSDK } from "@/lib/business-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currencyCode = searchParams.get("currency") || "USD"

    const sdk = getTargetAppSDK()

    const { data: rate, error } = await Connect.getExchangeRate({
      client: sdk.client,
      path: {
        currencyCode,
      },
    })

    if (error) {
      console.error("[v0] Exchange rate error:", error)
      return NextResponse.json({ error: "Failed to fetch exchange rate", details: error }, { status: 500 })
    }

    return NextResponse.json({ rate })
  } catch (error: any) {
    console.error("[v0] Exchange rate error:", error)
    return NextResponse.json({ error: "Failed to fetch exchange rate", details: error.message }, { status: 500 })
  }
}
