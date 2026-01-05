"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, RefreshCw, Copy, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InventoryItem {
  id: string
  origin?: string
  name: string
  description: string
  imageUrl: string
  collection?: {
    id: string
    name: string
  }
  attributes?: Array<{
    name: string
    value: string
  }>
}

interface InventoryDisplayProps {
  onCopyToMinter?: (item: {
    collectionId: string
    name: string
    description: string
    mediaUrl: string
    attributes: Array<{ name: string; value: string }>
  }) => void
}

export function InventoryDisplay({ onCopyToMinter }: InventoryDisplayProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [sendDestination, setSendDestination] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)

  const fetchInventory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inventory", {
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
      console.error("[v0] Inventory fetch error:", err)
      setError(err.message || "Failed to load inventory")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleCopyToMinter = (item: InventoryItem) => {
    if (onCopyToMinter) {
      onCopyToMinter({
        collectionId: item.collection?.id || "",
        name: item.name,
        description: item.description,
        mediaUrl: item.imageUrl,
        attributes: item.attributes || [],
      })
    }
  }

  const handleSendClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setSendDestination("")
    setSendError(null)
    setSendSuccess(null)
    setSendDialogOpen(true)
  }

  const handleSendItem = async () => {
    if (!selectedItem || !sendDestination) return

    setIsSending(true)
    setSendError(null)
    setSendSuccess(null)

    try {
      const response = await fetch("/api/items/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemOrigin: selectedItem.origin || selectedItem.id,
          destination: sendDestination,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to send item")
      }

      setSendSuccess(`Successfully sent "${selectedItem.name}" to ${sendDestination}`)
      // Refresh inventory after successful transfer
      setTimeout(() => {
        setSendDialogOpen(false)
        fetchInventory()
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Send item error:", err)
      setSendError(err.message || "Failed to send item")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Business Inventory</h3>
            <Badge variant="outline" className="text-xs">
              Business Wallet
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchInventory} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No items in business inventory yet</p>
            <p className="text-sm text-muted-foreground mt-1">Mint new items using the section below</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-1 truncate">{item.name}</h4>
                  {item.collection && (
                    <Badge variant="secondary" className="mb-2">
                      {item.collection.name}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  {item.attributes && item.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.attributes.slice(0, 3).map((attr, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {attr.name}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleCopyToMinter(item)}
                      disabled={!onCopyToMinter}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy to Minter
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => handleSendClick(item)}>
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Item</DialogTitle>
            <DialogDescription>
              Send "{selectedItem?.name}" to another user by entering their HandCash handle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedItem && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img
                  src={selectedItem.imageUrl || "/placeholder.svg?height=48&width=48"}
                  alt={selectedItem.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium">{selectedItem.name}</p>
                  {selectedItem.collection && (
                    <p className="text-sm text-muted-foreground">{selectedItem.collection.name}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="destination">Recipient Handle</Label>
              <Input
                id="destination"
                type="text"
                placeholder="@handle or paymail"
                value={sendDestination}
                onChange={(e) => setSendDestination(e.target.value)}
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                Enter the HandCash handle (with or without @) or paymail address
              </p>
            </div>

            {sendError && (
              <Alert variant="destructive">
                <AlertDescription>{sendError}</AlertDescription>
              </Alert>
            )}

            {sendSuccess && (
              <Alert>
                <AlertDescription className="text-green-600 dark:text-green-400">{sendSuccess}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSendItem} disabled={isSending || !sendDestination}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
