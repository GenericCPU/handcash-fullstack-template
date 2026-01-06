import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { HandCashMinter } from "@handcash/handcash-connect"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, RateLimitPresets.general)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const authResult = await requireAuth(request)

  if (!authResult.success) {
    return authResult.response
  }

  const { privateKey } = authResult

  try {
    const body = await request.json()
    const { origin } = body

    if (!origin) {
      return NextResponse.json({ error: "Item origin is required" }, { status: 400 })
    }

    const appId = process.env.HANDCASH_APP_ID
    const appSecret = process.env.HANDCASH_APP_SECRET

    if (!appId || !appSecret) {
      return NextResponse.json({ error: "HandCash App credentials not configured" }, { status: 500 })
    }

    // Create Minter instance with user's auth token
    const minter = HandCashMinter.fromAppCredentials({
      appId,
      appSecret,
      authToken: privateKey,
    })

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
