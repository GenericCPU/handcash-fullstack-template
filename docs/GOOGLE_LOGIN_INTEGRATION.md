# Google Login Integration (HandCash)

This app supports two HandCash auth flows:

1. **HandCash Connect** – User goes to HandCash to connect (existing flow).
2. **Google OAuth** – User signs in with Google; HandCash Market API links the account and redirects back.

Both flows use the same callback (`/api/auth/callback`) and cookies (`handcash_temp_private_key`, `handcash_csrf_token`), so no callback changes are required when adding Google.

## Flow (Google)

1. User clicks “Sign in with Google”.
2. Frontend calls `GET /api/auth/google`.
3. Backend generates a keypair and CSRF token, then requests an auth URL from the HandCash Market API (`HANDCASH_MARKET_URL/api/auth/google/app?appId=…&returnTo=…`).
4. Backend stores `handcash_temp_private_key` and `handcash_csrf_token` in httpOnly cookies and returns `{ authUrl }`.
5. Frontend redirects the user to `authUrl` (Google OAuth).
6. After Google sign-in, HandCash redirects to your app’s callback with the same `state` (CSRF) and session.
7. Callback validates CSRF, reads the temp private key from the cookie, validates with HandCash, then sets the permanent `private_key` and `session_metadata` cookies.

## Environment

- `HANDCASH_APP_ID` – Required for both flows.
- `HANDCASH_APP_SECRET` – Required for callback (token validation).
- `HANDCASH_MARKET_URL` – Optional. Defaults to `https://preprod-market.handcash.io`. Set for production Market API if different.

## UI

- **UserProfile** (logged out): Renders `DualLoginButtons`, which offers “Sign in with Google” and “Connect with Handcash”.
- **DualLoginButtons**: Use `<DualLoginButtons compact />` for a smaller layout; default is full width with an “or” divider.

## Security

- Same CSRF and cookie rules as the HandCash Connect flow (httpOnly, secure in production, sameSite lax).
- Rate limiting and audit logging apply to `GET /api/auth/google` the same way as `GET /api/auth/login`.

## Troubleshooting

- **502 / “Google OAuth endpoint not found”**  
  HandCash Market API may not be available or the path may have changed. Confirm `HANDCASH_MARKET_URL` and that `/api/auth/google/app` is correct for your environment.

- **CSRF failed / missing key**  
  Same as Connect flow: state/cookie mismatch or expired (e.g. user took longer than 10 minutes). User should try again.
