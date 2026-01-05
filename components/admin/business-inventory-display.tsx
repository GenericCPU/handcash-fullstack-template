"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, RefreshCw, Send, Eye, ChevronDown, ChevronUp, Flame } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ItemTransferDialog } from "@/components/widgets/item-transfer-dialog"
import { ItemInspectDialog } from "@/components/widgets/item-inspect-dialog"
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

export function BusinessInventoryDisplay() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [inspectItem, setInspectItem] = useState<InventoryItem | null>(null)
  const [isInspectOpen, setIsInspectOpen] = useState(false)
  const [collections, setCollections] = useState<Array<{ id: string; name?: string }>>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [burnItem, setBurnItem] = useState<InventoryItem | null>(null)
  const [isBurnDialogOpen, setIsBurnDialogOpen] = useState(false)
  const [isBurning, setIsBurning] = useState(false)

  const fetchInventory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/inventory", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          setIsLoading(false)
          return
        }
        throw new Error("Failed to fetch inventory")
      }

      const data = await response.json()
      setItems(data.items || [])
    } catch (err: any) {
      console.error("[v0] Business inventory fetch error:", err)
      setError(err.message || "Failed to load business wallet inventory")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransfer = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsTransferOpen(true)
  }

  const handleTransferSuccess = () => {
    fetchInventory()
    setIsTransferOpen(false)
    setSelectedItem(null)
  }

  const handleBurnClick = (item: InventoryItem) => {
    setBurnItem(item)
    setIsBurnDialogOpen(true)
  }

  const handleBurnConfirm = async () => {
    if (!burnItem || !burnItem.origin) {
      return
    }

    setIsBurning(true)
    try {
      const response = await fetch("/api/admin/items/burn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          origin: burnItem.origin,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.details || "Failed to burn item")
      }

      setIsBurnDialogOpen(false)
      setBurnItem(null)
      
      // Add a small delay to ensure the burn has propagated before refreshing
      await new Promise(resolve => setTimeout(resolve, 500))
      fetchInventory()
    } catch (err: any) {
      console.error("[v0] Burn error:", err)
      alert(err.message || "Failed to burn item")
    } finally {
      setIsBurning(false)
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/admin/collections", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const collectionsList = data.collections || []
        // Ensure collections have the correct structure
        const formattedCollections = collectionsList.map((col: any) => ({
          id: col.id,
          name: col.name || undefined,
        }))
        setCollections(formattedCollections)
      }
    } catch (err) {
      // Silently fail - collections are optional
      console.error("[v0] Failed to fetch collections:", err)
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchCollections()
  }, [])

  return (
    <>
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Business Wallet Inventory</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchInventory} disabled={isLoading} className="rounded-full">
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No items in business wallet</p>
            <p className="text-sm text-muted-foreground mt-2">Mint items to add them to the business wallet inventory</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {(isExpanded ? items : items.slice(0, 4)).map((item) => (
              <div
                key={item.id || item.origin}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg truncate flex-1">{item.name}</h4>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {item.collection?.name && (
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {item.collection.name}
                        </Badge>
                      )}
                      {item.rarity && (
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {item.rarity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                  )}
                  {item.attributes && item.attributes.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {item.attributes.map((attr, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground font-medium">{attr.name}:</span>
                          <Badge variant="outline" className="text-xs rounded-full font-normal">
                            {attr.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.color && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
                      <div
                        className="w-4 h-4 rounded border border-border shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">{item.color}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => {
                        setInspectItem(item)
                        setIsInspectOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Inspect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => handleTransfer(item)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full px-3"
                      onClick={() => handleBurnClick(item)}
                      disabled={!item.origin}
                    >
                      <Flame className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              ))}
            </div>
            {items.length > 4 && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-full"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More ({items.length - 4} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {selectedItem && (
        <ItemTransferDialog
          item={selectedItem}
          open={isTransferOpen}
          onOpenChange={setIsTransferOpen}
          onSuccess={handleTransferSuccess}
          apiEndpoint="/api/admin/items/transfer"
        />
      )}

      {inspectItem && (
        <ItemInspectDialog
          item={inspectItem}
          open={isInspectOpen}
          onOpenChange={setIsInspectOpen}
          collections={collections}
        />
      )}

      <AlertDialog open={isBurnDialogOpen} onOpenChange={setIsBurnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to burn this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item "{burnItem?.name}" will be permanently destroyed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBurning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBurnConfirm} disabled={isBurning} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isBurning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Burning...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 mr-2" />
                  Burn Item
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

