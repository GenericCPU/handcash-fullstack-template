import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Clear the auth token cookie
  response.cookies.delete("handcash_auth_token")

  return response
}
