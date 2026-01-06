import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { generateAuthenticationKeyPair } from "@/lib/auth-utils"
import { createCSRFToken } from "@/lib/csrf-utils"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"
import { initializeAuditStorage } from "@/lib/audit-storage"

export async function GET(request: NextRequest) {
  // Initialize audit storage on first use
  initializeAuditStorage().catch(() => {
    // Ignore initialization errors
  })

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.auth)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const appId = process.env.HANDCASH_APP_ID

    if (!appId) {
      return NextResponse.json({ error: "HandCash credentials not configured" }, { status: 500 })
    }

    const csrfToken = createCSRFToken(10) // 10 minute expiration
    const { privateKey, publicKey } = generateAuthenticationKeyPair()

    const redirectUrl = `https://handcash.io/connect?appId=${appId}&publicKey=${publicKey}&state=${csrfToken.value}`

    const response = NextResponse.json({
      redirectUrl,
      publicKey,
    })

    response.cookies.set("handcash_temp_private_key", privateKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    response.cookies.set("handcash_csrf_token", JSON.stringify(csrfToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.LOGIN_INITIATED,
      success: true,
      ipAddress,
      userAgent,
    })

    return response
  } catch (error) {
    console.error("[v0] Login route error:", error)

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.LOGIN_INITIATED,
      success: false,
      ipAddress,
      userAgent,
      details: { error: String(error) },
    })

    return NextResponse.json({ error: "Failed to generate login URL" }, { status: 500 })
  }
}
