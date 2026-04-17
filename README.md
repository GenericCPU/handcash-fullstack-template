# HandCash full-stack template

Next.js (App Router) app with HandCash Connect auth, session handling, user and admin APIs, and optional Google sign-in.

MIT licensed. HandCash docs: [docs.handcash.io](https://docs.handcash.io/). Security notes: [SECURITY.md](./SECURITY.md).

Integrations and optional stack pieces (HandCash scopes, Google sign-in, UI libraries, business wallet): [docs/PLUGINS.md](./docs/PLUGINS.md).

## Environment

| Variable | Purpose |
|----------|---------|
| `HANDCASH_APP_ID` | App ID from the [HandCash dashboard](https://dashboard.handcash.io/) |
| `HANDCASH_APP_SECRET` | App secret |
| `ADMIN_HANDLE` | Handle (no `@`) allowed to use `/admin` and admin APIs |
| `BUSINESS_AUTH_TOKEN` | Optional; business wallet for admin mint, inventory, payment requests |
| `WEBSITE_URL` | Public site URL; use for webhooks and production redirects (e.g. `https://your.app`) |

Copy [.env.example](./.env.example) to `.env.local`. Register redirect URL `{WEBSITE_URL or dev origin}/auth/callback` on your HandCash app.

## Scripts

```bash
npm install
npm run dev
npm run build
```

Package name in `package.json` is a placeholder; rename it when you fork.
