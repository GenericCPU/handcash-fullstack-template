/**
 * Audit Logging for Authentication Events
 * Tracks all security-relevant events for monitoring and compliance
 */

export enum AuditEventType {
  LOGIN_INITIATED = "LOGIN_INITIATED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  CSRF_VIOLATION = "CSRF_VIOLATION",
  SESSION_HIJACK_ATTEMPT = "SESSION_HIJACK_ATTEMPT",
  PROFILE_ACCESS = "PROFILE_ACCESS",
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}

export interface AuditEvent {
  type: AuditEventType
  timestamp: number
  sessionId?: string
  userId?: string
  ipAddress?: string | null
  userAgent?: string | null
  details?: Record<string, any>
  success: boolean
}

import { writeAuditEvent } from "./audit-storage"

/**
 * Redact sensitive information from audit event details
 */
function redactSensitiveData(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined

  const redacted = { ...details }
  const sensitiveFields = [
    "destination",
    "paidBy",
    "handle",
    "userHandle",
    "privateKey",
    "authToken",
    "password",
    "secret",
  ]

  for (const field of sensitiveFields) {
    if (field in redacted && typeof redacted[field] === "string") {
      const value = redacted[field] as string
      // Redact but keep first/last character for identification (e.g., "a...z" for "alice")
      if (value.length > 2) {
        redacted[field] = `${value[0]}...${value[value.length - 1]}`
      } else {
        redacted[field] = "***"
      }
    }
  }

  // Redact payment amounts - keep only currency
  if ("amount" in redacted) {
    redacted.amount = "[REDACTED]"
  }

  return redacted
}

/**
 * Log an audit event
 * Writes to both console (for development) and persistent file storage
 * Sensitive data is redacted before logging
 */
export function logAuditEvent(event: Omit<AuditEvent, "timestamp">): void {
  // Redact sensitive information from details
  const redactedDetails = redactSensitiveData(event.details)

  const fullEvent: AuditEvent = {
    ...event,
    timestamp: Date.now(),
    details: redactedDetails,
  }

  // Console logging for development/debugging
  console.log(
    `[AUDIT] ${fullEvent.type} | ${fullEvent.success ? "SUCCESS" : "FAILURE"} | Session: ${fullEvent.sessionId || "N/A"}`,
    fullEvent,
  )

  // Write to persistent storage (async, doesn't block)
  // Errors are handled internally in writeAuditEvent
  writeAuditEvent(fullEvent).catch((error) => {
    console.error("[AuditLogger] Failed to persist audit event:", error)
  })
}
