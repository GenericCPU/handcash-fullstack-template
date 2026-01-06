import { useState, useEffect } from "react"

export interface InventoryItem {
  id: string
  origin?: string
  name: string
  description?: string
  imageUrl?: string
  multimediaUrl?: string
  rarity?: string
  color?: string
  count?: number
  collection?: {
    id: string
    name?: string
  }
  attributes?: Array<{
    name: string
    value: string | number
  }>
}

export interface Collection {
  id: string
  name?: string
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBurning, setIsBurning] = useState(false)

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
      console.error("[useInventory] Fetch error:", err)
      setError(err.message || "Failed to load inventory")
    } finally {
      setIsLoading(false)
    }
  }

  const burnItem = async (origin: string) => {
    setIsBurning(true)
    try {
      const response = await fetch("/api/items/burn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ origin }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.details || "Failed to burn item")
      }

      // Add a small delay to ensure the burn has propagated before refreshing
      await new Promise((resolve) => setTimeout(resolve, 500))
      await fetchInventory()
    } catch (err: any) {
      console.error("[useInventory] Burn error:", err)
      throw err
    } finally {
      setIsBurning(false)
    }
  }

  const fetchCollections = async (items: InventoryItem[]) => {
    try {
      // First, try to fetch collections from the public API (includes local storage)
      const response = await fetch("/api/collections", {
        credentials: "include",
      })

      let apiCollections: Collection[] = []
      if (response.ok) {
        const data = await response.json()
        apiCollections = data.collections || []
      }

      // Also extract collections from items (in case API doesn't have all of them)
      const collectionMap = new Map<string, Collection>()

      // Add API collections first (they have names from local storage)
      apiCollections.forEach((col) => {
        if (col.id) {
          collectionMap.set(col.id, col)
        }
      })

      // Then add collections from items (may not have names, but API collections take precedence)
      items.forEach((item) => {
        if (item.collection?.id && !collectionMap.has(item.collection.id)) {
          collectionMap.set(item.collection.id, {
            id: item.collection.id,
            name: item.collection.name,
          })
        }
      })

      setCollections(Array.from(collectionMap.values()))
    } catch (err) {
      // Silently fail - collections are optional
      console.error("[useInventory] Failed to fetch collections:", err)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      fetchCollections(items)
    }
  }, [items])

  return {
    items,
    collections,
    isLoading,
    error,
    isBurning,
    fetchInventory,
    burnItem,
    refresh: fetchInventory,
  }
}

