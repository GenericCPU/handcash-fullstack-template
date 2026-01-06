import { type NextRequest, NextResponse } from "next/server"
import { savePayment } from "@/lib/payments-storage"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

// HandCash webhook endpoint for payment notifications
export async function POST(request: NextRequest) {
  // Apply rate limiting (webhooks should not be called frequently)
  const rateLimitResponse = rateLimit(request, { limit: 100, windowMs: 60 * 1000 }) // 100 per minute
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    // Verify webhook authenticity (HandCash sends app-id and app-secret headers)
    const appId = request.headers.get("app-id")
    const appSecret = request.headers.get("app-secret")
    const timestamp = request.headers.get("x-timestamp") // If HandCash provides timestamp
    const expectedAppId = process.env.HANDCASH_APP_ID
    const expectedAppSecret = process.env.HANDCASH_APP_SECRET

    // Validate required headers are present
    if (!appId || !appSecret) {
      console.warn("[Webhook] Missing authentication headers")
      return NextResponse.json({ error: "Missing authentication headers" }, { status: 401 })
    }

    // Basic verification - in production, you might want to verify signatures
    if (expectedAppId && appId !== expectedAppId) {
      console.warn("[Webhook] Invalid app-id header")
      return NextResponse.json({ error: "Invalid app-id" }, { status: 401 })
    }

    if (expectedAppSecret && appSecret !== expectedAppSecret) {
      console.warn("[Webhook] Invalid app-secret header")
      return NextResponse.json({ error: "Invalid app-secret" }, { status: 401 })
    }

    // Validate timestamp to prevent replay attacks (if provided)
    if (timestamp) {
      const requestTime = parseInt(timestamp, 10)
      const currentTime = Date.now()
      const timeDiff = Math.abs(currentTime - requestTime)
      // Reject requests older than 5 minutes (300000ms)
      if (timeDiff > 5 * 60 * 1000) {
        console.warn("[Webhook] Request timestamp too old:", timeDiff)
        return NextResponse.json({ error: "Request timestamp expired" }, { status: 401 })
      }
    }

    const body = await request.json()
    console.log("[Webhook] Payment webhook received:", JSON.stringify(body, null, 2))

    // Extract payment information from webhook payload
    // HandCash webhook structure may vary - adjust based on actual payload
    const paymentRequestId = body.paymentRequestId || body.payment_request_id || body.requestId || body.request_id
    const transactionId = body.transactionId || body.transaction_id || body.txid || body.id
    const amount = body.amount?.amount || body.sendAmount || body.amount
    const currency = body.amount?.currencyCode || body.currencyCode || body.currency || "BSV"
    const paidBy = body.paidBy || body.paid_by || body.handle || body.userHandle || body.user_handle
    const status = body.status || "completed"
    const paidAt = body.paidAt || body.paid_at || body.timestamp || body.createdAt || new Date().toISOString()

    if (!paymentRequestId || !transactionId) {
      console.error("[Webhook] Missing required fields:", { paymentRequestId, transactionId })
      return NextResponse.json({ error: "Missing paymentRequestId or transactionId" }, { status: 400 })
    }

    // Create payment record
    const payment = {
      id: `${paymentRequestId}-${transactionId}`,
      paymentRequestId,
      transactionId,
      amount: typeof amount === "string" ? parseFloat(amount) : amount || 0,
      currency,
      paidBy,
      paidAt: typeof paidAt === "string" ? paidAt : new Date(paidAt).toISOString(),
      status: status.toLowerCase() as "completed" | "failed" | "cancelled",
      metadata: body, // Store full payload for reference
    }

    await savePayment(payment)
    console.log("[Webhook] Payment saved:", payment.id)

    return NextResponse.json({ success: true, paymentId: payment.id })
  } catch (error: any) {
    console.error("[Webhook] Payment webhook error:", error)
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "payment-webhook" })
}

