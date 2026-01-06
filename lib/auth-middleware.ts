import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "./handcash-service"
import {
  type SessionMetadata,
  isSessionExpired,
  validateSessionConsistency,
  updateSessionActivity,
} from "./session-utils"
import { logAuditEvent, AuditEventType } from "./audit-logger"

/**
 * Unified Authentication Middleware
 * Provides consistent auth validation across all protected routes
 */

export interface AuthenticatedRequest extends NextRequest {
  privateKey: string
  session: SessionMetadata
}

export async function requireAuth(request: NextRequest): Promise<
  | {
      success: true
      privateKey: string
      session: SessionMetadata
    }
  | {
      success: false
      response: NextResponse
    }
> {
  try {
    // Try cookie-based auth first
    let privateKey = request.cookies.get("private_key")?.value
    const sessionData = request.cookies.get("session_metadata")?.value

    // Fallback to Bearer token for API calls
    if (!privateKey) {
      const authHeader = request.headers.get("authorization")
      privateKey = authHeader?.replace("Bearer ", "")
    }

    if (!privateKey) {
      logAuditEvent({
        type: AuditEventType.PROFILE_ACCESS,
        success: false,
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
        details: { reason: "No auth token provided" },
      })
      return {
        success: false,
        response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
      }
    }

    // Parse session metadata if available
    let session: SessionMetadata | null = null
    if (sessionData) {
      try {
        session = JSON.parse(sessionData)

        // Validate session hasn't expired
        if (isSessionExpired(session)) {
          logAuditEvent({
            type: AuditEventType.SESSION_EXPIRED,
            success: false,
            sessionId: session.sessionId,
            ipAddress: request.ip || null,
            userAgent: request.headers.get("user-agent"),
          })

          const response = NextResponse.json({ error: "Session expired" }, { status: 401 })
          response.cookies.delete("private_key")
          response.cookies.delete("session_metadata")
          return { success: false, response }
        }

        // Validate session consistency (detect potential hijacking)
        const currentIp = request.ip || null
        const currentUserAgent = request.headers.get("user-agent")

        if (!validateSessionConsistency(session, currentIp, currentUserAgent)) {
          logAuditEvent({
            type: AuditEventType.SESSION_HIJACK_ATTEMPT,
            success: false,
            sessionId: session.sessionId,
            ipAddress: currentIp,
            userAgent: currentUserAgent,
            details: {
              expectedIp: session.ipAddress,
              expectedUserAgent: session.userAgent,
            },
          })

          const response = NextResponse.json({ error: "Session validation failed" }, { status: 401 })
          response.cookies.delete("private_key")
          response.cookies.delete("session_metadata")
          return { success: false, response }
        }

        // Update session activity
        session = updateSessionActivity(session)
      } catch (err) {
        console.error("[AuthMiddleware] Session metadata parse error:", err)
        session = null
      }
    }

    // Validate auth token with HandCash
    const isValid = await handcashService.validateAuthToken(privateKey)
    if (!isValid) {
      logAuditEvent({
        type: AuditEventType.PROFILE_ACCESS,
        success: false,
        sessionId: session?.sessionId,
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
        details: { reason: "Invalid auth token" },
      })

      const response = NextResponse.json({ error: "Invalid auth token" }, { status: 401 })
      response.cookies.delete("private_key")
      response.cookies.delete("session_metadata")
      return { success: false, response }
    }

    // If no session exists, create a basic one (for backward compatibility)
    if (!session) {
      session = {
        sessionId: "legacy",
        privateKey,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        ipAddress: request.ip || null,
        userAgent: request.headers.get("user-agent"),
      }
    }

    return {
      success: true,
      privateKey,
      session,
    }
  } catch (error) {
    console.error("[AuthMiddleware] Auth middleware error:", error)
    return {
      success: false,
      response: NextResponse.json({ error: "Authentication error" }, { status: 500 }),
    }
  }
}
