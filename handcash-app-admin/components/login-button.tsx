"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/login")
      const data = await response.json()

      if (data.redirectUrl && data.jwt) {
        localStorage.setItem("handcash_auth_jwt", data.jwt)

        window.location.href = data.redirectUrl
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
      <LogIn className="w-4 h-4 mr-2" />
      {isLoading ? "Connecting..." : "Connect with Handcash"}
    </Button>
  )
}
