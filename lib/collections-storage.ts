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
    return JSON.parse(fileContent)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

async function writeCollectionsFile(collections: Collection[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(COLLECTIONS_FILE_PATH, JSON.stringify(collections, null, 2), "utf-8")
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



