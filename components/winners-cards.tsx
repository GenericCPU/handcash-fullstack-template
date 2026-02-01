"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

export interface WinnerCard {
  id: string
  title: string
  subtitle?: string
  imageUrl?: string
}

interface WinnersData {
  cards: WinnerCard[]
  winningIds: string[]
}

const WINNING_COUNT = 5

export function WinnersCards() {
  const [data, setData] = useState<WinnersData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/winners", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load winners")
        return res.json()
      })
      .then((d: WinnersData) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load")
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <Card className="p-6 rounded-3xl border-border">
        <p className="text-muted-foreground text-center">{error}</p>
      </Card>
    )
  }

  if (!data || data.cards.length === 0) return null

  const winningSet = new Set(data.winningIds ?? data.cards.slice(0, WINNING_COUNT).map((c) => c.id))

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Winners</h2>
        <Badge variant="secondary" className="gap-1">
          <Trophy className="w-3.5 h-3.5" />
          {winningSet.size} winning cards
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.cards.map((card) => {
          const isWinner = winningSet.has(card.id)
          return (
            <Card
              key={card.id}
              className={`overflow-hidden rounded-2xl border-2 transition-all ${
                isWinner
                  ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30"
                  : "border-border bg-card"
              }`}
            >
              <div className="aspect-square relative bg-muted">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-bold">
                    {card.id}
                  </div>
                )}
                {isWinner && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 text-amber-950 border-0 gap-1 shadow-md">
                      <Trophy className="w-3 h-3" />
                      Winner
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{card.title}</p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
