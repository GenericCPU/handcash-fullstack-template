import { type NextRequest, NextResponse } from "next/server"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  const hasAppId = !!process.env.HANDCASH_APP_ID
  const hasAppSecret = !!process.env.HANDCASH_APP_SECRET

  return NextResponse.json({ 
    hasAppId,
    hasAppSecret,
    isConfigured: hasAppId && hasAppSecret
  })
}



