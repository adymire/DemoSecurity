# Integration guide

## OAuth

Register separate Google and GitHub OAuth applications per environment. Configure callback URLs in environment variables; keep client secrets only on the backend. The frontend should redirect to `/auth/google` or `/auth/github`, never call provider token APIs with a secret.

## Client contract

- `GET /health` — liveness check.
- OAuth routes — authorization-code initiation and callback (to be implemented by the chosen provider adapter).
- `POST /onboarding` — authenticated, validated onboarding update.
- `GET /admin/users` — admin role only; returns least-privilege fields and pagination.
- `POST /billing/checkout` — returns a provider checkout URL.
- `POST /billing/webhook` — provider signature required; idempotent.
- `WS /prompts` — short-lived authenticated connection; server enforces plan and account status.

Keep request/response schemas in `packages/contracts` and generate clients for other languages from OpenAPI once the endpoints stabilize.

## Desktop payments

Open the checkout URL in the default browser. After payment, the provider calls the backend webhook. Return to the desktop app through a registered deep link such as `demosecurity://billing/complete`, but require the app to refresh subscription state from the API. Do not close a browser window by script or trust a query parameter such as `?paid=true`.

## Local chats and the brain

Store chat history locally in an encrypted SQLite/database store, with keys in the OS keychain. Send only the prompt and required context over TLS. A local “brain” should be sandboxed and signed; assume users can inspect local binaries and never embed provider/admin secrets.
