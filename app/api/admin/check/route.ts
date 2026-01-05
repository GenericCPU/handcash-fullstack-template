import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"

export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  return NextResponse.json({ success: true, authorized: true })
}



