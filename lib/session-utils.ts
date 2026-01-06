import { randomBytes } from "crypto"

/**
 * Session Management Utilities
 * Provides secure session tracking with metadata for audit logging
 */

export interface SessionMetadata {
  sessionId: string
  createdAt: number
  lastActivity: number
  ipAddress: string | null
  userAgent: string | null
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Create a new session with metadata
 * Note: privateKey is NOT stored in session metadata for security reasons.
 * The private key is stored separately in the private_key cookie.
 */
export function createSession(ipAddress: string | null, userAgent: string | null): SessionMetadata {
  const now = Date.now()
  return {
    sessionId: generateSessionId(),
    createdAt: now,
    lastActivity: now,
    ipAddress,
    userAgent,
  }
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(session: SessionMetadata): SessionMetadata {
  return {
    ...session,
    lastActivity: Date.now(),
  }
}

/**
 * Check if session has expired (30 days of inactivity)
 */
export function isSessionExpired(session: SessionMetadata, maxAgeMs = 30 * 24 * 60 * 60 * 1000): boolean {
  return Date.now() - session.lastActivity > maxAgeMs
}

/**
 * Validate session consistency (IP and User-Agent matching)
 * In production, always validates even if IP/UA are null (behind proxies)
 */
export function validateSessionConsistency(
  session: SessionMetadata,
  currentIp: string | null,
  currentUserAgent: string | null,
): boolean {
  const isProduction = process.env.NODE_ENV === "production"

  // In development, allow null values for convenience
  if (!isProduction && (!session.ipAddress || !session.userAgent)) {
    return true
  }

  // In production, enforce strict matching
  // If session IP/UA are null, only allow for very old sessions (migration grace period)
  if (!session.ipAddress || !session.userAgent) {
    // Migration date: 2024-12-19 (when this validation was enforced)
    const migrationDate = new Date("2024-12-19").getTime()
    const sessionAge = Date.now() - session.createdAt
    
    // Allow if session was created before migration (30 day grace period)
    if (session.createdAt < migrationDate || sessionAge > 30 * 24 * 60 * 60 * 1000) {
      // Very old session, allow for migration
      return true
    }
    
    // New session without IP/UA - require validation (deny)
    return false
  }

  return session.ipAddress === currentIp && session.userAgent === currentUserAgent
}
