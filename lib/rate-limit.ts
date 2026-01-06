import { type NextRequest, NextResponse } from "next/server"

/**
 * In-memory rate limit storage
 * 
 * ⚠️ IMPORTANT: This implementation uses in-memory storage and is NOT suitable for
 * multi-instance deployments. Each server instance maintains its own rate limit counter,
 * meaning rate limits are effectively multiplied by the number of instances.
 * 
 * For production multi-instance deployments, use Redis-based rate limiting:
 * - Consider @upstash/ratelimit (serverless-compatible)
 * - Or implement Redis-based solution
 * 
 * TODO: Add Redis-based rate limiting for production deployments
 */
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries periodically (every 5 minutes)
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest, identifier?: string): string {
  // If custom identifier provided (e.g., session ID), use it
  if (identifier) {
    return identifier
  }

  // Otherwise use IP address
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"
  return ip
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  limit: number // Maximum number of requests
  windowMs: number // Time window in milliseconds
  identifier?: string // Optional custom identifier (e.g., session ID or user ID)
}

/**
 * Check if request should be rate limited
 * Returns null if allowed, or NextResponse with 429 status if rate limited
 */
export function rateLimit(request: NextRequest, config: RateLimitConfig): NextResponse | null {
  const { limit, windowMs, identifier } = config
  const clientId = getClientId(request, identifier)
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(clientId, entry)
    return null // Request allowed
  }

  // Increment count
  entry.count++

  if (entry.count > limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": entry.resetAt.toString(),
        },
      },
    )
  }

  // Request allowed
  return null
}

/**
 * Rate limit presets for common use cases
 * Values are set to allow normal usage while preventing abuse
 */
export const RateLimitPresets = {
  // Admin endpoints - very permissive for admin operations
  admin: { limit: 1000, windowMs: 60 * 1000 }, // 1000 per minute

  // Auth endpoints - allow multiple login attempts
  auth: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  authCallback: { limit: 200, windowMs: 60 * 1000 }, // 200 per minute (OAuth callback can be called multiple times)

  // Payment endpoints - allow high transaction volume
  payment: { limit: 500, windowMs: 60 * 1000 }, // 500 per minute

  // Minting endpoints - allow batch minting operations
  mint: { limit: 200, windowMs: 60 * 1000 }, // 200 per minute

  // Item transfer - allow batch transfers
  itemTransfer: { limit: 500, windowMs: 60 * 1000 }, // 500 per minute

  // General API endpoints - very permissive
  general: { limit: 1000, windowMs: 60 * 1000 }, // 1000 per minute
} as const
