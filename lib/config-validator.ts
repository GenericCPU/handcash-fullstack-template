/**
 * Configuration validation utilities
 * Validates required environment variables and configuration on startup
 */

let validated = false

/**
 * Validate required environment variables
 * Should be called on app startup or first API request
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const isProduction = process.env.NODE_ENV === "production"

  // Required environment variables
  const required = [
    "HANDCASH_APP_ID",
    "HANDCASH_APP_SECRET",
    "ADMIN_HANDLE",
  ]

  // Optional but recommended in production
  const recommended = ["WEBSITE_URL"]

  // Check required variables
  for (const varName of required) {
    const value = process.env[varName]
    if (!value || value.trim() === "") {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Warn about recommended variables in production
  if (isProduction) {
    for (const varName of recommended) {
      const value = process.env[varName]
      if (!value || value.trim() === "") {
        console.warn(`[ConfigValidator] Missing recommended environment variable: ${varName}`)
      }
    }
  }

  // Validate ADMIN_HANDLE format (should not have @ prefix)
  const adminHandle = process.env.ADMIN_HANDLE
  if (adminHandle && adminHandle.startsWith("@")) {
    errors.push(
      `ADMIN_HANDLE should not include @ prefix. Got: ${adminHandle}, expected: ${adminHandle.replace("@", "")}`,
    )
  }

  const valid = errors.length === 0
  validated = true

  if (!valid && isProduction) {
    console.error("[ConfigValidator] Configuration validation failed:")
    errors.forEach((error) => console.error(`  - ${error}`))
  } else if (!valid) {
    console.warn("[ConfigValidator] Configuration validation warnings (development mode):")
    errors.forEach((error) => console.warn(`  - ${error}`))
  }

  return { valid, errors }
}

/**
 * Validate configuration and throw error in production if invalid
 */
export function validateConfigOrThrow(): void {
  const { valid, errors } = validateConfig()

  if (!valid && process.env.NODE_ENV === "production") {
    throw new Error(`Configuration validation failed: ${errors.join("; ")}`)
  }
}

/**
 * Check if configuration has been validated
 */
export function isConfigValidated(): boolean {
  return validated
}
