"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log("[v0] Callback page loaded")
    console.log("[v0] URL search params:", Object.fromEntries(searchParams.entries()))

    const authTokenFromUrl = searchParams.get("authToken")

    if (authTokenFromUrl) {
      console.log("[v0] AuthToken found in URL, redirecting to API")
      // Let the GET API route handle this
      window.location.href = `/api/auth/callback?authToken=${authTokenFromUrl}`
      return
    }

    const jwt = localStorage.getItem("handcash_auth_jwt")
    console.log("[v0] JWT from localStorage:", jwt ? "present" : "missing")

    if (jwt) {
      console.log("[v0] Sending JWT to callback API")
      fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt }),
        credentials: "include",
      })
        .then((res) => {
          console.log("[v0] Callback API response status:", res.status)
          if (res.ok) {
            localStorage.removeItem("handcash_auth_jwt")
            router.push("/")
          } else {
            throw new Error("Authentication failed")
          }
        })
        .catch((error) => {
          console.error("[v0] Error during callback:", error)
          localStorage.removeItem("handcash_auth_jwt")
          router.push("/?error=auth_failed")
        })
    } else {
      console.error("[v0] No JWT found in localStorage and no authToken in URL")
      router.push("/?error=auth_failed")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
