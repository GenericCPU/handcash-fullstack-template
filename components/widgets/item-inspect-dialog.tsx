"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from "lucide-react"
import { MediaPreview } from "@/components/admin/media-preview"

interface InventoryItem {
  id: string
  origin?: string
  name: string
  description?: string
  imageUrl?: string
  multimediaUrl?: string
  rarity?: string
  color?: string
  collection?: {
    id: string
    name?: string
  }
  attributes?: Array<{
    name: string
    value: string | number
  }>
}

interface ItemInspectDialogProps {
  item: InventoryItem
  open: boolean
  onOpenChange: (open: boolean) => void
  collections?: Array<{ id: string; name?: string }>
}

export function ItemInspectDialog({ item, open, onOpenChange, collections = [] }: ItemInspectDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedTemplateId, setCopiedTemplateId] = useState(false)
  const [copiedCollectionId, setCopiedCollectionId] = useState(false)

  // Find template ID from attributes
  const templateIdAttr = item.attributes?.find((attr) => attr.name === "Template ID")
  const templateId = templateIdAttr?.value?.toString()

  // Find collection name from collections list
  const collectionName = item.collection?.id
    ? (collections.find((col) => col.id === item.collection?.id)?.name || item.collection?.name || undefined)
    : undefined

  const copyToClipboard = async (text: string, type: "id" | "templateId" | "collectionId") => {
    await navigator.clipboard.writeText(text)
    if (type === "id") {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 2000)
    } else if (type === "templateId") {
      setCopiedTemplateId(true)
      setTimeout(() => setCopiedTemplateId(false), 2000)
    } else if (type === "collectionId") {
      setCopiedCollectionId(true)
      setTimeout(() => setCopiedCollectionId(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
          <DialogDescription>Inspect item information and metadata</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Media Preview */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted/50 border">
              <MediaPreview
                imageUrl={item.imageUrl}
                multimediaUrl={item.multimediaUrl}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Rarity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl font-bold">{item.name}</h3>
              {item.rarity && (
                <Badge variant="secondary" className="rounded-full text-sm font-semibold">
                  {item.rarity}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-muted-foreground">{item.description}</p>
            )}
          </div>

          {/* Item ID */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Item ID</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">{item.id}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => copyToClipboard(item.id, "id")}
                type="button"
              >
                {copiedId === item.id ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Template ID */}
          {templateId && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Template ID</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">{templateId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={() => copyToClipboard(templateId, "templateId")}
                  type="button"
                >
                  {copiedTemplateId ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Collection */}
          {item.collection?.id && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Collection</label>
              <div className="space-y-2">
                {collectionName ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{collectionName}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">Collection name not available</p>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{item.collection.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => copyToClipboard(item.collection!.id, "collectionId")}
                    type="button"
                  >
                    {copiedCollectionId ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Color */}
          {item.color && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Color</label>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className="w-12 h-12 rounded border-2 border-border"
                  style={{ backgroundColor: item.color }}
                />
                <code className="text-sm font-mono">{item.color}</code>
              </div>
            </div>
          )}

          {/* Attributes - Show all attributes */}
          {item.attributes && item.attributes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Attributes</label>
              <div className="space-y-2">
                {item.attributes.map((attr, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{attr.name}</span>
                      <Badge variant="outline" className="text-xs rounded-full">
                        {attr.value}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
