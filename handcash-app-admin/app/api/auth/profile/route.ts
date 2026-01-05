import { type NextRequest, NextResponse } from "next/server"
import { Connect } from "@handcash/sdk"
import { getAuthAppSDK } from "@/lib/business-client"

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const sdk = getAuthAppSDK()
    const client = sdk.getAccountClient(authToken)

    const { data: profile } = await Connect.getCurrentUserProfile({ client })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Profile route error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
