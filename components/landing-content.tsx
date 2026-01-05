"use client"

import { useState, useEffect } from "react"

interface BusinessProfile {
  publicProfile?: {
    avatarUrl?: string
    displayName?: string
  }
}

export function LandingContent() {
  const [businessAvatar, setBusinessAvatar] = useState<string | null>(null)
  const [businessDisplayName, setBusinessDisplayName] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const fetchBusinessProfile = async () => {
      try {
        const response = await fetch("/api/business/profile")
        if (response.ok) {
          const data: BusinessProfile = await response.json()
          if (data.publicProfile?.avatarUrl) {
            setBusinessAvatar(data.publicProfile.avatarUrl)
          }
          if (data.publicProfile?.displayName) {
            setBusinessDisplayName(data.publicProfile.displayName)
          }
        }
      } catch (err) {
        // Silently fail - will use default logo
        console.error("Failed to fetch business profile:", err)
      }
    }

    fetchBusinessProfile()
  }, [])

  return (
    <div className="text-center mb-16 pt-8">
      {/* 
        ═══════════════════════════════════════════════════════════════
        CUSTOMIZE YOUR LANDING PAGE HERO SECTION HERE
        Replace the content below with your app's branding and messaging
        ═══════════════════════════════════════════════════════════════
      */}
      <div className="inline-flex p-6 bg-primary/10 rounded-3xl mb-6">
        {isMounted && businessAvatar ? (
          <img src={businessAvatar} alt="App Logo" className="w-24 h-24 rounded-2xl object-cover" />
        ) : (
          <span className="text-6xl">🚀</span>
        )}
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
        {isMounted && businessDisplayName ? businessDisplayName : "Your App Name"}
      </h1>
      <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">Your app description goes here</p>
      {/* 
        ═══════════════════════════════════════════════════════════════
        END OF CUSTOMIZABLE HERO SECTION
        ═══════════════════════════════════════════════════════════════
      */}
    </div>
  )
}
