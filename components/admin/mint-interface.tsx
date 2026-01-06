"use client"

import type React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Plus, X, FolderPlus, Pencil, Trash2, FolderOpen, Copy, Check, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Collection {
  id: string
  name: string
  description?: string
  imageUrl?: string
  totalQuantity?: number
  createdAt?: string
}

interface Attribute {
  name: string
  value: string
}

export interface MintPrefillData {
  collectionId: string
  name: string
  description: string
  mediaUrl: string
  attributes: Attribute[]
}

export interface MintInterfaceRef {
  prefillMintForm: (data: MintPrefillData) => void
}

export const MintInterface = forwardRef<MintInterfaceRef, {}>(function MintInterface(props, ref) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [isMinting, setIsMinting] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false)
  const [isDeletingCollection, setIsDeletingCollection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState("mint")

  // Mint form state
  const [collectionId, setCollectionId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [multimediaUrl, setMultimediaUrl] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [destination, setDestination] = useState("")
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [rarity, setRarity] = useState("Common")
  const [color, setColor] = useState("")
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  // Create collection form state
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newCollectionImageUrl, setNewCollectionImageUrl] = useState("")

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null)
  const [deletingCollectionName, setDeletingCollectionName] = useState<string>("")

  // Manual collection input state
  const [manualCollectionIds, setManualCollectionIds] = useState("")
  const [isSavingManual, setIsSavingManual] = useState(false)

  // Collection editing state
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null)
  const [editingCollectionName, setEditingCollectionName] = useState("")
  const [isUpdatingCollectionName, setIsUpdatingCollectionName] = useState(false)
  const [copiedCollectionId, setCopiedCollectionId] = useState<string | null>(null)

  useImperativeHandle(ref, () => ({
    prefillMintForm: (data: MintPrefillData) => {
      setCollectionId(data.collectionId)
      setName(data.name)
      setDescription(data.description)
      setImageUrl(data.imageUrl || "")
      setMultimediaUrl(data.multimediaUrl || "")
      setAttributes(data.attributes.length > 0 ? data.attributes : [])
      setRarity("Common")
      setColor("")
      setActiveTab("mint")
      setSuccess("Form prefilled from inventory item")
      setTimeout(() => setSuccess(null), 3000)
    },
  }))

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

  useEffect(() => {
    fetchCollections()
  }, [])

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: "name" | "value", value: string) => {
    const updated = [...attributes]
    updated[index][field] = value
    setAttributes(updated)
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingCollection(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription || undefined,
          imageUrl: newCollectionImageUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create collection")
      }

      setSuccess(`Collection "${newCollectionName}" created successfully!`)
      setNewCollectionName("")
      setNewCollectionDescription("")
      setNewCollectionImageUrl("")
      fetchCollections()
    } catch (err: any) {
      console.error("[v0] Create collection error:", err)
      setError(err.message || "Failed to create collection")
    } finally {
      setIsCreatingCollection(false)
    }
  }

  const handleEditClick = (collection: Collection) => {
    setEditingCollection(collection)
    setEditName(collection.name)
    setEditDescription(collection.description || "")
    setEditImageUrl(collection.imageUrl || "")
    setEditDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleUpdateCollection = async () => {
    if (!editingCollection) return

    setIsUpdatingCollection(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/collections/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: editingCollection.id,
          name: editName,
          description: editDescription || undefined,
          imageUrl: editImageUrl || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || "Failed to update collection")
      }

      const data = await response.json().catch(() => ({ success: true }))

      setSuccess(`Collection "${editName}" updated successfully!`)
      setEditDialogOpen(false)
      setEditingCollection(null)
      fetchCollections()
    } catch (err: any) {
      console.error("[v0] Update collection error:", err)
      setError(err.message || "Failed to update collection")
    } finally {
      setIsUpdatingCollection(false)
    }
  }

  const handleDeleteClick = (collection: Collection) => {
    setDeletingCollectionId(collection.id)
    setDeletingCollectionName(collection.name)
    setDeleteDialogOpen(true)
    setError(null)
    setSuccess(null)
  }

  const handleDeleteCollection = async () => {
    if (!deletingCollectionId) return

    setIsDeletingCollection(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/collections?collectionId=${deletingCollectionId}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to delete collection")
      }

      setSuccess(`Collection "${deletingCollectionName}" deleted successfully!`)
      setDeleteDialogOpen(false)
      setDeletingCollectionId(null)
      setDeletingCollectionName("")
      fetchCollections()
    } catch (err: any) {
      console.error("[v0] Delete collection error:", err)
      setError(err.message || "Failed to delete collection")
    } finally {
      setIsDeletingCollection(false)
    }
  }

  const handleSaveManualCollections = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCollectionIds.trim()) return

    setIsSavingManual(true)
    setError(null)
    setSuccess(null)

    try {
      // Split by comma and clean up
      const ids = manualCollectionIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      if (ids.length === 0) {
        setError("Please enter at least one collection ID")
        setIsSavingManual(false)
        return
      }

      const response = await fetch("/api/admin/collections/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ collectionIds: ids }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to save collections")
      }

      setSuccess(
        `Successfully saved ${data.saved.length} collection(s)${data.errors ? `. ${data.errors.length} error(s)` : ""}`,
      )
      setManualCollectionIds("")
      fetchCollections()
    } catch (err: any) {
      console.error("[v0] Save manual collections error:", err)
      setError(err.message || "Failed to save collections")
    } finally {
      setIsSavingManual(false)
    }
  }

  const handleEditCollectionName = (collection: Collection) => {
    setEditingCollectionId(collection.id)
    setEditingCollectionName(collection.name)
    setError(null)
  }

  const handleSaveCollectionName = async (collectionId: string) => {
    if (!editingCollectionName.trim()) {
      setError("Collection name cannot be empty")
      return
    }

    setIsUpdatingCollectionName(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/collections/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: collectionId,
          name: editingCollectionName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to update collection name")
      }

      setEditingCollectionId(null)
      setEditingCollectionName("")
      fetchCollections()
    } catch (err: any) {
      console.error("[v0] Update collection name error:", err)
      setError(err.message || "Failed to update collection name")
    } finally {
      setIsUpdatingCollectionName(false)
    }
  }

  const handleCopyCollectionId = async (collectionId: string) => {
    try {
      await navigator.clipboard.writeText(collectionId)
      setCopiedCollectionId(collectionId)
      setTimeout(() => setCopiedCollectionId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      setError("Failed to copy collection ID")
    }
  }

  const handleCreateTemplate = async () => {
    if (!name.trim() || !collectionId) {
      setError("Please fill in all required fields (name and collection ID)")
      return
    }

    if (!imageUrl.trim() && !multimediaUrl.trim()) {
      setError("Please provide either an image URL or multimedia URL (GLB)")
      return
    }

    setIsCreatingTemplate(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/item-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          multimediaUrl: multimediaUrl.trim() || undefined,
          collectionId,
          rarity: rarity || "Common",
          color: color.trim() || undefined,
          attributes: attributes.filter((a) => a.name && a.value).map((a) => ({
            name: a.name,
            value: a.value,
            displayType: "string" as const,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create template")
      }

      setSuccess(`Template "${name}" created successfully!`)
      // Don't clear the form - user might want to mint after creating template
    } catch (err: any) {
      console.error("[v0] Create template error:", err)
      setError(err.message || "Failed to create template")
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsMinting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/admin/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          collectionId,
          name,
          description,
          imageUrl: imageUrl || undefined,
          multimediaUrl: multimediaUrl || undefined,
          quantity: Number.parseInt(quantity, 10),
          destination: destination || undefined,
          attributes: attributes.filter((a) => a.name && a.value),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Minting failed")
      }

      setSuccess(`Successfully minted ${quantity} item(s): "${name}"`)
      setName("")
      setDescription("")
      setImageUrl("")
      setMultimediaUrl("")
      setQuantity("1")
      setDestination("")
      setAttributes([])
      setRarity("Common")
      setColor("")
    } catch (err: any) {
      console.error("[v0] Mint error:", err)
      setError(err.message || "Failed to mint items")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Mint & Collections</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="mint">Mint Items</TabsTrigger>
            <TabsTrigger value="collection">Create Collection</TabsTrigger>
            <TabsTrigger value="manage">Manage Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="mint">
            <form onSubmit={handleMint} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collectionId">Collection</Label>
                <Select value={collectionId} onValueChange={setCollectionId} disabled={isLoadingCollections}>
                  <SelectTrigger id="collectionId">
                    <SelectValue placeholder={isLoadingCollections ? "Loading collections..." : "Select a collection"} />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{collection.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{collection.id}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {collections.length === 0 && !isLoadingCollections && (
                  <p className="text-xs text-muted-foreground">
                    No collections available. Create a collection first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  type="text"
                  placeholder="Enter item name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea
                  id="itemDescription"
                  placeholder="Enter item description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPG, etc.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multimediaUrl">Multimedia URL - GLB (Optional)</Label>
                  <Input
                    id="multimediaUrl"
                    type="url"
                    placeholder="https://example.com/model.glb"
                    value={multimediaUrl}
                    onChange={(e) => setMultimediaUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">3D model (GLB format)</p>
                </div>
              </div>
              {!imageUrl && !multimediaUrl && (
                <p className="text-xs text-muted-foreground">At least one media URL (image or GLB) is required</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination (Optional)</Label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="@handle, user ID, or paymail"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select value={rarity} onValueChange={setRarity}>
                    <SelectTrigger id="rarity">
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
                  <Label htmlFor="color">Color (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="color"
                      value={color || "#000000"}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      placeholder="#FF0000"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Attributes (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Attribute
                  </Button>
                </div>

                {attributes.length > 0 && (
                  <div className="space-y-2">
                    {attributes.map((attr, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name"
                          value={attr.name}
                          onChange={(e) => updateAttribute(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={attr.value}
                          onChange={(e) => updateAttribute(index, "value", e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateTemplate}
                  disabled={isCreatingTemplate || isMinting || !collectionId || !name.trim() || (!imageUrl && !multimediaUrl)}
                  className="w-full"
                >
                  {isCreatingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Template...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Template
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isMinting || isCreatingTemplate || !collectionId || (!imageUrl && !multimediaUrl)}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mint Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="collection">
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collectionName">Collection Name</Label>
                <Input
                  id="collectionName"
                  type="text"
                  placeholder="Enter collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectionDescription">Description (Optional)</Label>
                <Textarea
                  id="collectionDescription"
                  placeholder="Enter collection description..."
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectionImageUrl">Collection Image URL (Optional)</Label>
                <Input
                  id="collectionImageUrl"
                  type="url"
                  placeholder="https://example.com/collection-image.png"
                  value={newCollectionImageUrl}
                  onChange={(e) => setNewCollectionImageUrl(e.target.value)}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isCreatingCollection || !newCollectionName}>
                {isCreatingCollection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Collection
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-6">
              {/* Manual Collection Input */}
              <div className="p-4 bg-muted/50 rounded-2xl border border-dashed">
                <form onSubmit={handleSaveManualCollections} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="manualCollectionIds" className="text-sm font-medium">
                      Missing a collection? Add it here
                    </Label>
                    <Input
                      id="manualCollectionIds"
                      type="text"
                      placeholder="collection-id-1, collection-id-2, collection-id-3"
                      value={manualCollectionIds}
                      onChange={(e) => setManualCollectionIds(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Enter collection IDs separated by commas</p>
                  </div>
                  <Button type="submit" size="sm" disabled={isSavingManual || !manualCollectionIds.trim()}>
                    {isSavingManual ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add Collections"
                    )}
                  </Button>
                </form>
              </div>

              {isLoadingCollections ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No collections yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first collection using the "Create Collection" tab or add collection IDs above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
                  </Alert>
                )}

                <p className="text-sm text-muted-foreground mb-4">
                  {collections.length} collection{collections.length !== 1 ? "s" : ""} found
                </p>

                {collections.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {col.imageUrl ? (
                      <img
                        src={col.imageUrl || "/placeholder.svg"}
                        alt={col.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {editingCollectionId === col.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingCollectionName}
                            onChange={(e) => setEditingCollectionName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveCollectionName(col.id)
                              } else if (e.key === "Escape") {
                                setEditingCollectionId(null)
                                setEditingCollectionName("")
                              }
                            }}
                            className="h-8 text-sm font-medium"
                            autoFocus
                            disabled={isUpdatingCollectionName}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveCollectionName(col.id)}
                            disabled={isUpdatingCollectionName}
                          >
                            {isUpdatingCollectionName ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCollectionId(null)
                              setEditingCollectionName("")
                            }}
                            disabled={isUpdatingCollectionName}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <p
                          className="font-medium truncate cursor-pointer hover:text-primary"
                          onClick={() => handleEditCollectionName(col)}
                          title="Click to edit name"
                        >
                          {col.name}
                        </p>
                      )}
                      {col.description && <p className="text-sm text-muted-foreground truncate">{col.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground font-mono">{col.id}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleCopyCollectionId(col.id)}
                          title="Copy collection ID"
                        >
                          {copiedCollectionId === col.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(col)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(col)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Collection Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>Update your collection details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCollectionName">Collection Name</Label>
              <Input
                id="editCollectionName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCollectionDescription">Description (Optional)</Label>
              <Textarea
                id="editCollectionDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCollectionImageUrl">Collection Image URL (Optional)</Label>
              <Input
                id="editCollectionImageUrl"
                type="url"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCollection} disabled={isUpdatingCollection || !editName}>
              {isUpdatingCollection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCollectionName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              disabled={isDeletingCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCollection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})
