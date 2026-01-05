import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"

export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return NextResponse.json({ isAdmin: false })
  }

  return NextResponse.json({ isAdmin: true })
}



