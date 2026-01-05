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
import { Loader2, Sparkles, Plus, X, FolderPlus, RefreshCw, Pencil, Trash2, FolderOpen } from "lucide-react"
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
  const [mediaUrl, setMediaUrl] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [destination, setDestination] = useState("")
  const [attributes, setAttributes] = useState<Attribute[]>([])

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

  useImperativeHandle(ref, () => ({
    prefillMintForm: (data: MintPrefillData) => {
      setCollectionId(data.collectionId)
      setName(data.name)
      setDescription(data.description)
      setMediaUrl(data.mediaUrl)
      setAttributes(data.attributes.length > 0 ? data.attributes : [])
      setActiveTab("mint")
      setSuccess("Form prefilled from inventory item")
      setTimeout(() => setSuccess(null), 3000)
    },
  }))

  const fetchCollections = async () => {
    setIsLoadingCollections(true)
    try {
      const response = await fetch("/api/collections", {
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
      const response = await fetch("/api/collections", {
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
      const response = await fetch("/api/collections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          collectionId: editingCollection.id,
          name: editName,
          description: editDescription || undefined,
          imageUrl: editImageUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to update collection")
      }

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
      const response = await fetch(`/api/collections?collectionId=${deletingCollectionId}`, {
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

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsMinting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          collectionId,
          name,
          description,
          mediaUrl: mediaUrl || undefined,
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
      setMediaUrl("")
      setQuantity("1")
      setDestination("")
      setAttributes([])
    } catch (err: any) {
      console.error("[v0] Mint error:", err)
      setError(err.message || "Failed to mint items")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Mint & Collections</h3>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCollections} disabled={isLoadingCollections}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingCollections ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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
                <Label htmlFor="collectionId">Collection ID</Label>
                <Input
                  id="collectionId"
                  type="text"
                  placeholder="Enter collection ID"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the collection ID from when you created the collection
                </p>
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

              <div className="space-y-2">
                <Label htmlFor="mediaUrl">Media URL</Label>
                <Input
                  id="mediaUrl"
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Image URL is required for minting items</p>
              </div>

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
                    placeholder="@handle or paymail"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
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

              <Button type="submit" className="w-full" disabled={isMinting || !collectionId || !mediaUrl}>
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
            {isLoadingCollections ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No collections yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first collection using the "Create Collection" tab.
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
                      <p className="font-medium truncate">{col.name}</p>
                      {col.description && <p className="text-sm text-muted-foreground truncate">{col.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{col.id}</p>
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
