import { useState, useEffect } from "react"

export interface Friend {
  id: string
  handle: string
  paymail: string
  displayName: string
  avatarUrl: string
  createdAt: Date
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFriends = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/friends", {
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 403) {
          setError("FRIENDS permission not granted. Please re-authorize with FRIENDS permission.")
        } else if (response.status === 401) {
          setIsLoading(false)
          return
        } else {
          setError(data.error || "Failed to load friends")
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setFriends(data.friends || [])
    } catch (err) {
      console.error("[useFriends] Fetch error:", err)
      setError("Failed to load friends")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  return {
    friends,
    isLoading,
    error,
    fetchFriends,
    refresh: fetchFriends,
  }
}

