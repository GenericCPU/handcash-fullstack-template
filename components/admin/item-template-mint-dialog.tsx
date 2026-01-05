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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MediaPreview } from "@/components/admin/media-preview"

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

interface ItemTemplateMintDialogProps {
  template: ItemTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ItemTemplateMintDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: ItemTemplateMintDialogProps) {
  const [handles, setHandles] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  const copyTemplateId = async () => {
    await navigator.clipboard.writeText(template.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleMint = async () => {
    if (!handles.trim()) {
      setError("Please enter at least one handle")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Parse handles from textarea (comma or newline separated)
      const handleList = handles
        .split(/[,\n]/)
        .map((h) => h.trim())
        .filter((h) => h.length > 0)
        .map((h) => h.replace(/^[@$]/, ""))

      if (handleList.length === 0) {
        setError("Please enter at least one valid handle")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/admin/item-templates/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId: template.id,
          handles: handleList,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Minting failed")
      }

      setSuccess(`Successfully minted ${data.data?.mintedCount || handleList.length} item(s) to ${handleList.length} user(s)`)
      setHandles("")
      
      // Call onSuccess after a short delay to show success message
      setTimeout(() => {
        onSuccess()
        setSuccess(null)
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Mint template error:", err)
      setError(err.message || "Failed to mint template")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mint Template</DialogTitle>
          <DialogDescription>Mint this template to multiple HandCash users</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-16 h-16 rounded overflow-hidden bg-muted/50 flex-shrink-0">
              <MediaPreview
                imageUrl={template.imageUrl}
                multimediaUrl={template.multimediaUrl}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-lg">{template.name}</p>
              {template.description && <p className="text-sm text-muted-foreground mt-1">{template.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                {template.rarity && <Badge variant="secondary" className="text-xs">{template.rarity}</Badge>}
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs font-mono">ID: {template.id}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={copyTemplateId}
                    type="button"
                  >
                    <Copy className={`w-3 h-3 ${copiedId ? "text-green-500" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handles">
              HandCash Handles <span className="text-muted-foreground">(one per line or comma separated)</span>
            </Label>
            <Textarea
              id="handles"
              placeholder="$handle1&#10;$handle2&#10;$handle3"
              value={handles}
              onChange={(e) => setHandles(e.target.value)}
              disabled={isLoading}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter HandCash handles (with or without $ prefix), one per line or separated by commas
            </p>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleMint} disabled={isLoading || !handles.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Mint Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

