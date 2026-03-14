"use client"

import { UserProfile } from "@/components/user-profile"
import { TemplateInfo } from "@/components/template-info"
import { LandingContent } from "@/components/landing-content"
import { AuthenticatedContent } from "@/components/authenticated-content"
import { useAuth } from "@/lib/auth-context"
import { HeaderBar } from "@/components/header-bar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-6 py-6 max-w-2xl space-y-6">
      {/* Hero skeleton */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex p-6 bg-muted/50 rounded-3xl mb-6">
          <div className="w-24 h-24 rounded-2xl bg-muted animate-pulse" />
        </div>
        <div className="h-10 sm:h-12 bg-muted rounded-lg w-64 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted/80 rounded-lg w-80 max-w-full mx-auto animate-pulse" style={{ animationDelay: "50ms" }} />
      </div>

      {/* Config alert placeholder (optional, same height) */}
      <div className="h-0" aria-hidden />

      {/* Profile card skeleton */}
      <div className="bg-card rounded-3xl p-8 border border-border animate-pulse" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-muted rounded-lg w-48" />
            <div className="h-5 bg-muted/80 rounded-lg w-32" />
            <div className="h-4 bg-muted/60 rounded-lg w-full max-w-xs" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4" style={{ animationDelay: "150ms" }}>
        <div className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [configStatus, setConfigStatus] = useState<{ hasAppId: boolean; hasAppSecret: boolean; isConfigured: boolean } | null>(null)

  // If HandCash redirected to root with OAuth params, send to API callback to complete login
  useEffect(() => {
    const state = searchParams.get("state")
    if (state) {
      const query = searchParams.toString()
      window.location.replace(`/api/auth/callback?${query}`)
      return
    }
  }, [searchParams])

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/config-check", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setConfigStatus(data)
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

      {isLoading ? (
        <PageLoadingSkeleton />
      ) : (
        <div className="container mx-auto px-6 py-6 max-w-2xl">
          <LandingContent />

          <div className="space-y-6">
            {configStatus && !configStatus.isConfigured && (
              <Alert variant="destructive" className="rounded-3xl border-border">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-bold">Configuration Required</AlertTitle>
                <AlertDescription>
                  {!configStatus.hasAppId && !configStatus.hasAppSecret && (
                    <>You need to add <code className="px-2 py-1 bg-background rounded font-mono text-sm">HANDCASH_APP_ID</code> and <code className="px-2 py-1 bg-background rounded font-mono text-sm">HANDCASH_APP_SECRET</code> to your environment variables.</>
                  )}
                  {!configStatus.hasAppId && configStatus.hasAppSecret && (
                    <>You need to add <code className="px-2 py-1 bg-background rounded font-mono text-sm">HANDCASH_APP_ID</code> to your environment variables.</>
                  )}
                  {configStatus.hasAppId && !configStatus.hasAppSecret && (
                    <>You need to add <code className="px-2 py-1 bg-background rounded font-mono text-sm">HANDCASH_APP_SECRET</code> to your environment variables.</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-card rounded-3xl p-8 border border-border">
              <UserProfile />
            </div>

            {!isAuthenticated ? (
              <TemplateInfo />
            ) : (
              <AuthenticatedContent />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
