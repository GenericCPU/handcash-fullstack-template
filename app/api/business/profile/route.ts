import { type NextRequest, NextResponse } from "next/server"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const client = getBusinessClient()

    const result = await Connect.getCurrentUserProfile({
      client,
    })

    if (result.error) {
      throw new Error(result.error.message || "Failed to get profile")
    }

    const profile = result.data || result
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("[v0] Business profile error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch business wallet profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}



