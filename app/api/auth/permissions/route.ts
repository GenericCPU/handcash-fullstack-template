import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { handcashService } from "@/lib/handcash-service"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export interface PermissionsResponse {
  profile: boolean
  pay: boolean
  friends: boolean
  inventory: boolean
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const permissions = await handcashService.getPermissions(authResult.privateKey)
    return NextResponse.json(permissions)
  } catch (error) {
    console.error("[Auth] Permissions error:", error)
    return NextResponse.json(
      { error: "Failed to get permissions" },
      { status: 500 },
    )
  }
}
