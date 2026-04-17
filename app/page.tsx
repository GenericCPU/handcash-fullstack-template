"use client"

import { UserProfile } from "@/components/user-profile"
import { LandingContent } from "@/components/landing-content"
import { AuthenticatedContent } from "@/components/authenticated-content"
import { useAuth } from "@/lib/auth-context"
import { HeaderBar } from "@/components/header-bar"
import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

function OAuthCallbackRedirect() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const state = searchParams.get("state")
    if (state) {
      const query = searchParams.toString()
      window.location.replace(`/api/auth/callback?${query}`)
    }
  }, [searchParams])

  return null
}

function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-6 flex justify-center pt-2 sm:mb-8">
        <div className="h-5 w-full max-w-md animate-pulse rounded-lg bg-muted/80" />
      </div>

      <div
        className="animate-pulse rounded-3xl border-0 bg-card p-8 shadow-sm ring-1 ring-border/60 sm:p-10"
        style={{ animationDelay: "50ms" }}
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-muted rounded-lg w-48" />
            <div className="h-5 bg-muted/80 rounded-lg w-32" />
            <div className="h-4 bg-muted/60 rounded-lg w-full max-w-xs" />
          </div>
        </div>
      </div>

      <div className="space-y-4" style={{ animationDelay: "100ms" }}>
        <div className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={null}>
        <OAuthCallbackRedirect />
      </Suspense>
      <HeaderBar />

      {isLoading ? (
        <PageLoadingSkeleton />
      ) : (
        <div className="container mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
          <LandingContent />

          <div className="space-y-8 sm:space-y-10">
            <div className="rounded-3xl border-0 bg-card p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
              <UserProfile />
            </div>

            {isAuthenticated ? <AuthenticatedContent /> : null}
          </div>
        </div>
      )}
    </div>
  )
}
