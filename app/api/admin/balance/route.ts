import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.admin)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const client = getBusinessClient()

    const { data: spendableBalances, error: spendableError } = await Connect.getSpendableBalances({
      client,
    })

    if (spendableError) throw new Error(spendableError.message || "Failed to get spendable balance")

    const { data: allBalances, error: allBalancesError } = await Connect.getBalances({
      client,
    })

    if (allBalancesError) {
      console.warn("[v0] All balances error:", allBalancesError)
    }

    return NextResponse.json({
      spendableBalances: spendableBalances || {},
      allBalances: allBalances || {},
    })
  } catch (error: any) {
    console.error("[v0] Business balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch business wallet balance", details: error.message }, { status: 500 })
  }
}



