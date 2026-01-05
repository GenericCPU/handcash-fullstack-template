import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getAccountClient, getMinter, Connect } from "@/lib/items-client"
import { saveCollection, getCollections as getLocalCollections } from "@/lib/collections-storage"

export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const accountClient = getAccountClient(businessAuthToken)

    let apiCollections: unknown[] = []

    try {
      // Fetch items inventory which includes collection info
      const { data, error } = await Connect.getItemsInventory({
        client: accountClient,
        body: {},
      })

      if (error) {
        throw new Error(error.message || "Failed to get items inventory")
      }

      // Handle different response structures (API returns {items: [...]} or just array)
      const items = data?.items || data || []
      
      // Extract unique collections from items
      const collectionMap = new Map<string, unknown>()
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item?.collection && !collectionMap.has(item.collection.id)) {
            collectionMap.set(item.collection.id, item.collection)
          }
        }
      }
      apiCollections = Array.from(collectionMap.values())
    } catch (getError) {
      console.error("Error fetching collections from API:", getError)
      apiCollections = []
    }

    // Get locally stored collections
    let localCollections: unknown[] = []
    try {
      localCollections = await getLocalCollections()
    } catch (localError) {
      console.error("Error fetching local collections:", localError)
      localCollections = []
    }

    // Merge collections: API collections take precedence, but include local ones not in API
    const mergedCollectionsMap = new Map<string, unknown>()
    
    // First add API collections
    for (const coll of apiCollections) {
      if (coll && typeof coll === "object" && "id" in coll) {
        mergedCollectionsMap.set(coll.id as string, coll)
      }
    }
    
    // Then add local collections that aren't already in the map
    for (const coll of localCollections) {
      if (coll && typeof coll === "object" && "id" in coll) {
        const collId = coll.id as string
        if (!mergedCollectionsMap.has(collId)) {
          mergedCollectionsMap.set(collId, coll)
        }
      }
    }

    const mergedCollections = Array.from(mergedCollectionsMap.values())
    
    // Format collections to ensure consistent structure
    const formattedCollections = mergedCollections.map((coll: any) => {
      if (coll && typeof coll === "object" && "id" in coll) {
        return {
          id: coll.id as string,
          name: coll.name || undefined,
        }
      }
      return coll
    })

    return NextResponse.json({ success: true, collections: formattedCollections })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Collections error:", error)
    return NextResponse.json({ error: "Failed to fetch collections", details: message }, { status: 500 })
  }
}

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

    const createdCollection = items[0]
    
    // Save collection to local file
    if (createdCollection?.id) {
      try {
        await saveCollection({
          id: createdCollection.id,
          name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          createdAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[v0] Failed to save collection to local file:", error)
        // Don't fail the request if file save fails
      }
    }

    return NextResponse.json({
      success: true,
      collection: createdCollection,
      collectionId: createdCollection?.id,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Create collection error:", error)
    return NextResponse.json({ error: "Failed to create collection", details: message }, { status: 500 })
  }
}


