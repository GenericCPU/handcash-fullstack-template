"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Shield, Sparkles, Send, Package, Key, Lock, ExternalLink, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TemplateInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-amber-500/10 border-amber-500/30">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-amber-500/20 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-amber-900 dark:text-amber-100">
              First Time Setup Required
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm md:text-base mb-2">
                Step 1: Create a HandCash App for Admin Authentication
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                Create a dedicated app on the HandCash Business Dashboard for authenticating the admin user.
              </p>
              <a
                href="https://dashboard.handcash.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-primary hover:underline"
              >
                Go to dashboard.handcash.io
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>

            <div>
              <h3 className="font-semibold text-sm md:text-base mb-2">Step 2: Set the Callback URL</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                Set the <strong>Authorization Callback URL</strong> to:
              </p>
              <div className="bg-muted p-2 md:p-3 rounded-lg font-mono text-xs md:text-sm break-all">
                <code>https://your-domain.com/api/auth/callback</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Replace with your actual deployed URL (e.g., your Vercel URL).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm md:text-base mb-2">Step 3: Configure Environment Variables</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                Copy the <strong>App ID</strong> and <strong>App Secret</strong> and set them as:
              </p>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-2">
                <li className="flex flex-col gap-0.5">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs w-fit">AUTH_APP_ID</code>
                  <span>Your admin app&apos;s App ID</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs w-fit">AUTH_APP_SECRET</code>
                  <span>Your admin app&apos;s App Secret</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs w-fit">ADMIN_HANDLE</code>
                  <span>Your HandCash handle (without $)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* About the Admin Dashboard */}
      <Card className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Business Wallet Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            A secure admin interface for managing your HandCash business wallet. Only the authorized admin can access
            this dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 md:gap-2">
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Business Wallet
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Item Minting
          </Badge>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Key className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base mb-1">Admin Authentication</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Secure login via HandCash restricted to the designated admin handle.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base mb-1">Item Minting</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Mint digital items and collectibles directly from your business wallet.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base mb-1">Business Inventory</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                View and manage all digital items held in the business wallet.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Send className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base mb-1">Business Payments</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Send payments in multiple currencies to handles, paymail, or addresses.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 bg-primary/5 border-primary/20">
        <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Required Environment Variables</h3>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">1</span>
            </div>
            <div className="min-w-0">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ADMIN_HANDLE</code>
              <p className="text-xs md:text-sm mt-1">The HandCash handle authorized to access this dashboard</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">2</span>
            </div>
            <div className="min-w-0">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">BUSINESS_AUTH_TOKEN</code>
              <p className="text-xs md:text-sm mt-1">The authentication token for business wallet operations</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">3</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">AUTH_APP_ID</code>
                <span className="text-xs">&</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">AUTH_APP_SECRET</code>
              </div>
              <p className="text-xs md:text-sm mt-1">Credentials for admin authentication app</p>
            </div>
          </div>
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">4</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">TARGET_APP_ID</code>
                <span className="text-xs">&</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">TARGET_APP_SECRET</code>
              </div>
              <p className="text-xs md:text-sm mt-1">Credentials for payment requests and items</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
