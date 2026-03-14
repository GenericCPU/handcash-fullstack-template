"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Theme = "system" | "dark" | "light"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex rounded-lg bg-foreground/10 p-1 gap-0.5 h-9 w-[7.25rem]">
        <div className="flex-1 rounded-md bg-background/50" />
      </div>
    )
  }

  const current: Theme = (theme as Theme) ?? "system"
  const isSystem = current === "system"
  const isDark = current === "dark"
  const isLight = current === "light"

  return (
    <div className="flex rounded-lg bg-foreground/10 p-1 gap-0.5" role="group" aria-label="Theme">
      <button
        type="button"
        title="System"
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
          isSystem ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Dark"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
          isDark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Light"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
          isLight ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="h-4 w-4" />
      </button>
    </div>
  )
}
