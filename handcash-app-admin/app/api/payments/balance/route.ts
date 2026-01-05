import { type NextRequest, NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getBusinessClient } from "@/lib/business-client"

export async function GET(request: NextRequest) {
  try {
    // Still require admin to be authenticated
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Use business client for operations
    const client = getBusinessClient()

    const { data: spendableBalances, error: spendableError } = await Connect.getSpendableBalances({
      client,
    })

    if (spendableError) {
      console.error("[v0] Spendable balance error:", spendableError)
      return NextResponse.json({ error: "Failed to fetch spendable balance", details: spendableError }, { status: 500 })
    }

    const { data: allBalances, error: allBalancesError } = await Connect.getBalances({
      client,
    })

    if (allBalancesError) {
      console.error("[v0] All balances error:", allBalancesError)
    }

    const response = {
      spendableBalances: spendableBalances || {},
      allBalances: allBalances || {},
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[v0] Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance", details: error.message }, { status: 500 })
  }
}
