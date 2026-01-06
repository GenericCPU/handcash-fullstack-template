import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"
import {
  validateHandleOrId,
  validatePositiveNumber,
  validateOptionalString,
  validateCurrencyCode,
  validationErrorResponse,
} from "@/lib/input-validation"

export async function POST(request: NextRequest) {
  // Apply rate limiting before auth check
  const rateLimitResponse = rateLimit(request, RateLimitPresets.admin)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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

    // Validate input
    let destination: string
    let amount: number
    let instrument: string
    let description: string | undefined

    try {
      destination = validateHandleOrId(body.destination, "destination")
      amount = validatePositiveNumber(body.amount, "amount")
      instrument = body.instrument ? validateCurrencyCode(body.instrument, "instrument") : "BSV"
      description = validateOptionalString(body.description, "description")
    } catch (validationError) {
      const errorResponse = validationErrorResponse(validationError)
      return NextResponse.json({ error: errorResponse.error, details: errorResponse.details }, { status: errorResponse.status })
    }

    // Get IP from x-forwarded-for header or direct IP
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.PAYMENT_INITIATED,
      success: true,
      sessionId: session?.sessionId || ipAddress || "unknown",
      ipAddress,
      userAgent,
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
            sendAmount: amount,
          },
        ],
      },
    })

    if (error) throw new Error(error.message || "Payment failed")

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS,
      success: true,
      sessionId: session?.sessionId || ipAddress || "unknown",
      ipAddress,
      userAgent,
      details: { destination, amount, transactionId: data.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Business payment error:", error)

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.PAYMENT_FAILED,
      success: false,
      sessionId: session?.sessionId || ipAddress || "unknown",
      ipAddress,
      userAgent,
      details: { error: String(error) },
    })

    return NextResponse.json({ error: "Failed to send payment", details: error.message }, { status: 500 })
  }
}



