"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Shield } from "lucide-react"
import { UserProfileSkeleton } from "@/components/skeletons/app-skeletons"
import { LogoutButton } from "@/components/logout-button"
import { DualLoginButtons } from "@/components/dual-login-buttons"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

interface UserProfile {
  publicProfile: {
    handle: string
    displayName: string
    avatarUrl: string
    paymail: string
  }
}

interface UserProfileProps {
  showAdminBadge?: boolean
}

export function UserProfile({ showAdminBadge = false }: UserProfileProps) {
  const { user, isLoading, error } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      const checkAdminStatus = async () => {
        try {
          const response = await fetch("/api/admin/status", {
            credentials: "include",
          })
          if (response.ok) {
            const data = await response.json()
            setIsAdmin(data.isAdmin || false)
          }
        } catch (err) {
          console.error("Failed to check admin status:", err)
        }
      }
      checkAdminStatus()
    }
  }, [user])

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-2 py-6 text-center sm:py-8">
        <div className="mb-8 inline-flex rounded-full bg-muted/60 p-6 shadow-sm ring-1 ring-border/40">
          <User className="h-14 w-14 text-muted-foreground/80" aria-hidden />
        </div>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Sign in</h2>
        <p className="mx-auto mb-10 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
          Use Google or HandCash to open your profile and wallet features below.
        </p>
        <div className="flex justify-center">
          <DualLoginButtons />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 sm:gap-6">
        <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border/30 ring-offset-2 ring-offset-background">
          <AvatarImage src={user.publicProfile.avatarUrl || "/placeholder.svg"} alt={user.publicProfile.displayName} />
          <AvatarFallback className="text-2xl font-semibold">
            {(user.publicProfile.displayName?.trim() || user.publicProfile.handle || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <h3 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {user.publicProfile.displayName?.trim() || user.publicProfile.handle}
            </h3>
            <Badge variant="secondary" className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
              Signed in
            </Badge>
            {showAdminBadge && isAdmin && (
              <Badge variant="default" className="shrink-0 rounded-full px-3 py-1 bg-primary">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
            {!showAdminBadge && isAdmin && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" asChild title="Admin">
                <Link href="/admin">
                  <Shield className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Link>
              </Button>
            )}
          </div>
          <p className="mb-1 text-[15px] text-muted-foreground">${user.publicProfile.handle}</p>
          <p className="break-all font-mono text-xs text-muted-foreground/90 sm:text-sm">{user.publicProfile.paymail}</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  )
}
