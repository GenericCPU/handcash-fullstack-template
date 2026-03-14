import { useState, useEffect, useCallback } from "react"

export interface Permissions {
  profile: boolean
  pay: boolean
  friends: boolean
  inventory: boolean
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/permissions", {
        credentials: "include",
      })
      if (!response.ok) {
        setPermissions(null)
        return
      }
      const data = await response.json()
      setPermissions(data)
    } catch (err) {
      console.error("[usePermissions]", err)
      setError("Failed to load permissions")
      setPermissions(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  return {
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  }
}
