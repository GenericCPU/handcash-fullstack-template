"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { LoginButton } from "@/components/login-button"
import { BusinessWalletInfo } from "@/components/business-wallet-info"

interface UserProfile {
  publicProfile: {
    handle: string
    displayName: string
    avatarUrl: string
    paymail: string
  }
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        })

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        console.error("[v0] Profile fetch error:", err)
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-4 bg-muted rounded-full mb-4">
          <Shield className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">
          Connect with the authorized admin HandCash account to access the dashboard
        </p>
        <LoginButton />
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      <BusinessWalletInfo />
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={profile.publicProfile.avatarUrl || "/placeholder.svg"}
              alt={profile.publicProfile.displayName}
            />
            <AvatarFallback>{profile.publicProfile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold truncate">{profile.publicProfile.displayName}</h3>
              <Badge variant="default" className="shrink-0 bg-green-600">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">@{profile.publicProfile.handle}</p>
            <p className="text-sm font-mono text-muted-foreground break-all">{profile.publicProfile.paymail}</p>
          </div>
        </div>
      </Card>
      <LogoutButton />
    </div>
  )
}
