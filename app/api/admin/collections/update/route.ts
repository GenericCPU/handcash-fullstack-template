import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { saveCollection } from "@/lib/collections-storage"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.admin)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const body = await request.json()
    const { id, name, description, imageUrl } = body

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    await saveCollection({
      id,
      name,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Update collection error:", error)
    return NextResponse.json({ error: "Failed to update collection", details: message }, { status: 500 })
  }
}



