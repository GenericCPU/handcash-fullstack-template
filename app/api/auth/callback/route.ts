import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { validateCSRFToken } from "@/lib/csrf-utils"
import { createSession } from "@/lib/session-utils"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"

export async function GET(request: NextRequest) {
  try {
    const stateParam = request.nextUrl.searchParams.get("state")
    const csrfTokenCookie = request.cookies.get("handcash_csrf_token")?.value

    let storedCSRFToken = null
    if (csrfTokenCookie) {
      try {
        storedCSRFToken = JSON.parse(csrfTokenCookie)
      } catch (err) {
        console.error("[Auth] CSRF token parse error:", err)
      }
    }

    if (!validateCSRFToken(storedCSRFToken, stateParam)) {

      logAuditEvent({
        type: AuditEventType.CSRF_VIOLATION,
        success: false,
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
        details: {
          receivedState: stateParam,
          hasStoredToken: !!storedCSRFToken,
        },
      })

      return NextResponse.redirect(new URL("/?error=csrf_failed", request.url))
    }

    const privateKey = request.cookies.get("handcash_temp_private_key")?.value

    if (!privateKey) {

      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        success: false,
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
        details: { reason: "Missing private key" },
      })

      return NextResponse.redirect(new URL("/?error=missing_key", request.url))
    }

    const appId = process.env.HANDCASH_APP_ID
    const appSecret = process.env.HANDCASH_APP_SECRET

    if (!appId || !appSecret) {
      return NextResponse.redirect(new URL("/?error=config_error", request.url))
    }

    const isValid = await handcashService.validateAuthToken(privateKey)

    if (!isValid) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        success: false,
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
        details: { reason: "Invalid auth token" },
      })

      throw new Error("Invalid auth token")
    }

    console.log("[v0] Private key validated successfully")

    const session = createSession(privateKey, request.ip || null, request.headers.get("user-agent"))

    const response = NextResponse.redirect(new URL("/", request.url))

    response.cookies.set("private_key", privateKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    response.cookies.set("session_metadata", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    response.cookies.delete("handcash_temp_private_key")
    response.cookies.delete("handcash_csrf_token")

    logAuditEvent({
      type: AuditEventType.LOGIN_SUCCESS,
      success: true,
      sessionId: session.sessionId,
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
    })

    return response
  } catch (error) {
    console.error("[Auth] Callback validation error:", error)

    logAuditEvent({
      type: AuditEventType.LOGIN_FAILED,
      success: false,
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { error: String(error) },
    })

    const response = NextResponse.redirect(new URL("/?error=auth_failed", request.url))
    response.cookies.delete("handcash_temp_private_key")
    response.cookies.delete("handcash_csrf_token")

    return response
  }
}
