import { promises as fs } from "fs"
import { join } from "path"
import type { AuditEvent } from "./audit-logger"

const DATA_DIR = join(process.cwd(), "data")
const AUDIT_LOG_FILE = join(DATA_DIR, "audit.log")
const MAX_LOG_AGE_DAYS = 30

/**
 * Ensure the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

/**
 * Get the date string for log rotation (YYYY-MM-DD)
 */
function getDateString(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Rotate audit log if needed (check daily at midnight)
 */
async function rotateLogIfNeeded(): Promise<void> {
  try {
    const stats = await fs.stat(AUDIT_LOG_FILE)
    const lastModified = new Date(stats.mtime)
    const today = new Date()
    
    // Check if log is from a different day
    if (
      lastModified.getDate() !== today.getDate() ||
      lastModified.getMonth() !== today.getMonth() ||
      lastModified.getFullYear() !== today.getFullYear()
    ) {
      const dateString = lastModified.toISOString().split("T")[0]
      const rotatedFile = join(DATA_DIR, `audit-${dateString}.log`)
      
      // Move current log to dated file
      await fs.rename(AUDIT_LOG_FILE, rotatedFile)
      
      // Clean up old logs (older than MAX_LOG_AGE_DAYS)
      await cleanupOldLogs()
    }
  } catch (error) {
    // File doesn't exist yet, that's okay
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[AuditStorage] Error rotating log:", error)
    }
  }
}

/**
 * Clean up log files older than MAX_LOG_AGE_DAYS
 */
async function cleanupOldLogs(): Promise<void> {
  try {
    const files = await fs.readdir(DATA_DIR)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_LOG_AGE_DAYS)
    
    for (const file of files) {
      if (file.startsWith("audit-") && file.endsWith(".log")) {
        const filePath = join(DATA_DIR, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath)
          console.log(`[AuditStorage] Deleted old log file: ${file}`)
        }
      }
    }
  } catch (error) {
    console.error("[AuditStorage] Error cleaning up old logs:", error)
  }
}

/**
 * Write audit event to log file
 */
export async function writeAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await ensureDataDirectory()
    await rotateLogIfNeeded()
    
    // Format as JSON line (one event per line)
    const logLine = JSON.stringify(event) + "\n"
    
    // Append to log file
    await fs.appendFile(AUDIT_LOG_FILE, logLine, "utf8")
  } catch (error) {
    // Log error but don't throw - we don't want to break the application
    console.error("[AuditStorage] Failed to write audit event:", error)
  }
}

/**
 * Initialize audit storage (call on app startup)
 */
export async function initializeAuditStorage(): Promise<void> {
  try {
    await ensureDataDirectory()
    await cleanupOldLogs()
  } catch (error) {
    console.error("[AuditStorage] Failed to initialize audit storage:", error)
  }
}
