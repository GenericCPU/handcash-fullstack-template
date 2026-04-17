import { type NextRequest, NextResponse } from "next/server"
import { handcashService } from "@/lib/handcash-service"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"
import { parseDestinationList, type ClassifiedDestination } from "@/lib/transfer-destinations"

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

    const classified = parseDestinationList(destinationsList)
    if (!classified) {
      return NextResponse.json(
        {
          error:
            "Invalid destination. Use a HandCash handle (e.g. Username or $Username), a paymail (user@handcash.io), or a supported Bitcoin address.",
        },
        { status: 400 },
      )
    }

    const hasOpaque = classified.some((c) => c.kind === "opaque")
    if (classified.length > 1 && hasOpaque) {
      return NextResponse.json(
        {
          error:
            "Multiple destinations are only supported for HandCash handles. Use one paymail or address per request.",
        },
        { status: 400 },
      )
    }

    const handleEntries = classified.filter((c): c is Extract<ClassifiedDestination, { kind: "handle" }> => c.kind === "handle")
    const handleCleans = handleEntries.map((c) => c.clean)
    const handleMap =
      handleCleans.length > 0 ? await handcashService.resolveHandles(privateKey, handleCleans) : {}

    const finalDestinations: string[] = []
    for (const c of classified) {
      if (c.kind === "opaque") {
        finalDestinations.push(c.value)
        continue
      }
      if (!handleMap[c.clean.toLowerCase()]) {
        return NextResponse.json(
          { error: `No HandCash user found for handle "${c.raw}". Check spelling or use a paymail.` },
          { status: 400 },
        )
      }
      finalDestinations.push(c.clean)
    }

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

    // Single destination: send all items to that destination.
    // Multiple destinations: send 1 item to each (origins[i] -> destinations[i]).
    let result: unknown
    if (finalDestinations.length === 1) {
      result = await handcashService.transferItems(privateKey, {
        origins: finalOrigins,
        destination: finalDestinations[0],
      })
    } else {
      const transfers = finalDestinations.map((dest, i) => ({
        origins: [finalOrigins[i]],
        destination: dest,
      }))
      await handcashService.transferItemBatch(privateKey, transfers)
      result = { batch: true }
    }

    return NextResponse.json({ success: true, transaction: result })
  } catch (error: any) {
    console.error("[Transfer] Transfer item error:", error)
    return NextResponse.json({ error: "Failed to transfer item", details: error.message }, { status: 500 })
  }
}
