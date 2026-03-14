"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch("/api/admin/check", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthorized) {
    return null
  }

  return <AdminDashboard />
}

