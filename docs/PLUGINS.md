# Template integrations (“plugins”)

This document lists the major libraries, HandCash features, and optional capabilities wired into the HandCash full-stack template. Use it when you fork the app or strip pieces you do not need.

## HandCash

| Piece | Role |
|--------|------|
| **`@handcash/sdk`** | Low-level SDK; `Connect.*` helpers for profile, balances, pay, inventory, items. |
| **`@handcash/handcash-connect`** | `HandCashConnect` / `HandCashMinter` for flows that need the Connect account or minting APIs. |
| **`lib/handcash-service.ts`** | Single place that calls the SDK/Connect. Prefer adding methods here instead of importing HandCash packages in routes or UI. |
| **OAuth + session** | User signs in via HandCash; session cookie holds metadata; see `app/api/auth/` and `lib/auth-context.tsx`. |
| **Google sign-in** | Optional path through HandCash Market (`/api/auth/google`). UI: `DualLoginButtons`. |

### HandCash permissions (scopes)

The UI probes what the user granted (profile, pay, friends, inventory). Users enable these per app in HandCash. Widgets show friendly empty states when a scope is missing. See `handcashService.getPermissions` and the widgets under `components/widgets/`.

### Business wallet (`BUSINESS_AUTH_TOKEN`)

Server-only token for the **business** HandCash account. Used for admin flows (minting, collections, payment requests, inventory that acts on behalf of the business). It is **not** shown on the public homepage or header; configure it in `.env.local` for `/admin` and related APIs. Public route `GET /api/business/profile` still returns the business profile when the token is set (for your own integrations if needed).

## Auth & security

| Piece | Role |
|--------|------|
| **`jose`** | JWT / JWE handling for session tokens where applicable. |
| **HTTP-only cookies** | Session storage; see auth routes and middleware. |
| **`lib/rate-limit.ts`** | Basic rate limiting on sensitive public routes. |

## UI & UX

| Piece | Role |
|--------|------|
| **Radix UI** (`@radix-ui/*`) | Accessible primitives (dialogs, dropdowns, tabs, etc.). |
| **`lucide-react`** | Icons. |
| **`next-themes`** | Light / dark / system theme; header menu and `ThemeProvider` in layout. |
| **`sonner`** | Toast notifications. |
| **`tailwindcss` + `tailwind-merge` + `class-variance-authority`** | Styling and component variants (shadcn-style patterns under `components/ui/`). |

## Forms & validation

| Piece | Role |
|--------|------|
| **`react-hook-form`** + **`@hookform/resolvers`** + **`zod`** | Form state and schema validation where used. |

## Analytics & fonts

| Piece | Role |
|--------|------|
| **`@vercel/analytics`** | Optional Vercel Analytics when deployed on Vercel. |
| **`next/font/google`** | Geist font loading in `app/layout.tsx`. |

## Charts & media (optional in fork)

| Piece | Role |
|--------|------|
| **`recharts`** | Available for admin or analytics dashboards. |
| **`embla-carousel-react`** | Carousels if you add them. |
| **Admin `model-viewer`** | Loaded from Google CDN in `components/admin/media-preview.tsx` for 3D previews when configured. |

## Removing integrations

- **HandCash-only app:** Remove Google button path from `DualLoginButtons` and the Google auth route if you do not want Google.
- **No admin:** Remove or gate `app/admin`, admin APIs, and `ADMIN_HANDLE` / `BUSINESS_AUTH_TOKEN` usage.
- **No payments UI:** Drop `PaymentInterface` / balance routes from your pages while keeping `handcash-service` if other features need the SDK.

For HandCash product behavior and API details, use [docs.handcash.io](https://docs.handcash.io/). For security expectations of this repo, see [SECURITY.md](../SECURITY.md).
