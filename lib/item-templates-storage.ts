import { promises as fs } from "fs"
import path from "path"

const TEMPLATES_FILE_PATH = path.join(process.cwd(), "data", "item-templates.json")

export interface ItemTemplate {
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
  createdAt: string
  updatedAt?: string
}

async function ensureDataDirectory() {
  const dataDir = path.dirname(TEMPLATES_FILE_PATH)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore
  }
}

async function readTemplatesFile(): Promise<ItemTemplate[]> {
  try {
    await ensureDataDirectory()
    const fileContent = await fs.readFile(TEMPLATES_FILE_PATH, "utf-8")
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
    console.warn("[ItemTemplatesStorage] Error reading templates file:", err.message)
    return []
  }
}

async function writeTemplatesFile(templates: ItemTemplate[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(TEMPLATES_FILE_PATH, JSON.stringify(templates, null, 2), "utf-8")
}

export async function saveTemplate(template: ItemTemplate): Promise<void> {
  const templates = await readTemplatesFile()

  // Check if template with this ID already exists
  const existingIndex = templates.findIndex((t) => t.id === template.id)

  if (existingIndex >= 0) {
    // Update existing template
    templates[existingIndex] = {
      ...templates[existingIndex],
      ...template,
      updatedAt: new Date().toISOString(),
    }
  } else {
    // Add new template
    templates.push({
      ...template,
      createdAt: template.createdAt || new Date().toISOString(),
    })
  }

  await writeTemplatesFile(templates)
}

export async function getTemplates(): Promise<ItemTemplate[]> {
  return readTemplatesFile()
}

export async function getTemplateById(id: string): Promise<ItemTemplate | null> {
  const templates = await readTemplatesFile()
  return templates.find((t) => t.id === id) || null
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const templates = await readTemplatesFile()
  const filtered = templates.filter((t) => t.id !== templateId)
  await writeTemplatesFile(filtered)
}

