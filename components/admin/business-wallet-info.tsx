"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, Copy, Check } from "lucide-react"
import { BusinessWalletProfileSkeleton } from "@/components/skeletons/app-skeletons"
import { Button } from "@/components/ui/button"

export interface BusinessProfile {
  publicProfile: {
    id: string
    handle: string
    displayName: string
    avatarUrl: string
    paymail: string
  }
}

interface BusinessWalletInfoProps {
  /** When true, render only inner content (no Card). Used inside BusinessWalletSection. */
  embedded?: boolean
  /** When provided with embedded, skip fetch and render profile block only. */
  initialProfile?: BusinessProfile | null
}

export function BusinessWalletInfo({ embedded = false, initialProfile }: BusinessWalletInfoProps = {}) {
  const [profile, setProfile] = useState<BusinessProfile | null>(initialProfile ?? null)
  const [isLoading, setIsLoading] = useState(!initialProfile)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setIsLoading(false)
      return
    }
    const fetchBusinessProfile = async () => {
      try {
        const response = await fetch("/api/admin/business/profile", {
          credentials: "include",
        })

        const data = await response.json()

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
  }, [initialProfile])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const profileBlock = profile && (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl border border-dashed border-border">
      <Avatar className="w-12 h-12">
        <AvatarImage src={profile.publicProfile.avatarUrl || "/placeholder.svg"} alt={profile.publicProfile.displayName} />
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
        <p className="text-sm text-muted-foreground">${profile.publicProfile.handle}</p>
        {profile.publicProfile.id && (
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
        )}
      </div>
    </div>
  )

  if (embedded && initialProfile) {
    return profileBlock
  }

  if (isLoading) {
    return (
      <Card className="bg-muted/50 p-4">
        <div className="py-1">
          <BusinessWalletProfileSkeleton />
        </div>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Business Wallet</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Building2 className="w-14 h-14 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center text-base">Enable business wallet to use this feature</p>
        </div>
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
          <AvatarImage src={profile.publicProfile.avatarUrl || "/placeholder.svg"} alt={profile.publicProfile.displayName} />
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
          <p className="text-sm text-muted-foreground">${profile.publicProfile.handle}</p>
          {profile.publicProfile.id && (
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
          )}
        </div>
      </div>
    </Card>
  )
}

