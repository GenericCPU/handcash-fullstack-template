import { type NextRequest, NextResponse } from "next/server"
import { verifyAuthJWT } from "@/lib/auth-utils"
import { Connect } from "@handcash/sdk"
import { getAdminHandle, getAuthAppSDK } from "@/lib/business-client"

async function validateAdminAccess(authToken: string): Promise<{ isValid: boolean; handle?: string }> {
  const sdk = getAuthAppSDK()
  const client = sdk.getAccountClient(authToken)

  try {
    const { data: profile } = await Connect.getCurrentUserProfile({ client })
    const userHandle = profile?.publicProfile?.handle?.toLowerCase()
    const adminHandle = getAdminHandle()

    console.log("[v0] User handle:", userHandle, "Admin handle:", adminHandle)

    if (userHandle !== adminHandle) {
      console.log("[v0] Access denied: User is not admin")
      return { isValid: false, handle: userHandle }
    }

    return { isValid: true, handle: userHandle }
  } catch (error) {
    console.error("[v0] Profile validation error:", error)
    return { isValid: false }
  }
}

export async function GET(request: NextRequest) {
  console.log("[v0] Callback GET request received - redirecting to auth callback page")
  return NextResponse.redirect(new URL("/auth/callback", request.url))
}

export async function POST(request: NextRequest) {
  console.log("[v0] Callback POST request received")

  try {
    const body = await request.json()
    const { jwt } = body

    console.log("[v0] Received JWT:", jwt ? "present" : "missing")

    if (!jwt) {
      return NextResponse.json({ error: "Missing JWT" }, { status: 400 })
    }

    const authToken = await verifyAuthJWT(jwt)
    console.log("[v0] JWT verified, authToken extracted")

    const { isValid, handle } = await validateAdminAccess(authToken)

    if (!isValid) {
      console.log("[v0] Admin access denied for handle:", handle)
      return NextResponse.json({ error: "Unauthorized: Only admin handle can access this dashboard" }, { status: 403 })
    }

    console.log("[v0] Admin access granted for handle:", handle)

    const response = NextResponse.json({ success: true })

    response.cookies.set("handcash_auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Callback POST error:", error)
    return NextResponse.json(
      {
        error: "Failed to process callback",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
