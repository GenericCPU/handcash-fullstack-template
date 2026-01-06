/**
 * Input validation utilities
 * Provides schema validation for API route inputs
 */

/**
 * Validate that a value is a non-empty string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} must be a non-empty string`)
  }
  return value.trim()
}

/**
 * Validate that a value is a positive number
 */
export function validatePositiveNumber(value: unknown, fieldName: string): number {
  const num = typeof value === "string" ? parseFloat(value) : Number(value)
  if (isNaN(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive number`)
  }
  return num
}

/**
 * Validate that a value is a valid array
 */
export function validateArray<T>(value: unknown, fieldName: string, itemValidator?: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`)
  }
  if (value.length === 0) {
    throw new Error(`${fieldName} must not be empty`)
  }
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item)
      } catch (error) {
        throw new Error(`${fieldName}[${index}] is invalid: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
  }
  return value as T[]
}

/**
 * Validate handle/user ID format (basic validation)
 */
export function validateHandleOrId(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName)
  // Basic format check: should be alphanumeric with possible @ prefix or be a valid user ID
  if (!/^@?[a-zA-Z0-9_\-]{3,50}$/.test(str) && !/^[a-zA-Z0-9]{20,}$/.test(str)) {
    throw new Error(`${fieldName} must be a valid handle or user ID`)
  }
  return str
}

/**
 * Validate currency code (3-letter code)
 */
export function validateCurrencyCode(value: unknown, fieldName: string = "currency"): string {
  const str = validateString(value, fieldName)
  if (!/^[A-Z]{3}$/.test(str)) {
    throw new Error(`${fieldName} must be a valid 3-letter currency code (e.g., BSV, USD)`)
  }
  return str
}

/**
 * Validate UUID format
 */
export function validateUUID(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(str)) {
    throw new Error(`${fieldName} must be a valid UUID`)
  }
  return str
}

/**
 * Validate optional string (returns undefined if not provided)
 */
export function validateOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined
  }
  return validateString(value, fieldName)
}

/**
 * Validate optional positive number (returns undefined if not provided)
 */
export function validateOptionalPositiveNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  return validatePositiveNumber(value, fieldName)
}

/**
 * Common validation error response helper
 */
export function validationErrorResponse(error: unknown): { error: string; details: string; status: number } {
  const message = error instanceof Error ? error.message : "Validation error"
  return {
    error: "Invalid input",
    details: message,
    status: 400,
  }
}
