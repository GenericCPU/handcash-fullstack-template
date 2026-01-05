import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const hasAppId = !!process.env.HANDCASH_APP_ID
  const hasAppSecret = !!process.env.HANDCASH_APP_SECRET

  return NextResponse.json({ 
    hasAppId,
    hasAppSecret,
    isConfigured: hasAppId && hasAppSecret
  })
}



