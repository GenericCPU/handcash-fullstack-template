"use client"

import { useState } from "react"
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
import { Loader2, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Item {
  id: string
  origin?: string
  name: string
  imageUrl?: string
}

interface ItemTransferDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  apiEndpoint?: string
}

export function ItemTransferDialog({ item, open, onOpenChange, onSuccess, apiEndpoint = "/api/items/transfer" }: ItemTransferDialogProps) {
  const [destination, setDestination] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTransfer = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination handle or address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          origins: [item.origin],
          destination: destination.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || data.error || "Transfer failed")
      }

      onSuccess()
    } catch (err: any) {
      console.error("[v0] Transfer error:", err)
      setError(err.message || "Failed to transfer item")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Item</DialogTitle>
          <DialogDescription>Send this item to another HandCash user or wallet address</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.origin}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Recipient Handle or Address</Label>
            <Input
              id="destination"
              placeholder="$handle or bitcoin address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isLoading}
            />
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
          <Button onClick={handleTransfer} disabled={isLoading || !destination.trim()}>
            {isLoading ? (
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
  )
}
