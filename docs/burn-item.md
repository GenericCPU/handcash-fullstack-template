---
title: Burn an Item
description: 'Permanently destroy items with HandCash Items'
---

# Burn an Item

You can permanently burn (destroy) items using the `HandCashMinter.burnAndCreateItemsOrder()` method from `@handcash/handcash-connect`.

## Usage

To burn items without creating new ones, call `burnAndCreateItemsOrder()` and omit the `issue` parameter:

```typescript
import { HandCashMinter } from "@handcash/handcash-connect"

// Create Minter instance with user's auth token
const minter = HandCashMinter.fromAppCredentials({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET,
  authToken: userAuthToken, // User's auth token
})

// Burn items by providing only the burn parameter
await minter.burnAndCreateItemsOrder({
  burn: {
    origins: ["item_origin_1", "item_origin_2"], // Array of item origins to burn
  },
})
```

## Parameters

### `burn.origins` (required)
An array of item origins (transaction outputs) to burn. Each origin should be in the format `txid_index` (e.g., `"abc123...def456_0"`).

## Example: Complete API Route

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { HandCashMinter } from "@handcash/handcash-connect"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin } = body

    if (!origin) {
      return NextResponse.json({ error: "Item origin is required" }, { status: 400 })
    }

    const minter = HandCashMinter.fromAppCredentials({
      appId: process.env.HANDCASH_APP_ID,
      appSecret: process.env.HANDCASH_APP_SECRET,
      authToken: userAuthToken,
    })

    await minter.burnAndCreateItemsOrder({
      burn: {
        origins: [origin],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to burn item", details: error.message }, { status: 500 })
  }
}
```

## Notes

- The `issue` parameter is **optional**. When omitted, the method performs a burn-only operation.
- If you provide `issue`, you can burn items and create new ones in a single transaction.
- Burning is **permanent** and cannot be undone.
- You must have ownership of the items you're burning (they must be in your wallet).

## Related Methods

- `burnAndCreateItemsOrder()` - Burn items and optionally create new ones
- `createItemsOrder()` - Create new items without burning
- `transferItems()` - Transfer items to another user



