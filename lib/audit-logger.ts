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

/**
 * Log an audit event
 * In production, this should write to a secure logging service
 */
export function logAuditEvent(event: Omit<AuditEvent, "timestamp">): void {
  const fullEvent: AuditEvent = {
    ...event,
    timestamp: Date.now(),
  }

  // Console logging for development
  // In production, integrate with a logging service (e.g., Sentry, DataDog, CloudWatch)
  // Example: await sendToLoggingService(fullEvent)
  console.log(
    `[AUDIT] ${fullEvent.type} | ${fullEvent.success ? "SUCCESS" : "FAILURE"} | Session: ${fullEvent.sessionId || "N/A"}`,
    fullEvent,
  )
}
