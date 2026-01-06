import { type NextRequest, NextResponse } from "next/server"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.auth)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  const sessionData = request.cookies.get("session_metadata")?.value
  let sessionId: string | undefined

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData)
      sessionId = session.sessionId
    } catch (err) {
      console.error("[v0] Session parse error on logout:", err)
    }
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
  const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

  logAuditEvent({
    type: AuditEventType.LOGOUT,
    success: true,
    sessionId,
    ipAddress,
    userAgent,
  })

  const response = NextResponse.json({ success: true })

  response.cookies.delete("private_key")
  response.cookies.delete("session_metadata")

  return response
}
