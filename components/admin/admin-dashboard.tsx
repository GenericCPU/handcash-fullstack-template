"use client"

import { UserProfile } from "@/components/user-profile"
import { Shield, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { HeaderBar } from "@/components/header-bar"
import { MintInterface } from "@/components/admin/mint-interface"
import { PaymentRequestManagement } from "@/components/admin/payment-request-management"
import { BusinessInventoryDisplay } from "@/components/admin/business-inventory-display"
import { BusinessPaymentInterface } from "@/components/admin/business-payment-interface"
import { BusinessWalletInfo } from "@/components/admin/business-wallet-info"
import { ItemTemplatesDisplay } from "@/components/admin/item-templates-display"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [hasBusinessAuthToken, setHasBusinessAuthToken] = useState<boolean | null>(null)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/admin/config-check", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setHasBusinessAuthToken(data.hasBusinessAuthToken)
        }
      } catch (err) {
        console.error("Failed to check config:", err)
      }
    }
    checkConfig()
  }, [])

  return (
    <div className="bg-background min-h-screen">
      <HeaderBar />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">Business wallet management powered by HandCash</p>
        </div>

        <div className="space-y-6">
          {hasBusinessAuthToken === false && (
            <Alert variant="destructive" className="rounded-3xl border-border">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Configuration Required</AlertTitle>
              <AlertDescription>
                To use business wallet features (minting, collections), you need to add <code className="px-2 py-1 bg-background rounded font-mono text-sm">BUSINESS_AUTH_TOKEN</code> to your environment variables.
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-8 rounded-3xl border-border">
            <UserProfile showAdminBadge={true} />
          </Card>

          <BusinessWalletInfo />

          <BusinessPaymentInterface />

          <BusinessInventoryDisplay />

          <ItemTemplatesDisplay />

          <div id="mint-section">
            <MintInterface />
          </div>

          <PaymentRequestManagement />
        </div>
      </div>
    </div>
  )
}

