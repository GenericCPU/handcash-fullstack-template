"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Building2,
  LayoutTemplate,
  Coins,
  CreditCard,
} from "lucide-react"

const SECTIONS = [
  { id: "user-profile", label: "User Profile", icon: User },
  { id: "business-wallet", label: "Business Wallet", icon: Building2 },
  { id: "item-templates", label: "Item Templates", icon: LayoutTemplate },
  { id: "mint-section", label: "Mint", icon: Coins },
  { id: "payment-requests", label: "Payment Requests", icon: CreditCard },
] as const

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

export function AdminDirectory() {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const topOffset = 120
    const updateActive = () => {
      const withTops = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id)
        return el ? { id, top: el.getBoundingClientRect().top } : null
      }).filter(Boolean) as { id: string; top: number }[]
      const passed = withTops.filter(({ top }) => top <= topOffset + 80)
      const current = passed.length
        ? passed.sort((a, b) => b.top - a.top)[0]
        : withTops.sort((a, b) => a.top - b.top)[0]
      setActiveId(current?.id ?? SECTIONS[0].id)
    }
    updateActive()
    window.addEventListener("scroll", updateActive, { passive: true })
    return () => window.removeEventListener("scroll", updateActive)
  }, [])

  return (
    <nav
      aria-label="Admin sections"
      className="lg:sticky lg:top-24 lg:self-start w-full shrink-0 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2 hidden lg:block">
        Sections
      </p>
      <ul className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0 lg:space-y-0.5">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <li key={id} className="shrink-0 lg:shrink">
            <button
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                "flex items-center gap-2 lg:gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full whitespace-nowrap",
                activeId === id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
