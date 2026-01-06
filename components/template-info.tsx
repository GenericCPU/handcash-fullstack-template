"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Shield, Zap, Code, Send, Package, Key, CheckCircle2, AlertCircle, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">First Time Setup</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
          <p className="mb-3">
            Before you can connect with Handcash, you need to configure your Handcash app with the following redirect
            URL:
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-blue-200 dark:border-blue-800">
            <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
              &lt;deployment-url&gt;/auth/callback
            </code>
          </div>
          <p className="mt-3 text-sm">
            Add this URL to your Handcash app settings in the{" "}
            <a
              href="https://dashboard.handcash.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:no-underline"
            >
              Handcash Dashboard
            </a>
            .
          </p>
        </AlertDescription>
      </Alert>

      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30 shadow-lg">
        <Accordion type="single" collapsible defaultValue="handcash-manual" className="w-full">
          <AccordionItem value="handcash-manual" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Handcash Service Documentation
                  </span>
                  <div className="text-xs text-muted-foreground font-normal mt-0.5">
                    Complete guide to authentication, SDKs, and API integration
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-6">
              <div>
                <h4 className="font-semibold mb-2 text-base">What is Handcash?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Handcash is a Bitcoin wallet that enables instant, low-cost payments and digital collectibles. This
                  template integrates with Handcash to provide authentication, payments, and inventory management for
                  your application.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">Authentication Flow</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  The authentication system uses OAuth-style flow with a private key stored securely in cookies:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>User clicks "Connect with Handcash" button</li>
                  <li>User is redirected to Handcash to authorize the app</li>
                  <li>Handcash redirects back with an authorization code</li>
                  <li>App exchanges the code for a private key (stored as httpOnly cookie)</li>
                  <li>Private key is used to authenticate all subsequent API requests</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">Handcash Service Layer</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  The app uses a centralized service layer (
                  <code className="bg-muted px-1 py-0.5 rounded">lib/handcash-service.ts</code>) that abstracts two
                  Handcash SDKs:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>
                    <strong>@handcash/sdk</strong> - Modern v3 SDK for profile, balance, payments, and exchange rates
                  </li>
                  <li>
                    <strong>@handcash/handcash-connect</strong> - Legacy SDK for friends list and inventory management
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">Available Features</h4>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">User Profile</p>
                    <p className="text-xs text-muted-foreground">
                      Access user handle, display name, avatar, and public profile information
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Wallet Balance</p>
                    <p className="text-xs text-muted-foreground">
                      View spendable and total balances in BSV and fiat currencies
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Send Payments</p>
                    <p className="text-xs text-muted-foreground">
                      Send payments to Handcash handles, paymails, or Bitcoin addresses in multiple currencies
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Friends List</p>
                    <p className="text-xs text-muted-foreground">
                      Access the user's Handcash friends and their public profiles
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Inventory</p>
                    <p className="text-xs text-muted-foreground">
                      View digital items and collectibles stored in the user's wallet
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-base">Environment Variables</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Configure these environment variables in your deployment platform (e.g., Vercel):
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">HANDCASH_APP_ID</code>
                      <Badge variant="destructive" className="text-xs h-4">Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-0.5">
                      Your HandCash application ID from the HandCash Developer Dashboard. Used for OAuth authentication.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">HANDCASH_APP_SECRET</code>
                      <Badge variant="destructive" className="text-xs h-4">Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-0.5">
                      Your HandCash application secret from the HandCash Developer Dashboard. Used to verify authentication requests.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">WEBSITE_URL</code>
                      <Badge variant="secondary" className="text-xs h-4">Required for Webhooks</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-0.5">
                      Your application's public URL (e.g., https://yourdomain.com). Required for payment request webhooks to function. The webhook URL will be: <code className="bg-background px-1 py-0.5 rounded text-xs">{"${WEBSITE_URL}/api/webhooks/payment"}</code>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">ADMIN_HANDLE</code>
                      <Badge variant="outline" className="text-xs h-4">Optional</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-0.5">
                      HandCash handle (without $) authorized to access admin features. Used for admin dashboard authentication.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold">BUSINESS_AUTH_TOKEN</code>
                      <Badge variant="outline" className="text-xs h-4">Optional</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-0.5">
                      Authentication token for business wallet operations. Required only if using business wallet features like business payments or item minting.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
                  Get your HandCash credentials from the{" "}
                  <a
                    href="https://dashboard.handcash.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    HandCash Developer Dashboard
                  </a>
                  .
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-base">API Routes</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  The template includes the following API endpoints:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/auth/login</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/auth/callback</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/auth/profile</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/auth/logout</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/payments/balance</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/payments/send</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/payments/rate</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/friends</code>
                  </div>
                  <div className="bg-muted/50 p-2 rounded">
                    <code className="font-mono">/api/inventory</code>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  For more information, visit the{" "}
                  <a
                    href="https://docs.handcash.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Handcash Developer Documentation
                  </a>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-600 dark:bg-green-700 rounded-lg shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">
              Pre-Built Widgets Available
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mb-3">
              This template includes ready-to-use widgets in{" "}
              <code className="bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded text-xs font-mono">
                components/widgets/
              </code>{" "}
              that you can use as-is or customize:
            </p>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1.5 list-disc list-inside ml-1">
              <li>
                <strong>Friends List</strong> - Display user's Handcash friends with avatars
              </li>
              <li>
                <strong>Inventory Display</strong> - Show and transfer digital items/collectibles
              </li>
              <li>
                <strong>Payment Interface</strong> - Send BSV payments with balance display
              </li>
            </ul>
            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mt-3">
              These widgets are imported in{" "}
              <code className="bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded text-xs font-mono">
                components/authenticated-content.tsx
              </code>
              . You can remove, rearrange, or customize them to build your app. Check the README in the widgets folder
              for details.
            </p>
          </div>
        </div>
      </Card>

      {/* About the Template */}
      <Card className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-3">Handcash Integration Template</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A production-ready foundation for building Handcash-powered applications. This template provides secure
            authentication, wallet integration, and payment functionality out of the box with zero additional
            configuration required.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            No Setup Required
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Production Ready
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Fully Type-Safe
          </Badge>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cryptographic key pair authentication with JWT-based session management. Users authenticate via their
                Handcash wallet without passwords.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Payment Integration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send payments in multiple currencies (USD, BSV, EUR, etc.) to Handcash handles, paymail addresses, or
                Bitcoin addresses.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Inventory Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View and manage digital items and collectibles stored in users' Handcash wallets with full metadata
                support.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Wallet Balance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time balance updates showing spendable and total balances across all supported currencies with fiat
                equivalents.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Built with Next.js 16</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modern React Server Components, App Router, and TypeScript for optimal performance and developer
                experience.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Developer Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Clean API routes, type-safe utilities, and comprehensive error handling. Start building your app
                immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
        <h3 className="text-xl font-bold mb-4">Getting Started</h3>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">1</span>
            </div>
            <p className="leading-relaxed">
              Click the "Connect with Handcash" button above to authenticate with your Handcash wallet
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">2</span>
            </div>
            <p className="leading-relaxed">
              Once connected, you'll see your profile, wallet balance, and be able to send payments
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold">3</span>
            </div>
            <p className="leading-relaxed">
              Use this template as a foundation to build your own Handcash-powered application
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
