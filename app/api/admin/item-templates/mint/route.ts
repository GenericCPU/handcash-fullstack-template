import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getTemplateById } from "@/lib/item-templates-storage"
import { getMinter, resolveHandlesToUserIds } from "@/lib/items-client"

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN
    if (!businessAuthToken) {
      return NextResponse.json({ error: "BUSINESS_AUTH_TOKEN not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { templateId, handles } = body

    if (!templateId || !handles || !Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: templateId and handles array are required" },
        { status: 400 },
      )
    }

    // Get template
    const template = await getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Resolve handles to user IDs
    const cleanHandles = handles.map((h: string) => h.trim().replace(/^[@$]/, "")).filter((h: string) => h.length > 0)
    const handleMap = await resolveHandlesToUserIds(cleanHandles, businessAuthToken)

    // Create items for each user
    const minter = getMinter()
    
    // Build mediaDetails based on what's available
    const mediaDetails: any = {}
    if (template.multimediaUrl) {
      mediaDetails.multimedia = {
        url: template.multimediaUrl,
        contentType: "model/gltf-binary",
      }
    }
    if (template.imageUrl) {
      mediaDetails.image = {
        url: template.imageUrl,
        contentType: "image/png",
      }
    }
    
    // Add template ID as an attribute
    const attributes = [
      ...(template.attributes || []).map((attr) => ({
        name: attr.name,
        value: attr.value,
        displayType: (attr.displayType as "string" | "number") || "string",
      })),
      {
        name: "Template ID",
        value: template.id,
        displayType: "string" as const,
      },
    ]

    const itemData = {
      name: template.name,
      rarity: template.rarity || "Common",
      quantity: 1,
      attributes,
      mediaDetails,
      description: template.description,
      color: template.color,
    }

    const items: Array<{
      user: string
      name: string
      rarity: string
      quantity: number
      color?: string
      description?: string
      attributes: Array<{ name: string; value: string | number; displayType: "string" | "number" }>
      mediaDetails: { image: { url: string; contentType: string } }
    }> = []

    for (const handle of cleanHandles) {
      const userId = handleMap[handle.toLowerCase()]
      if (!userId) {
        continue // Skip handles that couldn't be resolved
      }

      items.push({
        ...itemData,
        user: userId,
      })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No valid handles could be resolved" }, { status: 400 })
    }

    // Create minting order
    const creationOrder = await minter.createItemsOrder({
      collectionId: template.collectionId,
      items,
    })

    // Wait for items to be created
    const createdItems = await minter.getOrderItems(creationOrder.id)

    return NextResponse.json({
      success: true,
      data: {
        order: creationOrder,
        items: createdItems,
        mintedCount: items.length,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Mint template error:", error)
    return NextResponse.json({ error: "Failed to mint template", details: message }, { status: 500 })
  }
}

