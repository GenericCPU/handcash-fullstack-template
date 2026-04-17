---
name: handcash-user-inventory
description: >-
  End-user HandCash inventory in this template: fetch items, inspect metadata, transfer to
  handles/paymails, and burn items. Use when changing user inventory UI, hooks, or
  `/api/inventory` / `/api/items/*` routes.
---

# HandCash user inventory (template)

## Scope

Signed-in **user** session (OAuth + HandCash user `privateKey` from `requireAuth`). Not the business wallet admin paths.

## Key files

| Area | Path |
|------|------|
| Data hook | `hooks/use-inventory.ts` — `fetchInventory`, `burnItem`, types `InventoryItem`, `Collection` |
| UI | `components/widgets/inventory-display.tsx` — grid, expand, burn confirm |
| Transfer modal | `components/widgets/item-transfer-dialog.tsx` — destination, calls transfer API |
| Inspect modal | `components/widgets/item-inspect-dialog.tsx` — read-only attributes / media |
| List API | `app/api/inventory/route.ts` — `GET`, `handcashService.getInventory(privateKey)` |
| Burn API | `app/api/items/burn/route.ts` — `POST` JSON `{ origin }` |
| Transfer API | `app/api/items/transfer/route.ts` — `POST` body per route implementation (destinations + item) |

## UX and loading

- Inventory list uses `InventoryGridSkeleton` from `components/skeletons/app-skeletons.tsx` while `useInventory().isLoading` is true (keeps card chrome + title row; only the grid is skeleton).
- Permission errors: hook sets `error` when inventory scope is missing; UI copy points users to HandCash app permissions.

## Agent checklist

1. Prefer **origin** (or template-specific id fields the API returns) for burn/transfer; do not guess identifiers.
2. After burn or transfer success, call **`fetchInventory()`** to refresh (hook already delays briefly after burn).
3. Keep **credentials: "include"** on all user `fetch` calls to these routes.
4. When adding fields to `InventoryItem`, update the hook mapping if the API shape changes, then `inventory-display` / inspect dialog as needed.
