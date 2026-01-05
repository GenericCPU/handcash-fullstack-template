import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getBusinessClient, Connect } from "@/lib/items-client"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

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

    logAuditEvent({
      type: AuditEventType.PAYMENT_SUCCESS, // Reusing audit type, could add ITEM_TRANSFER
      success: true,
      sessionId: "admin",
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
      details: { itemOrigin, destination, transactionId: data?.transactionId },
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Business item transfer error:", error)

    logAuditEvent({
      type: AuditEventType.PAYMENT_FAILED,
      success: false,
      sessionId: "admin",
      ipAddress: request.ip || null,
      userAgent: request.headers.get("user-agent"),
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



