import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { getTemplateById } from "@/lib/item-templates-storage"
import { getMinter, resolveHandlesToUserIds, getBusinessClient, Connect } from "@/lib/items-client"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Apply rate limiting before auth check
  const rateLimitResponse = rateLimit(request, RateLimitPresets.mint)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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

    // Get business wallet profile to support business wallet handle/ID
    let businessWalletId: string | null = null
    let businessWalletHandle: string | null = null
    try {
      const businessClient = getBusinessClient()
      const result = await Connect.getCurrentUserProfile({ client: businessClient as any })
      if (result.error) {
        throw new Error((result.error as any).message || "Failed to get profile")
      }
      const profile = result.data || result
      if (profile) {
        businessWalletId = (profile as any).publicProfile?.id || (profile as any).id
        businessWalletHandle = (profile as any).publicProfile?.handle?.toLowerCase().replace(/^[@$]/, "") || null
      }
    } catch (err) {
      console.error("[MintTemplate] Failed to get business wallet profile:", err)
    }

    // Parse inputs (handles, user IDs, or business wallet handle)
    const cleanInputs = handles
      .map((h: string) => h.trim())
      .filter((h: string) => h.length > 0)
      .map((h: string) => {
        // Support business wallet handle
        const lower = h.toLowerCase().replace(/^[@$]/, "")
        if (businessWalletHandle && (lower === businessWalletHandle || lower === "business" || lower === "businesswallet")) {
          return businessWalletId || h
        }
        return h
      })

    // Resolve handles/IDs to user IDs (accepts both handles and IDs)
    const handleMap = await resolveHandlesToUserIds(cleanInputs, businessAuthToken)

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

    const items: Array<any> = []

    // Build user ID list - check both original input and resolved map
    for (const input of cleanInputs) {
      const lower = input.toLowerCase()
      let userId: string | undefined

      // Check if it's already a user ID
      if (/^[a-f0-9]{24,}$/i.test(input)) {
        userId = input
      } else {
        // Look up in resolved map
        userId = handleMap[lower]
      }

      if (!userId) {
        continue // Skip inputs that couldn't be resolved
      }

      items.push({
        ...itemData,
        user: userId,
        actions: [],
      })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No valid handles or user IDs could be resolved" }, { status: 400 })
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

