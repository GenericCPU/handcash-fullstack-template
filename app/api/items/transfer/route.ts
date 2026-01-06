import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting before auth check
  const rateLimitResponse = rateLimit(request, RateLimitPresets.itemTransfer)
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
    const { origins, destination, destinations } = body

    const itemOrigins = Array.isArray(origins) ? origins : [origins || body.itemOrigin]

    if (!itemOrigins.length) {
      return NextResponse.json({ error: "Missing required field: origins" }, { status: 400 })
    }

    // Support both 'destination' (single or comma-separated) and 'destinations' (array)
    let destinationsList: string[] = []
    if (destinations && Array.isArray(destinations)) {
      destinationsList = destinations
    } else if (destination) {
      // Parse comma-separated destinations or single destination
      const destString = typeof destination === "string" ? destination : String(destination)
      destinationsList = destString.split(",").map((d: string) => d.trim()).filter(Boolean)
    } else {
      return NextResponse.json({ error: "Missing required field: destination or destinations" }, { status: 400 })
    }

    if (!destinationsList.length) {
      return NextResponse.json({ error: "At least one destination is required" }, { status: 400 })
    }

    // Clean and validate each destination format
    const usernamePattern = /^[\w\-_.]{3,50}$/
    const cleanDestinations: string[] = []
    for (const dest of destinationsList) {
      const clean = dest.trim().replace(/^[@$]/, "") // Remove @/$ if present
      if (!usernamePattern.test(clean)) {
        return NextResponse.json(
          { error: `Invalid username format for "${dest}": Username must be 3-50 characters and contain only letters, numbers, hyphens, underscores, and dots.` },
          { status: 400 }
        )
      }
      cleanDestinations.push(clean)
    }

    // Validate all handles exist before proceeding
    const handleMap = await handcashService.resolveHandles(privateKey, cleanDestinations)
    const validDestinations = cleanDestinations.filter((dest) => {
      return !!handleMap[dest.toLowerCase()]
    })

    if (validDestinations.length === 0) {
      return NextResponse.json(
        { error: "No valid destination handles found. All provided handles are invalid or do not exist." },
        { status: 400 }
      )
    }

    // Use only valid destinations
    const finalDestinations = validDestinations

    // If we have 1 origin but multiple destinations, auto-group by finding all items with the same groupingValue
    let finalOrigins = itemOrigins
    if (itemOrigins.length === 1 && finalDestinations.length > 1) {
      try {
        // Fetch grouped inventory to find the source item and its groupingValue
        const groupedInventory = await handcashService.getInventory(privateKey)
        const sourceItem = groupedInventory.find((item: any) => item.origin === itemOrigins[0] || item.id === itemOrigins[0])
        
        if (!sourceItem) {
          return NextResponse.json(
            { 
              error: `Item with origin "${itemOrigins[0]}" not found in inventory. Cannot auto-group items.`,
            },
            { status: 400 }
          )
        }
        
        const groupingValue = sourceItem.groupingValue
        
        if (!groupingValue) {
          return NextResponse.json(
            { 
              error: `Item does not have a groupingValue. Cannot auto-group items. Please provide all ${finalDestinations.length} item origins manually.`,
            },
            { status: 400 }
          )
        }
        
        // Fetch ungrouped inventory and filter by groupingValue (API limit: 500 items per request)
        const ungroupedInventory = await handcashService.getFullInventory(privateKey)
        
        // Filter for all items with the same groupingValue
        const matchingItems = ungroupedInventory.filter((item: any) => {
          return item.groupingValue === groupingValue && item.origin
        })
        
        // Validate we have enough items
        if (matchingItems.length < finalDestinations.length) {
          return NextResponse.json(
            { 
              error: `Not enough items with groupingValue "${groupingValue}". Found ${matchingItems.length} item(s) in inventory but need ${finalDestinations.length} for all destinations.`,
              foundItems: matchingItems.length,
              requiredItems: finalDestinations.length,
              groupingValue,
            },
            { status: 400 }
          )
        }
        
        // Use matching items (one per destination)
        finalOrigins = matchingItems.slice(0, finalDestinations.length).map((item: any) => item.origin)
      } catch (inventoryError: any) {
        console.error("[Transfer] Error fetching inventory for grouping:", inventoryError)
        console.error("[Transfer] Error stack:", inventoryError.stack)
        return NextResponse.json(
          { 
            error: `Failed to fetch inventory for auto-grouping: ${inventoryError.message || "Unknown error"}`,
            details: inventoryError.message || "Please provide all item origins manually.",
            stack: process.env.NODE_ENV === 'development' ? inventoryError.stack : undefined,
          },
          { status: 500 }
        )
      }
    }

    // Validate item/destination count matching
    if (finalDestinations.length > 1 && finalOrigins.length < finalDestinations.length) {
      return NextResponse.json(
        { 
          error: `Not enough item origins for all destinations. You have ${finalOrigins.length} item origin(s) but ${finalDestinations.length} destination(s). Each destination needs exactly 1 item origin.`,
          providedOrigins: finalOrigins.length,
          requiredOrigins: finalDestinations.length,
        },
        { status: 400 }
      )
    }

    // Transfer logic:
    // - Single destination: send all items to that destination
    // - Multiple destinations: send 1 item to each destination (items[0] -> dest[0], items[1] -> dest[1], etc.)
    const result = await handcashService.transferItems(privateKey, {
      origins: finalOrigins,
      destination: finalDestinations,
    })

    return NextResponse.json({ success: true, transaction: result })
  } catch (error: any) {
    console.error("[Transfer] Transfer item error:", error)
    return NextResponse.json({ error: "Failed to transfer item", details: error.message }, { status: 500 })
  }
}
