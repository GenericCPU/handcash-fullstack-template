/**
 * Centralized utility for handling handle/user ID input and validation
 * Supports:
 * - HandCash handles (with or without @/$ prefix)
 * - User IDs (hex strings, 24+ characters)
 */

/**
 * Check if a string looks like a user ID (hex string, typically 24+ chars)
 */
export function isUserId(input: string): boolean {
  // User IDs are typically hex strings, at least 24 characters
  return /^[a-f0-9]{24,}$/i.test(input.trim())
}

/**
 * Check if a string looks like a handle (alphanumeric with dashes/underscores)
 */
export function isHandle(input: string): boolean {
  const cleaned = input.trim().replace(/^[@$]/, "")
  return /^[\w\-_.]{3,50}$/.test(cleaned)
}

/**
 * Parse and normalize handle/ID input
 * Returns the cleaned value and type
 */
export function parseHandleOrId(input: string): { value: string; type: "handle" | "userid" } {
  const trimmed = input.trim()
  
  if (isUserId(trimmed)) {
    return { value: trimmed.toLowerCase(), type: "userid" }
  }
  
  // Remove @/$ prefix and return as handle
  const cleaned = trimmed.replace(/^[@$]/, "")
  return { value: cleaned.toLowerCase(), type: "handle" }
}

/**
 * Parse multiple handles/IDs from a string (comma or newline separated)
 */
export function parseHandleOrIdList(input: string): Array<{ value: string; type: "handle" | "userid" }> {
  const items = input
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  
  return items.map(parseHandleOrId)
}

/**
 * Validate if input is a valid handle or user ID format
 */
export function isValidHandleOrId(input: string): boolean {
  const trimmed = input.trim()
  if (!trimmed) return false
  return isUserId(trimmed) || isHandle(trimmed)
}
