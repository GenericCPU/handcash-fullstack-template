import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getPaymentsByPaymentRequestId } from "@/lib/payments-storage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Payment request ID is required" }, { status: 400 })
    }

    const payments = await getPaymentsByPaymentRequestId(id)

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    })
  } catch (error: any) {
    console.error("[Payments] Fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch payments",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}

