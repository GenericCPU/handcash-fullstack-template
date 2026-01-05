import { type NextRequest, NextResponse } from "next/server"
import { getMinter, resolveHandlesToUserIds } from "@/lib/items-client"

export async function POST(request: NextRequest) {
  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { collectionId, name, description, mediaUrl, attributes, quantity, destination, rarity, color } = body

    if (!collectionId || !name || !mediaUrl) {
      return NextResponse.json(
        { error: "Missing required fields: collectionId, name, and mediaUrl are required" },
        { status: 400 },
      )
    }

    const minter = getMinter()

    let destinationUserId: string | undefined
    if (destination) {
      const cleanHandle = destination.replace(/^[@$]/, "")
      const handleMap = await resolveHandlesToUserIds([cleanHandle], businessAuthToken)
      destinationUserId = handleMap[cleanHandle.toLowerCase()]

      if (!destinationUserId) {
        return NextResponse.json({ error: `Could not resolve handle: ${destination}` }, { status: 400 })
      }
    }

    const itemData: {
      user?: string
      name: string
      rarity: string
      quantity: number
      color?: string
      description?: string
      attributes: Array<{ name: string; value: string | number; displayType: "string" | "number" }>
      mediaDetails: { image: { url: string; contentType: string } }
    } = {
      name,
      rarity: rarity || "Common",
      quantity: quantity || 1,
      attributes: (attributes || []).map((attr: { name: string; value: string | number; displayType?: string }) => ({
        name: attr.name,
        value: attr.value,
        displayType: (attr.displayType as "string" | "number") || "string",
      })),
      mediaDetails: {
        image: {
          url: mediaUrl,
          contentType: "image/png",
        },
      },
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
