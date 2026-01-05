import { type NextRequest, NextResponse } from "next/server"
import { getAccountClient, getMinter, Connect } from "@/lib/items-client"

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const accountClient = getAccountClient(authToken)

    let collections: unknown[] = []

    try {
      // Fetch items inventory which includes collection info
      const { data: items } = await Connect.getItemsInventory({
        client: accountClient,
        body: { limit: 100 },
      })

      // Extract unique collections from items
      const collectionMap = new Map<string, unknown>()
      for (const item of items) {
        if (item.collection && !collectionMap.has(item.collection.id)) {
          collectionMap.set(item.collection.id, item.collection)
        }
      }
      collections = Array.from(collectionMap.values())
    } catch (getError) {
      console.error("Error fetching collections:", getError)
      collections = []
    }

    return NextResponse.json({ success: true, collections: collections || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Collections error:", error)
    return NextResponse.json({ error: "Failed to fetch collections", details: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { name, description, imageUrl } = body

    if (!name) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    const minter = getMinter()

    const collectionData: {
      name: string
      description?: string
      mediaDetails?: { image: { url: string; contentType: "image/png" } }
    } = {
      name,
      description: description || undefined,
    }

    if (imageUrl) {
      collectionData.mediaDetails = {
        image: {
          url: imageUrl,
          contentType: "image/png",
        },
      }
    }

    const creationOrder = await minter.createCollectionOrder(collectionData)
    const items = await minter.getOrderItems(creationOrder.id)

    return NextResponse.json({
      success: true,
      collection: items[0],
      collectionId: items[0]?.id,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Create collection error:", error)
    return NextResponse.json({ error: "Failed to create collection", details: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ error: "Collection updates are managed via the HandCash dashboard" }, { status: 501 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Update collection error:", error)
    return NextResponse.json({ error: "Failed to update collection", details: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ error: "Collection deletion is managed via the HandCash dashboard" }, { status: 501 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Delete collection error:", error)
    return NextResponse.json({ error: "Failed to delete collection", details: message }, { status: 500 })
  }
}
