import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { requireAuth } from "@/lib/auth-middleware"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting before auth check
  const rateLimitResponse = rateLimit(request, RateLimitPresets.payment)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const authResult = await requireAuth(request)

  if (!authResult.success) {
    return authResult.response
  }

  const { privateKey, session } = authResult

  try {
    const body = await request.json()
    const { destination, amount, instrument, description } = body

    if (!destination || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.PAYMENT_INITIATED,
      success: true,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      details: { destination, amount, instrument },
    })

    const data = await handcashService.sendPayment(privateKey, {
      destination,
      amount: Number.parseFloat(amount),
      currency: instrument,
      description,
    })

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS,
      success: true,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      details: { destination, amount, transactionId: data?.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Payment error:", error)

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.PAYMENT_FAILED,
      success: false,
      sessionId: session.sessionId,
      ipAddress,
      userAgent,
      details: { error: String(error) },
    })

    return NextResponse.json({ error: "Failed to send payment", details: error.message }, { status: 500 })
  }
}
