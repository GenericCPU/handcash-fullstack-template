"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, RefreshCw, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFriends } from "@/hooks/use-friends"
import { FriendsListBodySkeleton } from "@/components/skeletons/app-skeletons"

export function FriendsList() {
  const { friends, isLoading, error, fetchFriends } = useFriends()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedFriends = isExpanded ? friends : friends.slice(0, 5)
  const hasMoreFriends = friends.length > 5

  return (
    <Card className="rounded-3xl border-0 bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <h3 className="text-base font-semibold tracking-tight text-foreground">Friends</h3>
          {friends.length > 0 && (
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums">
              {friends.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchFriends()} disabled={isLoading} className="rounded-full">
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <FriendsListBodySkeleton rows={5} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <Users className="mb-5 h-14 w-14 text-muted-foreground/80" aria-hidden />
          <p className="max-w-xs text-center text-[15px] leading-relaxed text-muted-foreground">
            Turn on the <span className="font-medium text-foreground/90">Friends</span> permission for this app in
            HandCash, then sign in again.
          </p>
        </div>
      ) : friends.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <Users className="mx-auto mb-5 h-16 w-16 text-muted-foreground/70" aria-hidden />
          <p className="text-[15px] font-medium text-foreground/90">No friends to show</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            When your HandCash friends list is available, people you know will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-border/40 transition-colors hover:bg-muted/50"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.avatarUrl || "/placeholder.svg"} alt={friend.displayName} />
                <AvatarFallback className="font-bold">
                  {(friend.displayName?.trim() || friend.handle || "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate text-base">{friend.displayName?.trim() || `$${friend.handle}`}</div>
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
