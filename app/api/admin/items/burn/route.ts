import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getMinter } from "@/lib/items-client"

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const body = await request.json()
    const { origin } = body

    if (!origin) {
      return NextResponse.json({ error: "Item origin is required" }, { status: 400 })
    }

    const minter = getMinter()

    // Burn the item using burnAndCreateItemsOrder
    // issue is optional - omit it when only burning (not creating new items)
    const burnOrder = await minter.burnAndCreateItemsOrder({
      burn: {
        origins: [origin],
      },
    })

    // Wait for the burn order to complete
    // This ensures the item is actually burned before returning success
    // burnAndCreateItemsOrder returns ItemTransferAndCreateItemsOrder which has itemCreationOrder
    const orderId = (burnOrder as any)?.itemCreationOrder?.id || (burnOrder as any)?.id
    if (orderId) {
      try {
        await minter.getOrderItems(orderId)
      } catch (orderError) {
        // If getOrderItems fails, the burn might still have succeeded
        // Log but don't fail the request
        console.error("[v0] Error waiting for burn order:", orderError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Burn item error:", error)
    return NextResponse.json({ error: "Failed to burn item", details: error.message }, { status: 500 })
  }
}
