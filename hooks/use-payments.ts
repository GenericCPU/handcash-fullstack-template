import { useState, useEffect } from "react"

export interface Balance {
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

export interface SendPaymentParams {
  destination: string
  amount: string
  instrument: string
  description?: string
}

export interface SendPaymentResult {
  transactionId?: string
}

export function usePayments() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchBalance = async () => {
    setIsLoadingBalance(true)
    setError(null)
    try {
      const response = await fetch("/api/payments/balance", {
        credentials: "include",
      })

      if (!response.ok) {
        // Not authenticated or error
        setIsLoadingBalance(false)
        return
      }

      const data = await response.json()
      setBalance(data)
    } catch (err) {
      console.error("[usePayments] Balance fetch error:", err)
      setError("Failed to load balance")
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const sendPayment = async (params: SendPaymentParams): Promise<SendPaymentResult> => {
    setIsSending(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/payments/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment failed")
      }

      setSuccess(`Payment sent successfully! Transaction ID: ${data.data?.transactionId || "N/A"}`)
      await fetchBalance()

      return {
        transactionId: data.data?.transactionId,
      }
    } catch (err: any) {
      console.error("[usePayments] Payment error:", err)
      setError(err.message || "Failed to send payment")
      throw err
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return {
    balance,
    isLoadingBalance,
    isSending,
    error,
    success,
    fetchBalance,
    sendPayment,
    refresh: fetchBalance,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  }
}

