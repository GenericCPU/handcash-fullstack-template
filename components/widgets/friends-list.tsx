"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, RefreshCw, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Friend {
  id: string
  handle: string
  paymail: string
  displayName: string
  avatarUrl: string
  createdAt: Date
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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
      console.error("[v0] Friends fetch error:", err)
      setError("Failed to load friends")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const displayedFriends = isExpanded ? friends : friends.slice(0, 5)
  const hasMoreFriends = friends.length > 5

  return (
    <Card className="p-6 rounded-3xl border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Friends</h3>
          {friends.length > 0 && (
            <Badge variant="secondary" className="rounded-full font-bold">
              {friends.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFriends} disabled={isLoading} className="rounded-full">
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      ) : friends.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 text-lg">No friends found</p>
      ) : (
        <div className="space-y-2">
          {displayedFriends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-colors">
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.avatarUrl || "/placeholder.svg"} alt={friend.displayName} />
                <AvatarFallback className="font-bold">{friend.displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate text-base">{friend.displayName}</div>
                <div className="text-sm text-muted-foreground truncate">${friend.handle}</div>
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block font-mono">{friend.paymail}</div>
            </div>
          ))}

          {hasMoreFriends && (
            <Button
              variant="ghost"
              className="w-full mt-3 rounded-full font-semibold"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              {isExpanded ? "Show Less" : `Show ${friends.length - 5} More`}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
