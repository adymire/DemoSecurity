# Architecture

```text
Web / Electron / Tauri / CLI
        | HTTPS + OAuth + WebSocket (short-lived access token)
        v
NestJS API -> Auth adapter -> User/Identity/Onboarding repository
        |                 -> Risk service (hashed, expiring signals)
        |                 -> Plan/usage service
        |                 -> Payment webhook adapter
        v
PostgreSQL (source of truth) + Redis (rate limits, optional queues)
        |
        +--> LLM adapter / worker services
```

## Request lifecycle

1. The client starts an OAuth authorization-code flow. The backend exchanges the code with Google/GitHub and validates the provider response.
2. The backend finds the provider identity, or creates/links one to the canonical user. Email alone must never auto-link accounts without a verified provider and explicit linking policy.
3. On first login, onboarding data is validated and persisted. Admin views read users, onboarding state, subscriptions, and audit events through a role-protected API.
4. Prompt requests authenticate with a short-lived token. The backend checks account status, plan limits, rate limits, and audit requirements before dispatching to an LLM worker.
5. Payment providers redirect to their hosted checkout. The backend trusts only a signed webhook to update subscriptions and usage restrictions. The desktop app polls or receives a signed deep-link event; it must not decide payment success itself.

Microservices should be introduced only after measurable load boundaries exist. Suggested later services: `identity`, `risk`, `billing`, `prompt-gateway`, and `admin`. Keep contracts in `packages/contracts` and use a queue for long-running prompt loops.
