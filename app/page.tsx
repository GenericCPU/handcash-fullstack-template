"use client"

import { UserProfile } from "@/components/user-profile"
import { AuthenticatedContent } from "@/components/authenticated-content"
import { useAuth } from "@/lib/auth-context"
import { HeaderBar } from "@/components/header-bar"
import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardPageSkeleton } from "@/components/skeletons/app-skeletons"

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

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={null}>
        <OAuthCallbackRedirect />
      </Suspense>
      <HeaderBar />

      {isLoading ? (
        <DashboardPageSkeleton />
      ) : (
        <div className="container mx-auto max-w-2xl space-y-8 px-5 py-10 sm:space-y-10 sm:px-8 sm:py-14">
          <div className="rounded-3xl border-0 bg-card p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
            <UserProfile />
          </div>

          {isAuthenticated ? <AuthenticatedContent /> : null}
        </div>
      )}
    </div>
  )
}
