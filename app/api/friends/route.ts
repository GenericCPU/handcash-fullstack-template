import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const authResult = await requireAuth(request)

  if (!authResult.success) {
    return authResult.response
  }

  const { privateKey } = authResult

  try {
    const friends = await handcashService.getFriends(privateKey)

    return NextResponse.json({ friends })
  } catch (error: any) {
    console.error("[v0] Friends error:", error)
    return NextResponse.json({ error: "Failed to fetch friends", details: error.message }, { status: 500 })
  }
}
