"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send } from "lucide-react"
import { usePayments } from "@/hooks/use-payments"
import { BalanceDisplay } from "@/components/widgets/balance-display"

export function PaymentInterface() {
  const { balance, isLoadingBalance, isSending, error, success, fetchBalance, sendPayment, clearError, clearSuccess } =
    usePayments()

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
    } catch {
      // Error is already handled by the hook
    }
  }

  const amountStep = instrument === "BSV" ? "0.00000001" : "0.01"

  return (
    <div className="space-y-8 sm:space-y-10">
      <BalanceDisplay
        balance={balance}
        isLoading={isLoadingBalance}
        error={error}
        onRefresh={fetchBalance}
        showPermissionHint
      />

      <Card className="rounded-3xl border-0 bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Send className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <h3 className="text-base font-semibold tracking-tight text-foreground">Send payment</h3>
        </div>

        {error && !balance ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <Send className="mb-5 h-14 w-14 text-muted-foreground/80" aria-hidden />
            <p className="max-w-xs text-center text-[15px] leading-relaxed text-muted-foreground">
              Turn on the <span className="font-medium text-foreground/90">Pay</span> permission for this app in
              HandCash, then sign in again.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendPayment} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="payment-destination" className="text-sm font-medium text-foreground/90">
                Send to
              </Label>
              <Input
                id="payment-destination"
                type="text"
                placeholder="Handle, paymail, or address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="h-12 rounded-2xl border-border/80 bg-background px-4 text-base shadow-sm"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-foreground/90">Currency</legend>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setInstrument("BSV")}
                  className={`h-12 flex-1 rounded-2xl text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    instrument === "BSV"
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-muted/40 text-foreground shadow-sm ring-1 ring-border/50 hover:bg-muted/60"
                  }`}
                >
                  BSV
                </button>
                <button
                  type="button"
                  onClick={() => setInstrument("MNEE")}
                  className={`h-12 flex-1 rounded-2xl text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    instrument === "MNEE"
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-muted/40 text-foreground shadow-sm ring-1 ring-border/50 hover:bg-muted/60"
                  }`}
                >
                  MNEE
                </button>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="payment-amount" className="text-sm font-medium text-foreground/90">
                Amount
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Enter the amount in the currency you selected ({instrument}). BSV supports more decimal places.
              </p>
              <Input
                id="payment-amount"
                type="number"
                step={amountStep}
                min="0"
                placeholder={instrument === "BSV" ? "0.00000000" : "0.00"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-12 rounded-2xl border-border/80 bg-background px-4 text-lg tabular-nums shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-note" className="text-sm font-medium text-muted-foreground">
                Note <span className="font-normal">(optional)</span>
              </Label>
              <Textarea
                id="payment-note"
                placeholder="Shown to the recipient with the payment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="min-h-[5.5rem] resize-y rounded-2xl border-border/80 bg-background shadow-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-2xl border-0 shadow-sm ring-1 ring-destructive/25">
                <AlertDescription className="text-[15px]">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="rounded-2xl border-0 bg-primary/[0.07] shadow-sm ring-1 ring-primary/20">
                <AlertDescription className="text-[15px] font-medium text-primary">{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="h-14 w-full rounded-full text-base font-semibold shadow-sm" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" aria-hidden />
                  Send payment
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
