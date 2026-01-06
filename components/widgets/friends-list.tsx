"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, RefreshCw, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFriends } from "@/hooks/use-friends"

export function FriendsList() {
  const { friends, isLoading, error, fetchFriends } = useFriends()
  const [isExpanded, setIsExpanded] = useState(false)

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
        <Button variant="ghost" size="sm" onClick={() => fetchFriends()} disabled={isLoading} className="rounded-full">
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
