import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
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
    const { itemOrigin, destination } = body

    if (!itemOrigin || !destination) {
      return NextResponse.json({ error: "Missing required fields: itemOrigin and destination" }, { status: 400 })
    }

    const client = getBusinessClient()

    const body_data = Array.isArray(itemOrigin)
      ? { itemOrigins: itemOrigin, destination }
      : { itemOrigin, destination }

    const { data, error } = await Connect.transferItem({
      client,
      body: body_data,
    })

    if (error) throw new Error(error.message || "Failed to transfer item")

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") || request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS, // Reusing audit type, could add ITEM_TRANSFER
      success: true,
      sessionId: session?.sessionId || ipAddress || "unknown",
      ipAddress,
      userAgent,
      details: { itemOrigin, destination, transactionId: data?.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Business item transfer error:", error)

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

    return NextResponse.json(
      {
        error: "Failed to transfer item",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}



