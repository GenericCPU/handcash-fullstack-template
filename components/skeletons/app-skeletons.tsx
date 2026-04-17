import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

/** Header placeholder: logo slot, pill nav, avatar slot. */
export function HeaderBarSkeleton() {
  return (
    <div className="flex w-full items-center justify-between">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg sm:h-10 sm:w-10" />
      <div className="flex gap-0.5 rounded-full bg-muted/30 p-0.5 sm:gap-1 sm:p-1">
        <Skeleton className="h-8 w-9 rounded-full sm:h-9 sm:w-20" />
        <Skeleton className="h-8 w-9 rounded-full sm:h-9 sm:w-20" />
        <Skeleton className="h-8 w-9 rounded-full sm:h-9 sm:w-20" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0 rounded-full sm:h-10 sm:w-10" />
    </div>
  )
}

/** Matches signed-in profile card (avatar + text + logout). */
export function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5 sm:gap-6">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full ring-2 ring-border/30 ring-offset-2 ring-offset-background" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-8 w-48 max-w-full rounded-lg sm:h-9" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-[220px] rounded-xl" />
    </div>
  )
}

function WidgetChrome({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border-0 bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      {children}
    </div>
  )
}

/** User inventory grid only (use inside existing `Card` from `InventoryDisplay`). */
export function InventoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-border/50">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-[85%] max-w-[200px]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full inventory widget including chrome (for dashboard page skeleton). */
export function InventoryCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <WidgetChrome>
      <InventoryGridSkeleton count={count} />
    </WidgetChrome>
  )
}

/** Friends rows only (use inside `FriendsList` card). */
export function FriendsListBodySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-border/40"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="hidden h-3 w-24 shrink-0 sm:block" />
        </div>
      ))}
    </div>
  )
}

/** Full friends widget including chrome (for dashboard page skeleton). */
export function FriendsListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <WidgetChrome>
      <FriendsListBodySkeleton rows={rows} />
    </WidgetChrome>
  )
}

/** Balance body only (use inside `BalanceDisplay` card). */
export function BalanceTilesSkeleton() {
  return (
    <>
      <Skeleton className="mb-3 h-3 w-24" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-muted/35 p-3.5 shadow-sm ring-1 ring-border/40 sm:p-4">
            <Skeleton className="mb-2 h-3 w-12" />
            <Skeleton className="h-7 w-full max-w-[120px]" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    </>
  )
}

/** Full balance widget including chrome (for dashboard page skeleton). */
export function BalanceDisplaySkeleton() {
  return (
    <WidgetChrome>
      <BalanceTilesSkeleton />
    </WidgetChrome>
  )
}

/** Send payment card: heading + field blocks. */
export function SendPaymentCardSkeleton() {
  return (
    <div className="rounded-3xl border-0 bg-card p-6 shadow-sm ring-1 ring-border/60 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-2xl" />
            <Skeleton className="h-12 flex-1 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Home page while auth session is resolving. */
export function DashboardPageSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-5 py-10 sm:space-y-10 sm:px-8 sm:py-14">
      <div className="rounded-3xl border-0 bg-card p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
        <UserProfileSkeleton />
      </div>
      <div className="space-y-8 sm:space-y-10">
        <InventoryCardSkeleton />
        <div className="space-y-8 sm:space-y-10">
          <BalanceDisplaySkeleton />
          <SendPaymentCardSkeleton />
        </div>
        <FriendsListSkeleton />
      </div>
    </div>
  )
}

/** Admin item template grid. */
export function ItemTemplatesGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-6 w-[90%] max-w-[220px]" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Mint admin: collection list rows. */
export function CollectionListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Embedded business profile row while loading (wrap with `Card` in `BusinessWalletInfo`). */
export function BusinessWalletProfileSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-full max-w-xs" />
      </div>
    </div>
  )
}

/** Placeholder blocks under the business wallet title (inside existing `Card`). */
export function BusinessWalletSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}
