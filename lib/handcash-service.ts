/**
 * HandCash Service – Single entry point for all HandCash operations.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * RULE: Do not import @handcash/sdk or @handcash/handcash-connect anywhere
 *       except in this file. API routes and app code must use handcashService
 *       methods only.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * USE CASES (call these; do not write HandCash code elsewhere):
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Auth & validation                                                       │
 * │   validateAuthToken(privateKey)     → boolean                           │
 * │   getPermissions(privateKey)        → { profile, pay, friends, inventory }│
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Profile                                                                  │
 * │   getUserProfile(privateKey)        → profile                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Friends                                                                  │
 * │   getFriends(privateKey)            → friends[]                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Payments                                                                │
 * │   sendPayment(privateKey, { destination, amount, currency?, description? })│
 * │   getBalance(privateKey)            → { spendableBalances, allBalances } │
 * │   getExchangeRate(currencyCode?)    → rate (no auth)                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Inventory                                                               │
 * │   getInventory(privateKey, limit?)   → items[] (grouped)                  │
 * │   getFullInventory(privateKey)      → items[] (flat, for transfer logic) │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Item transfer                                                           │
 * │   resolveHandles(privateKey, handles[]) → Record<handle, userId>          │
 * │   transferItems(privateKey, { origins, destination })  single destination│
 * │   transferItemBatch(privateKey, [{ origins, destination }, ...])        │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Item burn                                                               │
 * │   burnItem(privateKey, origin)      → void                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Item lock/unlock (advanced)                                             │
 * │   lockItems(privateKey, itemOrigins[])                                   │
 * │   unlockItems(privateKey, itemOrigins[])                                  │
 * │   getLockedItems(privateKey, limit?)                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Single-item transfer (SDK v3 shape)                                     │
 * │   transferItem(privateKey, { itemOrigin|itemOrigins, destination })       │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { getInstance, Connect } from "@handcash/sdk"
import { HandCashConnect, HandCashMinter } from "@handcash/handcash-connect"
import { resolveHandlesToUserIds } from "@/lib/items-client"

export class HandCashService {
  private appId: string
  private appSecret: string

  constructor() {
    this.appId = process.env.HANDCASH_APP_ID!
    this.appSecret = process.env.HANDCASH_APP_SECRET!

    if (!this.appId || !this.appSecret) {
      throw new Error("HandCash credentials not configured")
    }
  }

  private getSDKClient(privateKey: string) {
    const sdk = getInstance({ appId: this.appId, appSecret: this.appSecret })
    return sdk.getAccountClient(privateKey)
  }

  private getConnectAccount(privateKey: string) {
    const handCashConnect = new HandCashConnect({
      appId: this.appId,
      appSecret: this.appSecret,
    })
    return handCashConnect.getAccountFromAuthToken(privateKey)
  }

  // ─── Auth & validation ───────────────────────────────────────────────────

  async validateAuthToken(privateKey: string): Promise<boolean> {
    try {
      await this.getUserProfile(privateKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Probe which HandCash permissions the user has granted. Profile is true if the token is valid.
   * Pay, friends, and inventory are detected by calling each API; absence or error means not granted.
   */
  async getPermissions(privateKey: string): Promise<{
    profile: boolean
    pay: boolean
    friends: boolean
    inventory: boolean
  }> {
    const result = { profile: false, pay: false, friends: false, inventory: false }

    try {
      await this.getUserProfile(privateKey)
      result.profile = true
    } catch {
      return result
    }

    const [payOk, friendsOk, inventoryOk] = await Promise.all([
      this.getBalance(privateKey).then(() => true).catch(() => false),
      this.getFriends(privateKey).then((f) => Array.isArray(f)).catch(() => false),
      this.getInventory(privateKey, 1).then(() => true).catch(() => false),
    ])

    result.pay = payOk
    result.friends = friendsOk
    result.inventory = inventoryOk

    return result
  }

  // ─── Profile ───────────────────────────────────────────────────────────

  async getUserProfile(privateKey: string) {
    const client = this.getSDKClient(privateKey)
    const { data, error } = await Connect.getCurrentUserProfile({ client })
    if (error) throw new Error(error.message || "Failed to get user profile")
    return data
  }

  // ─── Friends ────────────────────────────────────────────────────────────

  async getFriends(privateKey: string) {
    const account = this.getConnectAccount(privateKey)
    const result = await account.profile.getFriends()
    if (Array.isArray(result)) return result
    return (result as { friends?: unknown[] })?.friends ?? []
  }

  // ─── Payments ───────────────────────────────────────────────────────────

  async sendPayment(
    privateKey: string,
    params: {
      destination: string
      amount: number
      currency?: string
      description?: string
    },
  ) {
    const client = this.getSDKClient(privateKey)
    const { data, error } = await Connect.pay({
      client,
      body: {
        instrumentCurrencyCode: params.currency || "BSV",
        description: params.description ?? undefined,
        receivers: [{ destination: params.destination, sendAmount: params.amount }],
      },
    })
    if (error) throw new Error(error.message || "Payment failed")
    return data
  }

  async getBalance(privateKey: string) {
    const client = this.getSDKClient(privateKey)
    const { data: spendableBalances, error: spendableError } = await Connect.getSpendableBalances({ client })
    if (spendableError) throw new Error(spendableError.message || "Failed to get spendable balance")

    const { data: allBalances, error: allBalancesError } = await Connect.getBalances({ client })
    if (allBalancesError) {
      // Non-fatal; return what we have
    }
    return { spendableBalances: spendableBalances ?? {}, allBalances: allBalances ?? {} }
  }

  async getExchangeRate(currencyCode = "USD") {
    const sdk = getInstance({ appId: this.appId, appSecret: this.appSecret })
    const { data: rate, error } = await Connect.getExchangeRate({
      client: sdk.client,
      path: { currencyCode },
    })
    if (error) throw new Error(error.message || "Failed to get exchange rate")
    return rate
  }

  // ─── Inventory ───────────────────────────────────────────────────────────

  async getInventory(privateKey: string, limit = 100) {
    const client = this.getSDKClient(privateKey)
    const { data: items, error } = await Connect.getItemsInventory({ client })
    if (error) throw new Error(error.message || "Failed to get inventory")
    return items?.items ?? []
  }

  /** Flat item list for transfer/grouping logic; same API as getInventory for now. */
  async getFullInventory(privateKey: string) {
    return this.getInventory(privateKey, 500)
  }

  // ─── Resolve handles (for transfers) ─────────────────────────────────────

  /** Resolve handles to user IDs. Returns map: lowercaseHandle -> userId. */
  async resolveHandles(privateKey: string, handles: string[]): Promise<Record<string, string>> {
    return resolveHandlesToUserIds(handles, privateKey)
  }

  // ─── Item transfer ──────────────────────────────────────────────────────

  /** Send multiple origins to a single destination. */
  async transferItems(
    privateKey: string,
    params: { origins: string[]; destination: string },
  ) {
    const account = this.getConnectAccount(privateKey)
    return account.items.transfer({
      destinationsWithOrigins: [{ origins: params.origins, destination: params.destination }],
    })
  }

  /** Send multiple (origins, destination) pairs in one go. */
  async transferItemBatch(
    privateKey: string,
    transfers: Array<{ origins: string[]; destination: string }>,
  ) {
    if (transfers.length === 0) return
    const account = this.getConnectAccount(privateKey)
    const destinationsWithOrigins = transfers.map((t) => ({
      origins: t.origins,
      destination: t.destination,
    }))
    await account.items.transfer({ destinationsWithOrigins })
  }

  /** Single transfer with SDK v3 shape (itemOrigin or itemOrigins + destination). */
  async transferItem(
    privateKey: string,
    params: { itemOrigin: string | string[]; destination: string },
  ) {
    const client = this.getSDKClient(privateKey)
    const body =
      Array.isArray(params.itemOrigin)
        ? { itemOrigins: params.itemOrigin, destination: params.destination }
        : { itemOrigin: params.itemOrigin, destination: params.destination }
    const { data, error } = await Connect.transferItem({ client, body })
    if (error) throw new Error(error.message || "Failed to transfer item")
    return data
  }

  // ─── Item burn ───────────────────────────────────────────────────────────

  async burnItem(privateKey: string, origin: string) {
    const minter = HandCashMinter.fromAppCredentials({
      appId: this.appId,
      appSecret: this.appSecret,
      authToken: privateKey,
    })
    const burnOrder = await minter.burnAndCreateItemsOrder({ burn: { origins: [origin] } })
    const orderId = (burnOrder as { itemCreationOrder?: { id?: string }; id?: string })?.itemCreationOrder?.id ?? (burnOrder as { id?: string })?.id
    if (orderId) {
      try {
        await minter.getOrderItems(orderId)
      } catch {
        // Burn may still have succeeded
      }
    }
  }

  // ─── Lock / unlock (advanced) ─────────────────────────────────────────────

  async lockItems(privateKey: string, itemOrigins: string[]) {
    const client = this.getSDKClient(privateKey)
    const { data, error } = await Connect.lockItems({ client, body: { itemOrigins } })
    if (error) throw new Error(error.message || "Failed to lock items")
    return data
  }

  async unlockItems(privateKey: string, itemOrigins: string[]) {
    const client = this.getSDKClient(privateKey)
    const { data, error } = await Connect.unlockItems({ client, body: { itemOrigins } })
    if (error) throw new Error(error.message || "Failed to unlock items")
    return data
  }

  async getLockedItems(privateKey: string, limit = 100) {
    const client = this.getSDKClient(privateKey)
    const { data, error } = await Connect.getLockedItems({
      client,
      body: { from: 0, to: limit, fetchAttributes: true },
    })
    if (error) throw new Error(error.message || "Failed to get locked items")
    return data
  }
}

export const handcashService = new HandCashService()
