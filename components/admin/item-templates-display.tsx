"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Sparkles, FileText, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ItemTemplateMintDialog } from "@/components/admin/item-template-mint-dialog"
import { ItemTemplateCreateDialog } from "@/components/admin/item-template-create-dialog"
import { MediaPreview } from "@/components/admin/media-preview"
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
import { Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"

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

export function ItemTemplatesDisplay() {
  const [templates, setTemplates] = useState<ItemTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ItemTemplate | null>(null)
  const [isMintOpen, setIsMintOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<ItemTemplate | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingTemplate, setDeletingTemplate] = useState<ItemTemplate | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const copyTemplateId = async (templateId: string) => {
    await navigator.clipboard.writeText(templateId)
    setCopiedId(templateId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fetchTemplates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/item-templates", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          setIsLoading(false)
          return
        }
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err: any) {
      console.error("[v0] Item templates fetch error:", err)
      setError(err.message || "Failed to load item templates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMint = (template: ItemTemplate) => {
    setSelectedTemplate(template)
    setIsMintOpen(true)
  }

  const handleMintSuccess = () => {
    setIsMintOpen(false)
    setSelectedTemplate(null)
    fetchTemplates()
  }

  const handleEdit = (template: ItemTemplate, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setEditingTemplate(template)
    setIsEditOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditOpen(false)
    setEditingTemplate(null)
    fetchTemplates()
  }

  const handleDeleteClick = (template: ItemTemplate, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setDeletingTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/item-templates?id=${deletingTemplate.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete template")
      }

      toast.success("Template deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeletingTemplate(null)
      fetchTemplates()
    } catch (err: any) {
      console.error("Delete template error:", err)
      toast.error(err.message || "Failed to delete template")
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return (
    <>
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Item Templates</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchTemplates} disabled={isLoading} className="rounded-full">
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No item templates yet</p>
            <p className="text-sm text-muted-foreground mt-2">Create templates to quickly mint items to multiple users</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleEdit(template)}
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <MediaPreview
                    imageUrl={template.imageUrl}
                    multimediaUrl={template.multimediaUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-lg truncate flex-1">{template.name}</h4>
                    {template.rarity && (
                      <Badge variant="secondary" className="ml-2 shrink-0 rounded-full text-xs">
                        {template.rarity}
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs rounded-full font-mono flex-1">
                      ID: {template.id}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyTemplateId(template.id)
                      }}
                    >
                      <Copy className={`w-3 h-3 ${copiedId === template.id ? "text-green-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 shrink-0"
                      onClick={(e) => handleEdit(template, e)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 shrink-0 text-destructive hover:text-destructive"
                      onClick={(e) => handleDeleteClick(template, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {template.attributes && template.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.attributes.slice(0, 3).map((attr, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs rounded-full">
                          {attr.name}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMint(template)
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mint
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedTemplate && (
        <ItemTemplateMintDialog
          template={selectedTemplate}
          open={isMintOpen}
          onOpenChange={setIsMintOpen}
          onSuccess={handleMintSuccess}
        />
      )}

      <ItemTemplateCreateDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleEditSuccess}
        template={editingTemplate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
}

