"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { BusinessWalletInfo, type BusinessProfile } from "@/components/admin/business-wallet-info"
import { BusinessPaymentInterface } from "@/components/admin/business-payment-interface"
import { BusinessInventoryDisplay } from "@/components/admin/business-inventory-display"

function normalizeProfile(data: any): BusinessProfile | null {
  if (!data) return null
  if (data.publicProfile && typeof data.publicProfile === "object") {
    return data as BusinessProfile
  }
  if (data.id && data.handle) {
    return { publicProfile: data }
  }
  return null
}

export function BusinessWalletSection() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/admin/business/profile", { credentials: "include" })
        const data = await response.json()
        if (!response.ok) {
          setError(true)
          setProfile(null)
          return
        }
        setProfile(normalizeProfile(data))
        setError(false)
      } catch {
        setError(true)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Business Wallet</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
    <Card className="p-6 rounded-3xl border-border">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">Business Wallet</h3>
      </div>
      <div className="space-y-6">
        <BusinessWalletInfo embedded initialProfile={profile} />
        <BusinessPaymentInterface />
        <BusinessInventoryDisplay embedded />
      </div>
    </Card>
  )
}
