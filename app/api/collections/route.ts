import { type NextRequest, NextResponse } from "next/server"
import { getCollections as getLocalCollections } from "@/lib/collections-storage"

export async function GET(request: NextRequest) {
  try {
    // Get locally stored collections (public endpoint - no auth required)
    // This allows users to see collection names even if they're not in the API response
    let localCollections: unknown[] = []
    try {
      localCollections = await getLocalCollections()
    } catch (localError) {
      console.error("Error fetching local collections:", localError)
      localCollections = []
    }

    // Format collections to ensure consistent structure
    const formattedCollections = localCollections.map((coll: any) => {
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



