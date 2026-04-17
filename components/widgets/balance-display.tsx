"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, RefreshCw } from "lucide-react"
import { BalanceTilesSkeleton } from "@/components/skeletons/app-skeletons"
import type { Balance } from "@/hooks/use-payments"

export interface BalanceDisplayProps {
  balance: Balance | null
  isLoading: boolean
  /** When balance failed to load (e.g. missing pay permission) */
  error: string | null
  onRefresh: () => void
  /** If true, treat `error && !balance` as missing HandCash pay scope */
  showPermissionHint?: boolean
}

export function BalanceDisplay({
  balance,
  isLoading,
  error,
  onRefresh,
  showPermissionHint = true,
}: BalanceDisplayProps) {
  return (
    <Card className="rounded-3xl border-0 bg-card p-5 shadow-sm ring-1 ring-border/60 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <h3 className="text-base font-semibold tracking-tight text-foreground">Balance</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRefresh()}
          disabled={isLoading}
          className="rounded-full h-8 w-8 p-0"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="py-2">
          <BalanceTilesSkeleton />
        </div>
      ) : showPermissionHint && error && !balance ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <Wallet className="mb-5 h-14 w-14 text-muted-foreground/80" aria-hidden />
          <p className="max-w-xs text-center text-[15px] leading-relaxed text-muted-foreground">
            Turn on the <span className="font-medium text-foreground/90">Pay</span> permission for this app in
            HandCash, then sign in again.
          </p>
        </div>
      ) : balance ? (
        <div className="space-y-6">
          {balance.spendableBalances?.items && balance.spendableBalances.items.length > 0 && (
            <div>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                Spendable
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3.5">
                {balance.spendableBalances.items.map((item) => {
                  const allBalanceItem = balance.allBalances?.items?.find((b) => b.currency.code === item.currencyCode)
                  const usdValue =
                    item.currencyCode === "BSV" && allBalanceItem?.fiatEquivalent && allBalanceItem.units > 0
                      ? (item.spendableBalance / allBalanceItem.units) * allBalanceItem.fiatEquivalent.units
                      : null

                  return (
                    <div
                      key={item.currencyCode}
                      className="rounded-2xl bg-muted/35 p-3.5 shadow-sm ring-1 ring-border/40 sm:p-4"
                    >
                      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/90">
                        {item.currencyCode}
                      </div>
                      <div
                        className={`break-all font-semibold tabular-nums tracking-tight text-foreground ${item.currencyCode === "BSV" ? "text-lg" : "text-xl"}`}
                      >
                        {item.spendableBalance.toFixed(item.currencyCode === "BSV" ? 8 : 2)}
                      </div>
                      {usdValue !== null && (
                        <div className="mt-1 text-xs text-muted-foreground">
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
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">Total</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-3.5">
                {balance.allBalances.items.map((item) => (
                  <div
                    key={item.currency.code}
                    className="rounded-2xl bg-muted/20 p-3.5 shadow-sm ring-1 ring-border/30 sm:p-4"
                  >
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/90">
                      {item.currency.code}
                    </div>
                    <div
                      className={`mb-1 break-all font-semibold tabular-nums tracking-tight text-foreground ${item.currency.code === "BSV" ? "text-lg" : "text-xl"}`}
                    >
                      {item.units.toFixed(item.currency.code === "BSV" ? 8 : 2)}
                    </div>
                    {item.currency.code === "BSV" && item.fiatEquivalent && (
                      <div className="text-xs text-muted-foreground">
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
        <div className="px-4 py-14 text-center">
          <p className="text-[15px] font-medium text-foreground/90">Nothing to show yet</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            After you connect, your spendable and total balances will show up here.
          </p>
        </div>
      )}
    </Card>
  )
}
