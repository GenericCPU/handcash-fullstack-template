import { NextResponse } from "next/server"

export interface WinnerCard {
  id: string
  title: string
  subtitle?: string
  imageUrl?: string
}

export interface WinnersResponse {
  cards: WinnerCard[]
  winningIds: string[]
}

/**
 * Returns all cards and the IDs of the 5 winning cards.
 * Configure via WINNERS_JSON env (JSON: { cards: WinnerCard[], winningIds: string[] })
 * or uses demo data.
 */
export async function GET() {
  const raw = process.env.WINNERS_JSON
  if (raw) {
    try {
      const data = JSON.parse(raw) as WinnersResponse
      if (Array.isArray(data.cards) && Array.isArray(data.winningIds)) {
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to demo
    }
  }

  // Demo data: 12 cards, first 5 are winners
  const demoCards: WinnerCard[] = [
    { id: "1", title: "Card #1", subtitle: "Winner", imageUrl: "/placeholder.svg" },
    { id: "2", title: "Card #2", subtitle: "Winner", imageUrl: "/placeholder.svg" },
    { id: "3", title: "Card #3", subtitle: "Winner", imageUrl: "/placeholder.svg" },
    { id: "4", title: "Card #4", subtitle: "Winner", imageUrl: "/placeholder.svg" },
    { id: "5", title: "Card #5", subtitle: "Winner", imageUrl: "/placeholder.svg" },
    { id: "6", title: "Card #6", imageUrl: "/placeholder.svg" },
    { id: "7", title: "Card #7", imageUrl: "/placeholder.svg" },
    { id: "8", title: "Card #8", imageUrl: "/placeholder.svg" },
    { id: "9", title: "Card #9", imageUrl: "/placeholder.svg" },
    { id: "10", title: "Card #10", imageUrl: "/placeholder.svg" },
    { id: "11", title: "Card #11", imageUrl: "/placeholder.svg" },
    { id: "12", title: "Card #12", imageUrl: "/placeholder.svg" },
  ]
  const demoWinningIds = ["1", "2", "3", "4", "5"]

  return NextResponse.json({
    cards: demoCards,
    winningIds: demoWinningIds,
  })
}
