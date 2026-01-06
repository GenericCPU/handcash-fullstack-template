import { promises as fs } from "fs"
import path from "path"

const COLLECTIONS_FILE_PATH = path.join(process.cwd(), "data", "collections.json")

interface Collection {
  id: string
  name: string
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

async function ensureDataDirectory() {
  const dataDir = path.dirname(COLLECTIONS_FILE_PATH)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore
  }
}

async function readCollectionsFile(): Promise<Collection[]> {
  try {
    await ensureDataDirectory()
    const fileContent = await fs.readFile(COLLECTIONS_FILE_PATH, "utf-8")
    if (!fileContent.trim()) {
      return []
    }
    const parsed = JSON.parse(fileContent)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // File doesn't exist, is invalid JSON, or directory doesn't exist - return empty array
    const err = error as NodeJS.ErrnoException
    if (err.code === "ENOENT") {
      // File or directory doesn't exist - that's fine
      return []
    }
    // Invalid JSON or other error - log but don't throw
    console.warn("[CollectionsStorage] Error reading collections file:", err.message)
    return []
  }
}

async function writeCollectionsFile(collections: Collection[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(COLLECTIONS_FILE_PATH, JSON.stringify(collections, null, 2), "utf-8")
  } catch (error) {
    // If directory creation or write fails, log but don't throw
    console.error("[CollectionsStorage] Error writing collections file:", error)
    throw error // Re-throw for write operations since they're critical
  }
}

export async function saveCollection(collection: Collection): Promise<void> {
  const collections = await readCollectionsFile()
  
  // Check if collection with this ID already exists
  const existingIndex = collections.findIndex((c) => c.id === collection.id)
  
  if (existingIndex >= 0) {
    // Update existing collection
    collections[existingIndex] = {
      ...collections[existingIndex],
      ...collection,
      updatedAt: new Date().toISOString(),
    }
  } else {
    // Add new collection
    collections.push({
      ...collection,
      createdAt: collection.createdAt || new Date().toISOString(),
    })
  }
  
  await writeCollectionsFile(collections)
}

export async function getCollections(): Promise<Collection[]> {
  return readCollectionsFile()
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const collections = await readCollectionsFile()
  const filtered = collections.filter((c) => c.id !== collectionId)
  await writeCollectionsFile(filtered)
}



