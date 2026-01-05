"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Wallet, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Balance {
  spendableBalances: {
    items: Array<{
      spendableBalance: number
      currencyCode: string
    }>
  }
  allBalances: {
    items: Array<{
      currency: {
        code: string
        logoUrl: string
        symbol: string
      }
      units: number
      fiatEquivalent: {
        currencyCode: string
        units: number
      }
    }>
  }
}

export function PaymentInterface() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [description, setDescription] = useState("")

  const fetchBalance = async () => {
    setIsLoadingBalance(true)
    setError(null)
    try {
      const response = await fetch("/api/payments/balance", {
        credentials: "include", // Automatically sends cookies
      })

      if (!response.ok) {
        // Not authenticated or error
        setIsLoadingBalance(false)
        return
      }

      const data = await response.json()
      setBalance(data)
    } catch (err) {
      console.error("[v0] Balance fetch error:", err)
      setError("Failed to load balance")
    } finally {
      setIsLoadingBalance(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/payments/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Automatically sends cookies
        body: JSON.stringify({
          destination,
          amount,
          currency,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      setSuccess(`Payment sent successfully! Transaction ID: ${data.data?.transactionId || "N/A"}`)
      setDestination("")
      setAmount("")
      setDescription("")
      fetchBalance()
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message || "Failed to send payment")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Business Wallet Balance</h3>
            <Badge variant="outline" className="text-xs">
              Business Wallet
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchBalance} disabled={isLoadingBalance}>
            <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoadingBalance ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : balance ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Spendable Balance</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {balance.spendableBalances?.items?.map((item) => (
                  <div key={item.currencyCode} className="p-3 bg-muted rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{item.currencyCode}</div>
                    <div className="text-lg font-bold">
                      {item.spendableBalance.toFixed(item.currencyCode === "BSV" ? 8 : 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {balance.allBalances?.items && balance.allBalances.items.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {balance.allBalances.items.map((item) => (
                    <div key={item.currency.code} className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{item.currency.code}</div>
                      <div className="text-lg font-semibold">
                        {item.units.toFixed(item.currency.code === "BSV" ? 8 : 2)}
                      </div>
                      {item.fiatEquivalent && (
                        <div className="text-xs text-muted-foreground mt-1">
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
          <p className="text-muted-foreground text-center py-4">No balance data available</p>
        )}
      </Card>

      {/* Payment Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Send Payment from Business Wallet</h3>
        </div>

        <form onSubmit={handleSendPayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Recipient (Handle, Paymail, or Address)</Label>
            <Input
              id="destination"
              type="text"
              placeholder="@username or user@handcash.io or 1A1z..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BSV">BSV</SelectItem>
                  <SelectItem value="MNEE">MNEE</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Message (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note to your payment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Payment...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Payment
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Supported Recipients</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Handcash Handles</Badge>
            <Badge variant="secondary">Paymail Addresses</Badge>
            <Badge variant="secondary">Bitcoin Addresses</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
