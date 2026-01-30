"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Rocket, LogOut, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface BusinessProfile {
  publicProfile?: {
    avatarUrl?: string
  }
}

export function HeaderBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [businessAvatar, setBusinessAvatar] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        const response = await fetch("/api/business/profile")
        if (response.ok) {
          const data: BusinessProfile = await response.json()
          if (data.publicProfile?.avatarUrl) {
            setBusinessAvatar(data.publicProfile.avatarUrl)
          }
        }
      } catch {
        // Silently fail - will use default logo
      }
    }

    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/status", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin === true)
        }
      } catch {
        setIsAdmin(false)
      }
    }

    fetchBusinessProfile()
    if (isAuthenticated) {
      checkAdminStatus()
    }
  }, [isAuthenticated])

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {isLoading ? (
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg animate-pulse" />
              <div className="flex gap-0.5 sm:gap-1 bg-muted/30 rounded-full p-0.5 sm:p-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-8 sm:w-20 sm:h-9 bg-muted rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
                <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl sm:rounded-2xl">
                  {isMounted && businessAvatar ? (
                    <img src={businessAvatar} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover" />
                  ) : (
                    <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  )}
                </div>
              </Link>

              <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1 bg-muted/40 rounded-full p-0.5 sm:p-1">
                <Button
                  variant={isActive("/") ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={`rounded-full h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm transition-all ${
                    isActive("/") ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                >
                  <Link href="/" className="gap-1.5 sm:gap-2">
                    <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                </Button>
                {isMounted && isAdmin && (
                  <Button
                    variant={isActive("/admin") ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className={`rounded-full h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm transition-all ${
                      isActive("/admin") ? "bg-background shadow-sm" : "hover:bg-background/50"
                    }`}
                  >
                    <Link href="/admin" className="gap-1.5 sm:gap-2">
                      <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  </Button>
                )}
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 sm:h-10 gap-2 px-1.5 sm:px-2 focus-visible:ring-0 focus-visible:ring-offset-0 flex-row-reverse rounded-full hover:bg-muted/50"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-background">
                      <AvatarImage
                        src={user.publicProfile.avatarUrl || "/placeholder.svg"}
                        alt={user.publicProfile.displayName}
                      />
                      <AvatarFallback className="text-xs">
                        {user.publicProfile.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-col items-end text-right hidden md:flex">
                      <span className="text-sm font-medium leading-none">{user.publicProfile.displayName}</span>
                      <span className="text-xs leading-none text-muted-foreground">${user.publicProfile.handle}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.publicProfile.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">${user.publicProfile.handle}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isMounted && isAdmin && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="cursor-pointer font-medium"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive focus:text-destructive cursor-pointer font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
