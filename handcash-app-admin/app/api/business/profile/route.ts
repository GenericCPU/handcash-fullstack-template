import { NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getTargetAppSDK } from "@/lib/business-client"

export async function GET() {
  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN

    console.log("[v0] Business profile request - businessAuthToken exists:", !!businessAuthToken)

    if (!businessAuthToken) {
      return NextResponse.json({ error: "Business auth token not configured" }, { status: 500 })
    }

    const sdk = getTargetAppSDK()
    const client = sdk.getAccountClient(businessAuthToken)
    console.log("[v0] Client created successfully")

    const result = await Connect.getCurrentUserProfile({ client })
    console.log("[v0] Full result from getCurrentUserProfile:", JSON.stringify(result, null, 2))

    if (result.error) {
      console.error("[v0] Business profile error:", result.error)
      return NextResponse.json({ error: "Failed to fetch business profile" }, { status: 500 })
    }

    const profile = result.data || result
    console.log("[v0] Returning profile:", JSON.stringify(profile, null, 2))

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Business profile route error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch business profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
