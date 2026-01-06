"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, RefreshCw, Send, Eye, ChevronDown, ChevronUp, Flame } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ItemTransferDialog } from "@/components/widgets/item-transfer-dialog"
import { ItemInspectDialog } from "@/components/widgets/item-inspect-dialog"
import { toast } from "sonner"
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
import { useInventory, type InventoryItem } from "@/hooks/use-inventory"

export function InventoryDisplay() {
  const { items, collections, isLoading, error, isBurning, fetchInventory, burnItem } = useInventory()
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [inspectItem, setInspectItem] = useState<InventoryItem | null>(null)
  const [isInspectOpen, setIsInspectOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [burnItemState, setBurnItemState] = useState<InventoryItem | null>(null)
  const [isBurnDialogOpen, setIsBurnDialogOpen] = useState(false)

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
    setBurnItemState(item)
    setIsBurnDialogOpen(true)
  }

  const handleBurnConfirm = async () => {
    if (!burnItemState || !burnItemState.origin) {
      return
    }

    try {
      await burnItem(burnItemState.origin)
      setIsBurnDialogOpen(false)
      setBurnItemState(null)
      toast.success("Item burned successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to burn item")
    }
  }

  return (
    <>
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">My Inventory</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchInventory()} disabled={isLoading} className="rounded-full">
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No items in your inventory yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {(isExpanded ? items : items.slice(0, 4)).map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold truncate text-base">{item.name}</h4>
                    {item.count !== undefined && item.count > 1 && (
                      <Badge variant="outline" className="rounded-full text-xs font-semibold shrink-0 ml-2">
                        ×{item.count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {item.collection?.name && (
                      <Badge variant="secondary" className="rounded-full font-semibold text-xs">
                        {item.collection.name}
                      </Badge>
                    )}
                    {item.rarity && (
                      <Badge variant="secondary" className="rounded-full font-semibold text-xs">
                        {item.rarity}
                      </Badge>
                    )}
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
                  <div className="flex gap-2 min-w-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-0 rounded-full font-semibold h-10"
                      onClick={() => {
                        setInspectItem(item)
                        setIsInspectOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1.5 shrink-0" />
                      <span className="truncate">Inspect</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-0 rounded-full font-semibold h-10"
                      onClick={() => handleTransfer(item)}
                    >
                      <Send className="w-4 h-4 mr-1.5 shrink-0" />
                      <span className="truncate">Send</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-full font-semibold h-10 px-3 shrink-0"
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
              This action cannot be undone. The item "{burnItemState?.name}" will be permanently destroyed.
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
