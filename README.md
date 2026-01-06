# HandCash App Template

A production-ready Next.js template for building HandCash-powered applications with authentication, payments, and digital collectibles.

## Quick Start

1. **Deploy to Vercel** - Click the deploy button or use this template
2. **Add Environment Variables** - Set your HandCash App ID and Secret
3. **Configure Redirect URL** - Add `<your-deployment-url>/auth/callback` to your HandCash app settings
4. **Start Building** - Customize the landing and authenticated pages for your app

## Features

- 🔐 **Enterprise-Grade Security** - CSRF protection, session management, audit logging
- 🔒 **RFC 9700 Compliant** - OAuth 2.0 best practices with state parameter validation
- 🛡️ **Session Protection** - Cross-reference tracking prevents session hijacking
- 💰 **Payment Integration** - Send payments in multiple currencies (BSV, USD, EUR, etc.)
- 🎮 **Digital Items** - View and transfer NFTs and collectibles
- 👥 **Friends List** - Access user's HandCash social connections
- 📊 **Wallet Balance** - Real-time balance display in multiple currencies
- 🎨 **Pre-built Widgets** - Ready-to-use components for common features
- 🔧 **Easy Customization** - Clear separation of template vs. custom code
- 📝 **Comprehensive Audit Logs** - Track all security events

## Environment Variables

Add these to your Vercel project:

```bash
HANDCASH_APP_ID=your_app_id_here
HANDCASH_APP_SECRET=your_app_secret_here
```

Get your credentials from the [HandCash Developer Dashboard](https://dashboard.handcash.io/).

## Security Architecture

This template implements enterprise-grade security features:

### 🔒 CSRF Protection
- OAuth 2.0 state parameter validation (RFC 9700)
- Cryptographically secure 32-byte tokens
- 10-minute token expiration
- Timing-safe comparison prevents timing attacks

### 🛡️ Session Management
- Unique session IDs for tracking
- IP address and User-Agent validation
- 30-day inactivity expiration
- Session hijacking detection
- Automatic activity refresh

### 🔐 Centralized Authentication
- React Context provides single source of truth
- Eliminates redundant API calls
- Automatic profile refresh every 5 minutes
- Unified login/logout flows

### 🚨 Audit Logging
All security events are logged with context:
- Login attempts (success/failure)
- CSRF violations
- Session hijacking attempts
- Payment transactions
- Profile access

See **[SECURITY.md](./SECURITY.md)** for complete security documentation.

## Project Structure

```
app/
├── page.tsx                    # Main page with AuthProvider integration
├── layout.tsx                  # Root layout with auth context
├── admin/                      # Admin dashboard page
│   ├── page.tsx
│   └── layout.tsx
├── api/
│   ├── auth/                   # Authentication endpoints (CSRF protected)
│   ├── admin/                  # Admin-only endpoints
│   │   ├── payment-requests/   # Payment request management
│   │   ├── items/              # Item operations (transfer, burn)
│   │   ├── item-templates/     # Item template management
│   │   ├── mint/               # Item minting
│   │   ├── collections/        # Collection management
│   │   ├── inventory/          # Business inventory
│   │   ├── payments/           # Business payments
│   │   └── balance/            # Business wallet balance
│   ├── payments/               # User payment endpoints
│   ├── inventory/              # User inventory endpoints
│   ├── friends/                # User friends list endpoint
│   ├── items/                  # User item transfer endpoints
│   └── webhooks/               # Webhook endpoints
components/
├── landing-content.tsx         # CUSTOMIZE: Landing page hero
├── authenticated-content.tsx   # CUSTOMIZE: Logged-in user content
├── admin/                      # Admin dashboard components
│   ├── admin-dashboard.tsx     # Main admin dashboard
│   ├── payment-request-management.tsx
│   ├── mint-interface.tsx
│   ├── item-templates-display.tsx
│   └── business-*.tsx          # Business wallet components
├── widgets/                    # User-facing widgets
│   ├── friends-list.tsx
│   ├── inventory-display.tsx
│   ├── payment-interface.tsx
│   ├── item-transfer-dialog.tsx
│   └── README.md               # Widget documentation
├── header-bar.tsx              # Uses useAuth hook
├── login-button.tsx            # Uses useAuth hook
└── user-profile.tsx            # Uses useAuth hook
lib/
├── handcash-service.ts         # Centralized HandCash SDK wrapper
├── auth-context.tsx            # Centralized authentication context
├── auth-middleware.ts          # Unified auth validation for routes
├── admin-middleware.ts         # Admin auth validation
├── csrf-utils.ts               # CSRF token generation and validation
├── session-utils.ts            # Session management with metadata
├── payments-storage.ts         # Payment storage (for webhooks)
├── item-templates-storage.ts   # Item template storage
└── collections-storage.ts      # Collection storage
```

**Modular Structure**: This template is organized into clear, removable chunks. See **[docs/MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md)** for a complete guide on removing features and organizing code.
└── audit-logger.ts             # Security event logging
```

## Building Your App

### 1. Customize the Landing Page

Edit `components/landing-content.tsx` to add your app's branding, hero section, and marketing content:

```tsx
export function LandingContent() {
  return (
    <div>
      {/* Replace with your app content */}
      <h1>Your App Name</h1>
      <p>Your app description</p>
    </div>
  )
}
```

### 2. Customize the Authenticated Experience

Edit `components/authenticated-content.tsx` to build your app's main interface:

```tsx
export function AuthenticatedContent() {
  return (
    <div>
      {/* Build your app here */}
      {/* Use pre-built widgets from components/widgets/ */}
    </div>
  )
}
```

### 3. Use the Centralized Auth Hook

Access authentication state anywhere in your app:

```tsx
import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>
  }
  
  return <div>Hello, {user.publicProfile.displayName}!</div>
}
```

### 4. Use Pre-Built Widgets

Import ready-made components from `components/widgets/`:

```tsx
import { FriendsList } from "@/components/widgets/friends-list"
import { InventoryDisplay } from "@/components/widgets/inventory-display"
import { PaymentInterface } from "@/components/widgets/payment-interface"
```

### 5. Create Protected API Routes

Use the auth middleware for secure endpoints:

```typescript
import { requireAuth } from "@/lib/auth-middleware"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  
  if (!authResult.success) {
    return authResult.response
  }
  
  const { privateKey, session } = authResult
  
  // Your protected logic here
  return NextResponse.json({ success: true })
}
```

## API Routes

All API routes are ready to use and include security features:

| Endpoint | Description | Security |
|----------|-------------|----------|
| `/api/auth/login` | Initiate HandCash OAuth flow | CSRF token generation |
| `/api/auth/callback` | Handle OAuth callback | CSRF validation |
| `/api/auth/profile` | Get current user profile | Session validation |
| `/api/auth/logout` | End user session | Audit logging |
| `/api/payments/balance` | Get wallet balance | Auth middleware |
| `/api/payments/send` | Send a payment | Auth + audit logging |
| `/api/friends` | Get user's friends list | Auth middleware |
| `/api/inventory` | Get user's digital items | Auth middleware |
| `/api/items/transfer` | Transfer items to another user | Auth middleware |

## HandCash Service Layer

The template includes a centralized service (`lib/handcash-service.ts`) that handles both HandCash SDKs:

- **@handcash/sdk** (v3) - Profile, balance, payments
- **@handcash/handcash-connect** - Friends, inventory, item transfers

You can use this service in your own API routes:

```typescript
import { handcashService } from "@/lib/handcash-service"

// Get user profile
const profile = await handcashService.getUserProfile(privateKey)

// Send payment
const result = await handcashService.sendPayment(privateKey, {
  destination: "$handle",
  amount: 0.10,
  currency: "USD"
})
```

## Security Best Practices

### ✅ Implemented for You

- ✅ Private keys in HTTP-only cookies (XSS protection)
- ✅ Secure cookies in production (HTTPS only)
- ✅ SameSite=lax protection (CSRF mitigation)
- ✅ OAuth state parameter validation (RFC 9700)
- ✅ Session metadata tracking (hijacking detection)
- ✅ Automatic session expiration (30 days)
- ✅ Comprehensive audit logging
- ✅ Timing-safe token comparison

### 🔧 Recommended for Production

1. **Enable audit log forwarding** to a security monitoring service
2. **Set up alerts** for CSRF violations and hijacking attempts
3. **Implement rate limiting** on authentication endpoints
4. **Regular security audits** of authentication flows
5. **Monitor audit logs** for suspicious patterns

See **[SECURITY.md](./SECURITY.md)** for detailed security documentation.

## Resources

- [Security Documentation](./SECURITY.md) - Complete security architecture guide
- [HandCash Documentation](https://docs.handcash.io/)
- [HandCash v3 SDK](https://www.npmjs.com/package/@handcash/sdk)
- [HandCash Connect SDK](https://www.npmjs.com/package/@handcash/handcash-connect)
- [Next.js Documentation](https://nextjs.org/docs)
- [RFC 9700: OAuth 2.0 Security](https://datatracker.ietf.org/doc/rfc9700/)

## Support

- Check the in-app documentation on the landing page
- Visit [HandCash Developer Docs](https://docs.handcash.io/)
- See `components/widgets/README.md` for widget usage examples
- Review [SECURITY.md](./SECURITY.md) for security features

## License

MIT
