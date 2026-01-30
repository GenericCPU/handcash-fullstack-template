"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

/**
 * Centralized Authentication Context
 * Provides shared auth state across the application with automatic token validation
 */

export interface UserProfile {
  publicProfile: {
    handle: string
    displayName: string
    avatarUrl: string
    paymail: string
  }
}

interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/auth/profile", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("[v0] Auth context profile fetch error:", err)
      setError("Failed to load profile")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/login", {
        credentials: "include",
      })
      const data = await response.json()

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error("No redirect URL received")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Failed to initiate login")
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser(null)
        window.location.href = "/"
      }
    } catch (err) {
      console.error("[v0] Logout error:", err)
      setError("Failed to logout")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial profile fetch
  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  // Auto-refresh profile every 5 minutes to detect session changes
  useEffect(() => {
    const interval = setInterval(refreshProfile, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshProfile])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshProfile,
    refetch: refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
