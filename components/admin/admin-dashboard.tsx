"use client"

import { UserProfile } from "@/components/user-profile"
import { Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { HeaderBar } from "@/components/header-bar"
import { MintInterface } from "@/components/admin/mint-interface"
import { PaymentRequestManagement } from "@/components/admin/payment-request-management"
import { BusinessWalletSection } from "@/components/admin/business-wallet-section"
import { ItemTemplatesDisplay } from "@/components/admin/item-templates-display"

export default function AdminDashboard() {
  return (
    <div className="bg-background min-h-screen">
      <HeaderBar />

      <div className="container mx-auto px-6 py-12 max-w-2xl">
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
          <Card className="p-8 rounded-3xl border-border">
            <UserProfile showAdminBadge={true} />
          </Card>

          <BusinessWalletSection />

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

