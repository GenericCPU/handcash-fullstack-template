"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BusinessProfile {
  publicProfile: {
    id: string
    handle: string
    displayName: string
    avatarUrl: string
    paymail: string
  }
}

export function BusinessWalletInfo() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        console.log("[v0] Fetching business profile...")
        const response = await fetch("/api/business/profile")
        console.log("[v0] Response status:", response.status)

        const data = await response.json()
        console.log("[v0] Response data:", JSON.stringify(data, null, 2))

        if (!response.ok) {
          setError(data.error || "Failed to load business wallet")
          setIsLoading(false)
          return
        }

        if (data.publicProfile) {
          setProfile(data)
        } else if (data.id && data.handle) {
          setProfile({ publicProfile: data })
        } else {
          console.log("[v0] Unexpected profile structure:", data)
          setError("Unexpected profile structure")
        }
      } catch (err) {
        console.error("[v0] Business profile fetch error:", err)
        setError("Failed to load business wallet")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessProfile()
  }, [])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="text-center py-2 text-muted-foreground text-sm">{error || "Business wallet not available"}</div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-muted/50 border-dashed">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Wallet</span>
      </div>
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={profile.publicProfile.avatarUrl || "/placeholder.svg"}
            alt={profile.publicProfile.displayName}
          />
          <AvatarFallback>{profile.publicProfile.displayName?.charAt(0).toUpperCase() || "B"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{profile.publicProfile.displayName}</h4>
            <Badge variant="secondary" className="shrink-0 text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              Business
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">@{profile.publicProfile.handle}</p>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground font-mono truncate">ID: {profile.publicProfile.id}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={() => copyToClipboard(profile.publicProfile.id, "id")}
            >
              {copiedField === "id" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
