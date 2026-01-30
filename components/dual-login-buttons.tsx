"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface DualLoginButtonsProps {
  compact?: boolean
  showDivider?: boolean
}

export function DualLoginButtons({ compact = false, showDivider = true }: DualLoginButtonsProps) {
  const [isHandCashLoading, setIsHandCashLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const isLoading = isHandCashLoading || isGoogleLoading

  const handleHandCashLogin = async () => {
    setIsHandCashLoading(true)
    setError(null)
    try {
      await login()
    } catch (error) {
      console.error("[DualLogin] HandCash login error:", error)
      setError("Failed to connect with Handcash")
      setIsHandCashLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/google")

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to get Google OAuth URL")
      }

      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error("No auth URL received")
      }
    } catch (error) {
      console.error("[DualLogin] Google login error:", error)
      setError("Failed to connect with Google")
      setIsGoogleLoading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-[260px]">
        <Button
          onClick={handleGoogleLogin}
          className="h-10 px-4 text-sm font-medium rounded-md bg-white hover:bg-gray-50 text-[#3c4043] border border-[#dadce0] w-full shadow-sm hover:shadow transition-shadow"
          disabled={isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#3c4043]" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Sign in with Google
        </Button>

        <Button
          onClick={handleHandCashLogin}
          className="h-10 px-4 text-sm font-medium rounded-md bg-black hover:bg-black/90 text-white w-full"
          disabled={isLoading}
        >
          {isHandCashLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Image src="/handcash-logo.png" alt="HandCash" width={18} height={18} className="mr-2" />
          )}
          Connect with Handcash
        </Button>

        {error && <p className="text-xs text-destructive text-center mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[340px]">
      <Button
        onClick={handleGoogleLogin}
        className="h-12 px-6 text-base font-medium rounded-lg bg-white hover:bg-gray-50 text-[#3c4043] border border-[#dadce0] w-full shadow-sm hover:shadow-md transition-all"
        disabled={isLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 mr-3 animate-spin text-[#3c4043]" />
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
      </Button>

      {showDivider && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      <Button
        onClick={handleHandCashLogin}
        className="h-12 px-6 text-base font-semibold rounded-lg bg-black hover:bg-black/90 text-white w-full transition-all"
        disabled={isLoading}
      >
        {isHandCashLoading ? (
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
        ) : (
          <Image src="/handcash-logo.png" alt="HandCash" width={22} height={22} className="mr-3" />
        )}
        {isHandCashLoading ? "Connecting..." : "Connect with Handcash"}
      </Button>

      {error && (
        <div className="flex justify-center px-4 py-2 rounded-md bg-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
