"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MediaPreview } from "@/components/admin/media-preview"

interface Collection {
  id: string
  name: string
}

interface ItemTemplate {
  id: string
  name: string
  description?: string
  imageUrl?: string
  multimediaUrl?: string
  collectionId: string
  attributes?: Array<{
    name: string
    value: string | number
    displayType?: "string" | "number"
  }>
  rarity?: string
  color?: string
}

interface ItemTemplateCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  template?: ItemTemplate | null
}

export function ItemTemplateCreateDialog({ open, onOpenChange, onSuccess, template }: ItemTemplateCreateDialogProps) {
  const isEditMode = !!template
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [multimediaUrl, setMultimediaUrl] = useState("")
  const [collectionId, setCollectionId] = useState("")
  const [rarity, setRarity] = useState("Common")
  const [color, setColor] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCollections()
      if (template) {
        // Pre-fill form with template data
        setName(template.name || "")
        setDescription(template.description || "")
        setImageUrl(template.imageUrl || "")
        setMultimediaUrl(template.multimediaUrl || "")
        setCollectionId(template.collectionId || "")
        setRarity(template.rarity || "Common")
        setColor(template.color || "")
      } else {
        // Reset form for new template
        setName("")
        setDescription("")
        setImageUrl("")
        setMultimediaUrl("")
        setCollectionId("")
        setRarity("Common")
        setColor("")
      }
    }
  }, [open, template])

  const fetchCollections = async () => {
    setIsLoadingCollections(true)
    try {
      const response = await fetch("/api/admin/collections", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch collections")
      }

      const data = await response.json()
      setCollections(data.collections || [])
    } catch (err: any) {
      console.error("[v0] Collections fetch error:", err)
      setError("Failed to load collections")
    } finally {
      setIsLoadingCollections(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !collectionId) {
      setError("Please fill in all required fields")
      return
    }

    if (!imageUrl.trim() && !multimediaUrl.trim()) {
      setError("Please provide either an image URL or multimedia URL (GLB)")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const url = "/api/admin/item-templates"
      const method = isEditMode ? "PUT" : "POST"
      const body = isEditMode
        ? {
            id: template!.id,
            name: name.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            multimediaUrl: multimediaUrl.trim() || undefined,
            collectionId,
            rarity: rarity || "Common",
            color: color.trim() || undefined,
          }
        : {
            name: name.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            multimediaUrl: multimediaUrl.trim() || undefined,
            collectionId,
            rarity: rarity || "Common",
            color: color.trim() || undefined,
          }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create template")
      }

      // Reset form
      setName("")
      setDescription("")
      setImageUrl("")
      setMultimediaUrl("")
      setCollectionId("")
      setRarity("Common")
      setColor("")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("[v0] Create template error:", err)
      setError(err.message || "Failed to create template")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Item Template" : "Create Item Template"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the template that can be used to mint items to multiple users"
              : "Create a template that can be used to mint items to multiple users"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateName"
              placeholder="Enter template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              placeholder="Enter template description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateImageUrl">Image URL (Optional)</Label>
              <Input
                id="templateImageUrl"
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">PNG, JPG, etc.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateMultimediaUrl">Multimedia URL - GLB (Optional)</Label>
              <Input
                id="templateMultimediaUrl"
                type="url"
                placeholder="https://example.com/model.glb"
                value={multimediaUrl}
                onChange={(e) => setMultimediaUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">3D model (GLB format)</p>
            </div>
          </div>

          {(imageUrl || multimediaUrl) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border border-border rounded-lg overflow-hidden bg-muted/50 aspect-square max-h-64">
                <MediaPreview imageUrl={imageUrl} multimediaUrl={multimediaUrl} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {!imageUrl && !multimediaUrl && (
            <p className="text-xs text-muted-foreground">At least one media URL (image or GLB) is required</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="templateCollection">
              Collection <span className="text-red-500">*</span>
            </Label>
            <Select value={collectionId} onValueChange={setCollectionId} disabled={isLoading || isLoadingCollections}>
              <SelectTrigger id="templateCollection">
                <SelectValue placeholder={isLoadingCollections ? "Loading collections..." : "Select a collection"} />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateRarity">Rarity</Label>
              <Select value={rarity} onValueChange={setRarity} disabled={isLoading}>
                <SelectTrigger id="templateRarity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common">Common</SelectItem>
                  <SelectItem value="Uncommon">Uncommon</SelectItem>
                  <SelectItem value="Rare">Rare</SelectItem>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Legendary">Legendary</SelectItem>
                  <SelectItem value="Diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateColor">Color (optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="templateColor"
                  value={color || "#000000"}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isLoading}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  placeholder="#FF0000"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading || !name.trim() || !collectionId || (!imageUrl.trim() && !multimediaUrl.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Template" : "Create Template"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

