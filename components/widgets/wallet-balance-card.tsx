"use client"

import { usePayments } from "@/hooks/use-payments"
import { BalanceDisplay } from "@/components/widgets/balance-display"

/** Read-only spendable/total balances via `/api/payments/balance` (requires pay scope). */
export function WalletBalanceCard() {
  const { balance, isLoadingBalance, error, fetchBalance } = usePayments()

  return (
    <BalanceDisplay
      balance={balance}
      isLoading={isLoadingBalance}
      error={error}
      onRefresh={fetchBalance}
      showPermissionHint
    />
  )
}
