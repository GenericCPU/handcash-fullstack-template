# Machine payments (`@handcash/mpp`)

This template depends on **`@handcash/mpp`** ([Machine Payments Protocol](https://mpp.dev/)–style **402** challenges, HandCash Pay, receipt JWTs, webhooks) alongside **`@handcash/sdk`**.

- **Source in this monorepo:** `package.json` uses `"@handcash/mpp": "file:../../handcash/handcash-mpp"` (sibling checkout of [`handcash-mpp`](https://github.com/GenericCPU/handcash-mpp) next to `handcash-apps`).
- **Fork / standalone clone:** If you do not have that folder layout, either:
  - clone [`GenericCPU/handcash-mpp`](https://github.com/GenericCPU/handcash-mpp) next to your app and keep the `file:` path, or  
  - replace the dependency with a published version once you publish or pin from git (`npm:` / GitHub tarball per npm docs).

## Server SDK client for MPP

`@handcash/mpp` expects the **app-level** SDK `client` from `getInstance({ appId, appSecret })` (not a user account client). Use:

```ts
import { handcashService } from "@/lib/handcash-service"
// const client = handcashService.getAppLevelClient()
```

Then pass `client` into helpers such as `issuePaymentRequiredWithHostedPay`, `runMachinePaidHandler`, `verifyPaymentRequestCompletedWebhook`, etc. See the package **`README.md`** and **`examples/handcash-mpp-demo/`** in the `handcash-mpp` repo.

## Env

| Variable | Purpose |
|----------|---------|
| `HANDCASH_APP_ID` / `HANDCASH_APP_SECRET` | Required for SDK + MPP (same as rest of template). |
| `WEBSITE_URL` | Use for absolute `webhookUrl` / `redirectUrl` in payment flows. |
| `MPP_CHALLENGE_SECRET` | Recommended: long random string for `serverSecret` when issuing 402 challenges (bind receipts to resources). Not HandCash’s app secret—generate your own. |

Optional **NVIDIA NIM / API** keys (e.g. AI features in a fork) are documented in the root [README](../README.md) `.env` table as `NVIDIA_TOKEN`.

## Hygiene

Do not commit real secrets. Use `.env.local` (gitignored). For webhooks, verify payloads with **`verifyPaymentRequestCompletedWebhook`** and your HandCash app secret as described in `@handcash/mpp` **SECURITY.md**.
