import { NextResponse } from "next/server"
import { generateAuthenticationKeyPair, createAuthJWT } from "@/lib/auth-utils"
import { getAuthAppId } from "@/lib/business-client"

export async function GET() {
  try {
    const appId = getAuthAppId()

    const { privateKey, publicKey } = generateAuthenticationKeyPair()

    const authToken = privateKey

    const jwt = await createAuthJWT(authToken)

    const redirectUrl = `https://preprod-market.handcash.io/connect?appId=${appId}&publicKey=${publicKey}`

    return NextResponse.json({
      redirectUrl,
      jwt,
      publicKey,
    })
  } catch (error) {
    console.error("[v0] Login route error:", error)
    return NextResponse.json({ error: "Failed to generate login URL" }, { status: 500 })
  }
}
