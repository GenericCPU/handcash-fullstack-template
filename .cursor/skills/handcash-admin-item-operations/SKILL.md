---
name: handcash-admin-item-operations
description: >-
  Admin HandCash item operations in this template: business wallet inventory, transfer/burn
  from business wallet, item templates CRUD, batch mint, and collections in the mint UI.
  Use when changing `/api/admin/*` item routes or admin components under `components/admin/`.
---

# HandCash admin item operations (template)

## Prerequisites

- Admin session (`/api/admin/check`, `ADMIN_HANDLE` / configured admin users).
- **Business wallet** env + HandCash Connect where applicable; many flows return “enable business wallet” until configured.

## Business wallet inventory

| Path | Role |
|------|------|
| `components/admin/business-wallet-section.tsx` | Loads profile; composes wallet info, payment, inventory |
| `components/admin/business-inventory-display.tsx` | Same patterns as user inventory; `GET /api/admin/inventory` |
| `app/api/admin/inventory/route.ts` | Business inventory listing |
| `app/api/admin/items/transfer/route.ts` | Transfer from business wallet |
| `app/api/admin/items/burn/route.ts` | Burn via minter / burn order |

Loading: use **`InventoryGridSkeleton`** inside the existing card (see `components/skeletons/app-skeletons.tsx`).

## Item templates

| Path | Role |
|------|------|
| `components/admin/item-templates-display.tsx` | List, edit entry, delete, open mint dialog |
| `components/admin/item-template-create-dialog.tsx` | Create template |
| `components/admin/item-template-mint-dialog.tsx` | Mint template to many handles |
| `app/api/admin/item-templates/route.ts` | `GET` / `PATCH` / `DELETE` (query `id` for delete) |
| `app/api/admin/item-templates/mint/route.ts` | Batch mint |

Loading: **`ItemTemplatesGridSkeleton`** for the grid placeholder.

## Mint & collections UI

| Path | Role |
|------|------|
| `components/admin/mint-interface.tsx` | Tabs: mint item, create collection, manage collections |
| `app/api/admin/mint/route.ts` | Mint items into business inventory |
| `app/api/admin/collections/route.ts` | List collections |
| `app/api/admin/collections/manual/route.ts`, `collections/update/route.ts` | Manual / rename flows |

While `isLoadingCollections` is true on **Manage Collections**, the template shows **`CollectionListSkeleton`**.

## Agent checklist

1. Admin routes must use **admin auth** middleware / business Connect patterns already in each route—follow existing files.
2. Reuse **`BusinessWalletProfileSkeleton`** / **`BusinessWalletSectionSkeleton`** for consistent loading states in wallet UIs.
3. After mutating inventory or templates, **refetch** the relevant list (see `fetchTemplates`, `fetchInventory` in components).
4. Do not expose business private keys or tokens in client components; keep secrets server-side only.
