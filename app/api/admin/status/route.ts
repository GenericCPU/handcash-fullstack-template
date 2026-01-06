import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.admin)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return NextResponse.json({ isAdmin: false })
  }

  return NextResponse.json({ isAdmin: true })
}



