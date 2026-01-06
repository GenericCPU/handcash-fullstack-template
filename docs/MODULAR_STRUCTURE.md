# Modular Structure Guide

This template is organized into clear, modular chunks that can be easily removed or customized.

## Hierarchy

```
Admin Features (Business/Admin Dashboard)
├── Payment Requests
├── Items (Minting, Templates, Collections)
├── Business Wallet
└── Business Payments

User Features (Authenticated User Content)
├── Inventory
├── Payments
├── Balance
└── Friends
```

## Architecture

### Widgets and Hooks Pattern

Widgets are **pure UI components** that use **custom hooks** for business logic:

- **Widgets** (`components/widgets/`) - Presentation-only, no API calls or state management
- **Hooks** (`hooks/`) - Business logic, API calls, state management
- **API Routes** (`app/api/`) - Server-side endpoints

This separation allows:
- Widgets to be easily reused and customized
- Business logic to be tested independently
- Clear separation of concerns

**Example Structure:**
```
hooks/
├── use-inventory.ts      # Inventory business logic
├── use-payments.ts       # Payment business logic
└── use-friends.ts        # Friends business logic

components/widgets/
├── inventory-display.tsx # Uses useInventory hook
├── payment-interface.tsx # Uses usePayments hook
└── friends-list.tsx      # Uses useFriends hook
```

## Directory Structure

### Admin Features

**Components**: `components/admin/`
- `payment-request-management.tsx` - Payment request creation and management
- `mint-interface.tsx` - Item minting interface
- `item-templates-display.tsx` - Item template management
- `business-inventory-display.tsx` - Business wallet inventory
- `business-payment-interface.tsx` - Business wallet payments
- `business-wallet-info.tsx` - Business wallet balance/info
- `admin-dashboard.tsx` - Main admin dashboard (imports all admin features)

**API Routes**: `app/api/admin/`
- `payment-requests/` - Payment request CRUD operations
- `items/` - Item operations (transfer, burn)
- `item-templates/` - Item template management
- `mint/` - Item minting
- `collections/` - Collection management
- `inventory/` - Business inventory
- `payments/send/` - Business payments
- `balance/` - Business wallet balance

**Pages**: `app/admin/`
- `page.tsx` - Admin dashboard page
- `layout.tsx` - Admin layout wrapper

### User Features

**Components**: `components/widgets/`
- `inventory-display.tsx` - User inventory display (uses `useInventory` hook)
- `payment-interface.tsx` - User payment sending (uses `usePayments` hook)
- `friends-list.tsx` - User friends list (uses `useFriends` hook)
- `item-transfer-dialog.tsx` - Item transfer dialog
- `item-inspect-dialog.tsx` - Item inspection dialog

**Hooks**: `hooks/`
- `use-inventory.ts` - Inventory business logic (fetch, burn, collections)
- `use-payments.ts` - Payment business logic (balance, send)
- `use-friends.ts` - Friends business logic (fetch)

**API Routes**: `app/api/`
- `inventory/` - User inventory
- `payments/` - User payments (send, balance, rate)
- `items/` - User item operations (transfer, burn)
- `friends/` - User friends list
- `collections/` - User collections (if needed)

**Pages**: `app/page.tsx` (main page)
- Uses `components/authenticated-content.tsx` which imports user widgets

## Removing Features

### Remove Admin Payment Requests

**Delete Files:**
```
components/admin/payment-request-management.tsx
app/api/admin/payment-requests/
app/api/webhooks/payment/
lib/payments-storage.ts
```

**Update:**
- `components/admin/admin-dashboard.tsx` - Remove `<PaymentRequestManagement />` import and component
- `.env` - Remove `WEBSITE_URL` (only needed for payment request webhooks)

### Remove Admin Items/Minting

**Delete Files:**
```
components/admin/mint-interface.tsx
components/admin/item-templates-display.tsx
components/admin/item-template-create-dialog.tsx
components/admin/item-template-mint-dialog.tsx
components/admin/media-preview.tsx
app/api/admin/mint/
app/api/admin/item-templates/
app/api/admin/collections/
lib/item-templates-storage.ts
lib/collections-storage.ts
```

**Update:**
- `components/admin/admin-dashboard.tsx` - Remove minting and template components
- `.env` - Remove `BUSINESS_AUTH_TOKEN` (only needed for minting)

### Remove Admin Business Wallet

**Delete Files:**
```
components/admin/business-inventory-display.tsx
components/admin/business-payment-interface.tsx
components/admin/business-wallet-info.tsx
app/api/admin/inventory/
app/api/admin/payments/send/
app/api/admin/balance/
app/api/admin/business/
```

**Update:**
- `components/admin/admin-dashboard.tsx` - Remove business wallet components
- `.env` - Remove `BUSINESS_AUTH_TOKEN`

### Remove User Inventory

**Delete Files:**
```
components/widgets/inventory-display.tsx
components/widgets/item-inspect-dialog.tsx
components/widgets/item-transfer-dialog.tsx
hooks/use-inventory.ts
app/api/inventory/
app/api/items/
```

**Update:**
- `components/authenticated-content.tsx` - Remove `<InventoryDisplay />` import and component

### Remove User Payments

**Delete Files:**
```
components/widgets/payment-interface.tsx
hooks/use-payments.ts
app/api/payments/
```

**Update:**
- `components/authenticated-content.tsx` - Remove `<PaymentInterface />` import and component

### Remove User Friends

**Delete Files:**
```
components/widgets/friends-list.tsx
hooks/use-friends.ts
app/api/friends/
```

**Update:**
- `components/authenticated-content.tsx` - Remove `<FriendsList />` import and component

## Feature Dependencies

### Admin Features

- **Payment Requests** requires:
  - `WEBSITE_URL` env variable
  - `HANDCASH_APP_ID` and `HANDCASH_APP_SECRET`
  - Webhook endpoint: `/api/webhooks/payment`

- **Items/Minting** requires:
  - `BUSINESS_AUTH_TOKEN` env variable
  - Business wallet access
  - Collections storage (file-based)

- **Business Wallet** requires:
  - `BUSINESS_AUTH_TOKEN` env variable
  - Business wallet access

### User Features

- **Inventory** requires:
  - User authentication
  - Items permissions in HandCash app

- **Payments** requires:
  - User authentication
  - Payments permissions in HandCash app

- **Friends** requires:
  - User authentication
  - Friends permissions in HandCash app

## Core Shared Infrastructure

These are shared across all features and should NOT be removed:

**Authentication:**
- `lib/auth-context.tsx`
- `lib/auth-middleware.ts`
- `lib/admin-middleware.ts`
- `app/api/auth/`
- `components/header-bar.tsx`
- `components/user-profile.tsx`

**HandCash Service:**
- `lib/handcash-service.ts` - Core HandCash SDK wrapper

**UI Components:**
- `components/ui/` - Shared UI components

**Core Pages:**
- `app/page.tsx` - Main landing page
- `app/layout.tsx` - Root layout
- `components/authenticated-content.tsx` - User content wrapper
- `components/admin/admin-dashboard.tsx` - Admin dashboard wrapper

## Adding New Features

### Adding an Admin Feature

1. Create component in `components/admin/your-feature.tsx`
2. Create API routes in `app/api/admin/your-feature/`
3. Import and add to `components/admin/admin-dashboard.tsx`
4. Document in this file

### Adding a User Feature

1. Create hook in `hooks/use-your-feature.ts` with business logic
2. Create widget in `components/widgets/your-widget.tsx` that uses the hook
3. Create API routes in `app/api/your-feature/`
4. Import and add widget to `components/authenticated-content.tsx`
5. Document in this file

## Example: Minimal Admin (Payment Requests Only)

To create a minimal admin dashboard with only payment requests:

1. Delete all admin components except `payment-request-management.tsx`
2. Delete all admin API routes except `payment-requests/` and `webhooks/payment/`
3. Update `admin-dashboard.tsx` to only import PaymentRequestManagement
4. Remove `BUSINESS_AUTH_TOKEN` from `.env`
5. Keep `WEBSITE_URL` for webhooks

## Example: Minimal User (Payments Only)

To create a minimal user experience with only payments:

1. Delete all widgets except `payment-interface.tsx`
2. Delete all user API routes except `payments/`
3. Update `authenticated-content.tsx` to only import PaymentInterface
4. Keep core auth infrastructure

