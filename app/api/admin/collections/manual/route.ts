import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { saveCollection } from "@/lib/collections-storage"

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const body = await request.json()
    const { collectionIds } = body

    if (!collectionIds || !Array.isArray(collectionIds) || collectionIds.length === 0) {
      return NextResponse.json({ error: "Collection IDs are required" }, { status: 400 })
    }

    const saved: string[] = []
    const errors: string[] = []

    for (const collectionId of collectionIds) {
      const trimmedId = collectionId.trim()
      if (!trimmedId) continue

      try {
        // Save collection with just the ID - name/details can be filled in later
        await saveCollection({
          id: trimmedId,
          name: trimmedId, // Use ID as name for now
          createdAt: new Date().toISOString(),
        })
        saved.push(trimmedId)
      } catch (error) {
        errors.push(`${trimmedId}: ${error instanceof Error ? error.message : "Failed to save"}`)
      }
    }

    return NextResponse.json({
      success: true,
      saved,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Manual collection save error:", error)
    return NextResponse.json({ error: "Failed to save collections", details: message }, { status: 500 })
  }
}



