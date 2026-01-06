import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getMinter, resolveHandlesToUserIds } from "@/lib/items-client"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting before auth check
  const rateLimitResponse = rateLimit(request, RateLimitPresets.mint)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
    const { collectionId, name, description, imageUrl, multimediaUrl, attributes, quantity, destination, rarity, color } = body

    if (!collectionId || !name) {
      return NextResponse.json({ error: "Missing required fields: collectionId and name are required" }, { status: 400 })
    }

    if (!imageUrl && !multimediaUrl) {
      return NextResponse.json(
        { error: "Missing required fields: either imageUrl or multimediaUrl is required" },
        { status: 400 },
      )
    }

    const minter = getMinter()

    let destinationUserId: string | undefined
    if (destination) {
      const trimmed = destination.trim()
      // resolveHandlesToUserIds now accepts both handles and user IDs
      const handleMap = await resolveHandlesToUserIds([trimmed], businessAuthToken)
      destinationUserId = handleMap[trimmed.toLowerCase()]

      if (!destinationUserId) {
        return NextResponse.json({ error: `Could not resolve handle or user ID: ${destination}` }, { status: 400 })
      }
    }

    // Build mediaDetails based on what's provided
    const mediaDetails: any = {}
    if (multimediaUrl) {
      mediaDetails.multimedia = {
        url: multimediaUrl,
        contentType: "model/gltf-binary",
      }
    }
    if (imageUrl) {
      mediaDetails.image = {
        url: imageUrl,
        contentType: "image/png",
      }
    }

    const itemData: any = {
      name,
      rarity: rarity || "Common",
      quantity: quantity || 1,
      attributes: (attributes || []).map((attr: { name: string; value: string | number; displayType?: string }) => ({
        name: attr.name,
        value: attr.value,
        displayType: (attr.displayType as "string" | "number") || "string",
      })),
      mediaDetails,
      actions: [],
    }

    if (destinationUserId) {
      itemData.user = destinationUserId
    }

    if (color) {
      itemData.color = color
    }

    if (description) {
      itemData.description = description
    }

    const creationOrder = await minter.createItemsOrder({
      collectionId,
      items: [itemData],
    })

    // Wait for items to be created
    const items = await minter.getOrderItems(creationOrder.id)

    return NextResponse.json({
      success: true,
      data: {
        order: creationOrder,
        items,
        destinationUserId,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Mint error:", error)
    return NextResponse.json({ error: "Failed to mint items", details: message }, { status: 500 })
  }
}

