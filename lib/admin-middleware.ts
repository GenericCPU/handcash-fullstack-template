import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "./auth-middleware"
import { handcashService } from "./handcash-service"

/**
 * Admin Authentication Middleware
 * Checks if the authenticated user's handle matches ADMIN_HANDLE environment variable
 */

export async function requireAdmin(request: NextRequest): Promise<
  | {
      success: true
      privateKey: string
      handle: string
    }
  | {
      success: false
      response: NextResponse
    }
> {
  // First check if user is authenticated
  const authResult = await requireAuth(request)

  if (!authResult.success) {
    return authResult
  }

  const { privateKey } = authResult

  try {
    // Get user profile to check handle
    const profile = await handcashService.getUserProfile(privateKey)
    const userHandle = profile.publicProfile.handle?.toLowerCase().replace("@", "") || ""

    // Get admin handle from environment
    const adminHandle = process.env.ADMIN_HANDLE?.toLowerCase().replace("@", "")

    if (!adminHandle) {
      console.error("[AdminMiddleware] ADMIN_HANDLE not configured")
      return {
        success: false,
        response: NextResponse.json({ error: "Admin configuration error" }, { status: 500 }),
      }
    }

    // Check if user handle matches admin handle
    if (userHandle !== adminHandle) {
      return {
        success: false,
        response: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 }),
      }
    }

    return {
      success: true,
      privateKey,
      handle: userHandle,
    }
  } catch (error) {
    console.error("[AdminMiddleware] Admin middleware error:", error)
    return {
      success: false,
      response: NextResponse.json({ error: "Admin authentication failed" }, { status: 500 }),
    }
  }
}

