import { type NextRequest, NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getBusinessClient } from "@/lib/business-client"

export async function GET(request: NextRequest) {
  try {
    // Still require admin to be authenticated
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Use business client for operations
    const client = getBusinessClient()

    console.log("[v0] Fetching inventory with business client...")

    const result = await Connect.getItemsInventory({
      client,
      body: {},
    })

    console.log("[v0] Full result:", JSON.stringify(result, null, 2))
    console.log("[v0] result.data:", JSON.stringify(result.data, null, 2))
    console.log("[v0] result.response:", JSON.stringify(result.response, null, 2))

    const items = result.data?.items || result.data || result.response?.items || result.response || []

    return NextResponse.json({
      success: true,
      items: Array.isArray(items) ? items : [],
      _debug: {
        resultKeys: Object.keys(result),
        dataType: typeof result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        rawData: result.data,
        responseType: typeof result.response,
        responseKeys: result.response ? Object.keys(result.response) : [],
        rawResponse: result.response,
        error: result.error,
      },
    })
  } catch (error) {
    console.error("[v0] Inventory error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch inventory",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
