import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  const { session } = adminResult

  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { destination, amount, instrument, description } = body

    if (!destination || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    logAuditEvent({
      type: AuditEventType.PAYMENT_INITIATED,
      success: true,
      sessionId: session?.sessionId || "admin",
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { destination, amount, instrument },
    })

    const client = getBusinessClient()

    const { data, error } = await Connect.pay({
      client,
      body: {
        instrumentCurrencyCode: instrument || "BSV",
        denominationCurrencyCode: "USD", // Amount is in USD, convert to instrument currency
        description: description || undefined,
        receivers: [
          {
            destination,
            sendAmount: Number.parseFloat(amount),
          },
        ],
      },
    })

    if (error) throw new Error(error.message || "Payment failed")

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS,
      success: true,
      sessionId: session?.sessionId || "admin",
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { destination, amount, transactionId: data.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Business payment error:", error)

    logAuditEvent({
      type: AuditEventType.PAYMENT_FAILED,
      success: false,
      sessionId: session?.sessionId || "admin",
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { error: String(error) },
    })

    return NextResponse.json({ error: "Failed to send payment", details: error.message }, { status: 500 })
  }
}



