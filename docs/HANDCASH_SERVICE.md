# HandCash Service – Single Entry Point

**Rule: Do not write HandCash code outside the service layer.**

All HandCash SDK usage belongs in:

- **`lib/handcash-service.ts`** – User-facing use cases (profile, friends, payments, inventory, transfer, burn, etc.). API routes and app code must call `handcashService` methods only.
- **`lib/items-client.ts`** – Admin/business operations (minter, connect, resolve handles for business token). Used only by admin API routes; `handcash-service` may call it for shared logic (e.g. `resolveHandles`).

**Do not** import `@handcash/sdk` or `@handcash/handcash-connect` in:

- API routes (except via `handcashService` or `items-client`)
- Components, hooks, or pages

## Use cases (handcashService)

The top of `lib/handcash-service.ts` has a full **use-case index**. Call these methods instead of writing HandCash code:

| Use case | Method |
|----------|--------|
| **Auth** | `validateAuthToken(privateKey)` |
| **Profile** | `getUserProfile(privateKey)` |
| **Friends** | `getFriends(privateKey)` |
| **Payments** | `sendPayment(privateKey, { destination, amount, currency?, description? })` |
| **Balance** | `getBalance(privateKey)` |
| **Exchange rate** | `getExchangeRate(currencyCode?)` (no auth) |
| **Inventory** | `getInventory(privateKey, limit?)`, `getFullInventory(privateKey)` |
| **Resolve handles** | `resolveHandles(privateKey, handles[])` → `Record<handle, userId>` |
| **Transfer** | `transferItems(privateKey, { origins, destination })` (single dest) |
| **Transfer batch** | `transferItemBatch(privateKey, [{ origins, destination }, ...])` |
| **Burn** | `burnItem(privateKey, origin)` |
| **Lock/unlock** | `lockItems`, `unlockItems`, `getLockedItems` |
| **Single-item transfer (v3)** | `transferItem(privateKey, { itemOrigin \| itemOrigins, destination })` |

## Adding a new HandCash feature

1. Add the use case to the index comment at the top of `lib/handcash-service.ts`.
2. Implement it in `handcash-service.ts` using `@handcash/sdk` or `@handcash/handcash-connect` only there.
3. Expose a single method (e.g. `handcashService.doThing(privateKey, params)`).
4. Use that method from your API route or app code; do not import HandCash there.

This keeps HandCash details in one place and avoids scattering SDK usage across the repo.
