import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { handcashService } from "@/lib/handcash-service"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) return rateLimitResponse

  const authResult = await requireAuth(request)
  if (!authResult.success) return authResult.response

  const { privateKey } = authResult

  try {
    const body = await request.json()
    const { origin } = body

    if (!origin) {
      return NextResponse.json({ error: "Item origin is required" }, { status: 400 })
    }

    await handcashService.burnItem(privateKey, origin)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to burn item"
    return NextResponse.json({ error: "Failed to burn item", details: message }, { status: 500 })
  }
}
