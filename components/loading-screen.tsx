"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  message?: string
  className?: string
}

/**
 * Full-screen loading state. Use for admin check, route transitions, etc.
 */
export function LoadingScreen({ message, className = "" }: LoadingScreenProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen", className)}>
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}
