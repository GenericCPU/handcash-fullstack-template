import { type NextRequest, NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getBusinessClient } from "@/lib/business-client"

export async function POST(request: NextRequest) {
  try {
    // Still require admin to be authenticated
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { destination, amount, currency, description } = body

    if (!destination || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use business client for operations
    const client = getBusinessClient()

    const { data, error } = await Connect.pay({
      client,
      body: {
        instrumentCurrencyCode: "BSV",
        denominationCurrencyCode: currency || "USD",
        description: description || undefined,
        receivers: [
          {
            destination,
            sendAmount: Number.parseFloat(amount),
          },
        ],
      },
    })

    if (error) {
      console.error("[v0] Payment error:", error)
      return NextResponse.json({ error: "Payment failed", details: error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Payment error:", error)
    return NextResponse.json({ error: "Failed to send payment", details: error.message }, { status: 500 })
  }
}
