/**
 * Shared request helpers. Use these instead of inlining header logic.
 */

/**
 * Get client IP from request (respects X-Forwarded-For when behind proxy).
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null
  }
  return null
}

/**
 * Get User-Agent from request.
 */
export function getClientUserAgent(request: Request): string | null {
  return request.headers.get("user-agent")
}
