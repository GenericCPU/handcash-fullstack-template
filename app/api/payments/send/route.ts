import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { requireAuth } from "@/lib/auth-middleware"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
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

    logAuditEvent({
      type: AuditEventType.PAYMENT_INITIATED,
      success: true,
      sessionId: session.sessionId,
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { destination, amount, instrument },
    })

    const data = await handcashService.sendPayment(privateKey, {
      destination,
      amount: Number.parseFloat(amount),
      instrument,
      description,
      denominationCurrencyCode: "USD", // Amount is in USD, convert to instrument currency
    })

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS,
      success: true,
      sessionId: session.sessionId,
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { destination, amount, transactionId: data.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Payment error:", error)

    logAuditEvent({
      type: AuditEventType.PAYMENT_FAILED,
      success: false,
      sessionId: session.sessionId,
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { error: String(error) },
    })

    return NextResponse.json({ error: "Failed to send payment", details: error.message }, { status: 500 })
  }
}
