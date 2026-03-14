"use client"

import { UserProfile } from "@/components/user-profile"
import { Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { HeaderBar } from "@/components/header-bar"
import { MintInterface } from "@/components/admin/mint-interface"
import { PaymentRequestManagement } from "@/components/admin/payment-request-management"
import { BusinessWalletSection } from "@/components/admin/business-wallet-section"
import { ItemTemplatesDisplay } from "@/components/admin/item-templates-display"
import { AdminDirectory } from "@/components/admin/admin-directory"

export default function AdminDashboard() {
  return (
    <div className="bg-background min-h-screen">
      <HeaderBar />

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <aside className="lg:w-52 shrink-0">
            <AdminDirectory />
          </aside>
          <main className="min-w-0 flex-1 space-y-6 max-w-2xl">
            <section id="user-profile" className="scroll-mt-24">
              <Card className="p-8 rounded-3xl border-border">
                <UserProfile showAdminBadge={true} />
              </Card>
            </section>

            <section id="business-wallet" className="scroll-mt-24">
              <BusinessWalletSection />
            </section>

            <section id="item-templates" className="scroll-mt-24">
              <ItemTemplatesDisplay />
            </section>

            <section id="mint-section" className="scroll-mt-24">
              <MintInterface />
            </section>

            <section id="payment-requests" className="scroll-mt-24">
              <PaymentRequestManagement />
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

