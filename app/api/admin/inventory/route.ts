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

    // Use business client for operations
    const client = getBusinessClient()

    const { data: items, error } = await Connect.getItemsInventory({
      client,
      body: {},
    })

    if (error) {
      throw new Error(error.message || "Failed to get inventory")
    }

    return NextResponse.json({
      success: true,
      items: items?.items || items || [],
    })
  } catch (error) {
    console.error("[v0] Business inventory error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch business wallet inventory",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

