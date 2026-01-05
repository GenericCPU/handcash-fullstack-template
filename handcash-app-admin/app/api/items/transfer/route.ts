import { NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getTargetAppSDK } from "@/lib/business-client"

export async function POST(request: Request) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemOrigin, destination } = await request.json()

    if (!itemOrigin) {
      return NextResponse.json({ error: "Item origin is required" }, { status: 400 })
    }

    if (!destination) {
      return NextResponse.json({ error: "Destination handle is required" }, { status: 400 })
    }

    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN

    if (!businessAuthToken) {
      return NextResponse.json({ error: "Business auth token not configured" }, { status: 500 })
    }

    const sdk = getTargetAppSDK()
    const client = sdk.getAccountClient(businessAuthToken)

    // Clean up destination - remove @ if present
    const cleanDestination = destination.startsWith("@") ? destination.slice(1) : destination

    const result = await Connect.transferItem({
      client,
      body: {
        itemOrigin,
        destination: cleanDestination,
      },
    })

    return NextResponse.json({
      success: true,
      transactionId: result.data?.transactionId || result.response?.transactionId,
      message: `Item transferred to ${cleanDestination}`,
    })
  } catch (error: any) {
    console.error("[v0] Transfer error:", error)
    return NextResponse.json(
      {
        error: "Failed to transfer item",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
