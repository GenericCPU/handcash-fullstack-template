"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Package, RefreshCw, Send, Eye, ChevronDown, ChevronUp, Flame } from "lucide-react"
import { InventoryGridSkeleton } from "@/components/skeletons/app-skeletons"
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
      <Card className="rounded-3xl border-0 bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 shrink-0 text-primary" aria-hidden />
            <h3 className="text-base font-semibold tracking-tight text-foreground">Inventory</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchInventory()} disabled={isLoading} className="rounded-full">
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-4">
            <InventoryGridSkeleton count={4} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <Package className="mb-5 h-14 w-14 text-muted-foreground/80" aria-hidden />
            <p className="max-w-xs text-center text-[15px] leading-relaxed text-muted-foreground">
              Turn on the <span className="font-medium text-foreground/90">Inventory</span> permission for this app in
              HandCash, then sign in again.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-20 text-center">
            <Package className="mx-auto mb-5 h-16 w-16 text-muted-foreground/70" aria-hidden />
            <p className="text-[15px] font-medium text-foreground/90">No items yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Items you collect or receive will appear here. You can inspect, send, or burn them from each card.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {(isExpanded ? items : items.slice(0, 4)).map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md"
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
