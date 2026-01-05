"use client"

import { useRef } from "react"
import { UserProfile } from "@/components/user-profile"
import { PaymentInterface } from "@/components/payment-interface"
import { InventoryDisplay } from "@/components/inventory-display"
import { MintInterface, type MintInterfaceRef } from "@/components/mint-interface"
import { PaymentRequestManagement } from "@/components/payment-request-management"
import { Shield } from "lucide-react"
import { TemplateInfo } from "@/components/template-info"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const mintInterfaceRef = useRef<MintInterfaceRef>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get("error")
    const message = urlParams.get("message")

    if (error === "unauthorized" && message) {
      setAuthError(decodeURIComponent(message))
      // Clean up URL
      window.history.replaceState({}, "", "/")
    }

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        })
        setIsAuthenticated(response.ok)
      } catch (err) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleCopyToMinter = (itemData: {
    collectionId: string
    name: string
    description: string
    mediaUrl: string
    attributes: Array<{ name: string; value: string }>
  }) => {
    if (mintInterfaceRef.current) {
      mintInterfaceRef.current.prefillMintForm(itemData)
      // Scroll to minter section
      document.querySelector("#mint-section")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">Business wallet management powered by HandCash</p>
          </div>

          {/* Auth Error Alert */}
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <UserProfile />
            </div>

            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <TemplateInfo />
                ) : (
                  <>
                    <InventoryDisplay onCopyToMinter={handleCopyToMinter} />
                    <div id="mint-section">
                      <MintInterface ref={mintInterfaceRef} />
                    </div>
                    <PaymentInterface />
                    <PaymentRequestManagement />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
