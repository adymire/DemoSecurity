# DemoSecurity

Open-source, platform-agnostic security foundation for web and desktop products. DemoSecurity helps teams protect authentication, onboarding, usage limits, payments, administration, and local AI clients without locking the security layer to one frontend or deployment platform.

> **Status:** production-oriented foundation / MVP. OAuth providers, billing webhooks, device-risk signals, admin controls, and local desktop transport are defined as extension points. Never commit credentials or treat client-supplied device data as proof of identity.

## Why NestJS + TypeScript?

The backend uses **NestJS on Node.js with TypeScript**. NestJS is a better fit than an unstructured Express application for this project because it provides modules, dependency injection, guards, validation, testing conventions, and a clean path to split services later. The API is transport-agnostic: a React/MERN web app, Electron/Tauri desktop app, CLI, or another language can integrate through REST, OAuth, and WebSocket protocols.

MongoDB is a natural default for a MERN integration, but this repository keeps persistence behind interfaces so PostgreSQL or another database can be adopted. The included schema uses Prisma/PostgreSQL for strong constraints and auditability; swap the adapter if MongoDB is required.

## Repository layout

```text
apps/api/              NestJS security API
packages/contracts/    language-neutral API contracts and event names
docs/                  architecture, threat model, privacy and integration guides
infra/                 local development services
```

## Core capabilities

- Google and GitHub OAuth configuration without hard-coded secrets.
- One canonical user account with provider identities linked to it.
- Onboarding and admin-visible audit events.
- Conservative device/risk signals (hashed IP, user-agent, country) with retention controls.
- Account states: active, restricted, temporarily blocked, permanently blocked.
- Plan limits and server-side usage enforcement.
- Payment-provider webhook boundary with idempotency guidance.
- Desktop flow: local brain -> authenticated WebSocket -> backend -> LLM provider.
- Local chat storage guidance; secrets and model code must not be shipped as plaintext.
- Health endpoint, validation, rate limiting, secure headers, and structured error handling.

## Quick start

```bash
cp apps/api/.env.example apps/api/.env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API starts on `http://localhost:3000`. The health endpoint is `GET /health`.

## Required production work

1. Create Google/GitHub OAuth apps and set callback URLs from `OAUTH_*_CALLBACK_URL`.
2. Configure a managed database, Redis-backed rate limiting, HTTPS, and a real payment provider.
3. Implement provider token exchange in an isolated auth adapter; never accept an email from the client as proof.
4. Verify payment webhook signatures and make webhook handling idempotent.
5. Add a real admin identity/role system, key rotation, backups, monitoring, and incident response.
6. Obtain consent and publish a privacy/retention policy before collecting risk signals.

See [`docs/architecture.md`](docs/architecture.md), [`docs/security.md`](docs/security.md), and [`docs/integration.md`](docs/integration.md).

## Security and privacy boundaries

- A website cannot reliably read a user's Wi-Fi/router IP or hardware IP. The server can observe the network source IP, and even that may be a proxy/VPN address.
- Device fingerprinting is probabilistic, can be spoofed, and must not be used as the sole reason to deny an account. Use it as one risk signal with an appeal path.
- Do not reveal another user's email, even partially, in a popup. Show a generic “existing account detected” message.
- Never store OAuth access tokens unless a feature explicitly needs them; encrypt them and define short retention.
- Do not put API keys, payment secrets, or model secrets in a desktop client. Assume the client can be inspected.

## License

MIT. See [`LICENSE`](LICENSE).
