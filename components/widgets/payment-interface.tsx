"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Wallet, RefreshCw } from "lucide-react"
import { usePayments } from "@/hooks/use-payments"

export function PaymentInterface() {
  const { balance, isLoadingBalance, isSending, error, success, fetchBalance, sendPayment, clearError, clearSuccess } = usePayments()

  // Form state
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [instrument, setInstrument] = useState("BSV")

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    clearSuccess()

    try {
      await sendPayment({
        destination,
        amount,
        instrument,
        description,
      })
      setDestination("")
      setAmount("")
      setDescription("")
    } catch (err) {
      // Error is already handled by the hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="p-4 rounded-3xl border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Wallet Balance</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => fetchBalance()} disabled={isLoadingBalance} className="rounded-full h-8 w-8 p-0">
            <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoadingBalance ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : balance ? (
          <div className="space-y-4">
            {balance.spendableBalances?.items && balance.spendableBalances.items.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Spendable Balance</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {balance.spendableBalances.items.map((item) => {
                    const allBalanceItem = balance.allBalances?.items?.find((b) => b.currency.code === item.currencyCode)
                    const usdValue =
                      item.currencyCode === "BSV" && allBalanceItem?.fiatEquivalent && allBalanceItem.units > 0
                        ? (item.spendableBalance / allBalanceItem.units) * allBalanceItem.fiatEquivalent.units
                        : null

                    return (
                      <div key={item.currencyCode} className="p-3 bg-gradient-to-br from-muted to-muted/80 rounded-xl border border-border/50">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.currencyCode}</div>
                        <div className={`font-bold tracking-tight break-all ${item.currencyCode === "BSV" ? "text-lg mb-1" : "text-xl mb-1"}`}>
                          {item.spendableBalance.toFixed(item.currencyCode === "BSV" ? 8 : 2)}
                        </div>
                        {usdValue !== null && (
                          <div className="text-xs text-muted-foreground font-medium">
                            ≈ ${usdValue.toFixed(2)} {allBalanceItem?.fiatEquivalent?.currencyCode || "USD"}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {balance.allBalances?.items && balance.allBalances.items.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Total Balance</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {balance.allBalances.items.map((item) => (
                    <div key={item.currency.code} className="p-3 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.currency.code}</div>
                      <div className={`font-bold tracking-tight break-all mb-1 ${item.currency.code === "BSV" ? "text-lg" : "text-xl"}`}>
                        {item.units.toFixed(item.currency.code === "BSV" ? 8 : 2)}
                      </div>
                      {item.currency.code === "BSV" && item.fiatEquivalent && (
                        <div className="text-xs text-muted-foreground font-medium">
                          ≈ ${item.fiatEquivalent.units.toFixed(2)} {item.fiatEquivalent.currencyCode}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-1">No balance data available</p>
            <p className="text-xs text-muted-foreground/70">Wallet balance will appear here</p>
          </div>
        )}
      </Card>

      {/* Payment Form */}
      <Card className="p-6 rounded-3xl border-border">
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Send Payment</h3>
        </div>

        <form onSubmit={handleSendPayment} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="destination" className="font-semibold">
              Recipient (Handle, Paymail, or Address)
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="@username or user@handcash.io or 1A1z..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="rounded-2xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">
              Payment Instrument
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setInstrument("BSV")}
                className={`flex-1 h-12 rounded-xl border-2 font-semibold text-base transition-all ${
                  instrument === "BSV"
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background hover:bg-muted border-border hover:border-primary/50"
                }`}
              >
                BSV
              </button>
              <button
                type="button"
                onClick={() => setInstrument("MNEE")}
                className={`flex-1 h-12 rounded-xl border-2 font-semibold text-base transition-all ${
                  instrument === "MNEE"
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background hover:bg-muted border-border hover:border-primary/50"
                }`}
              >
                MNEE
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="font-semibold">
              Amount (USD)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="rounded-2xl h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Message (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note to your payment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-2xl"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-2xl border-primary/50 bg-primary/5">
              <AlertDescription className="text-primary font-semibold">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full rounded-full h-14 text-lg font-bold" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending Payment...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Payment
              </>
            )}
          </Button>
        </form>

      </Card>
    </div>
  )
}
