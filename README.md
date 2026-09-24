# DemoSecurity

Open-source, platform-agnostic security and account-protection foundation for web and desktop products. It is designed for the CyberFallen-style flow: real Google/GitHub authentication, one canonical user account, onboarding persistence, admin visibility, plan enforcement, payment webhooks, anti-abuse signals, and a secure desktop-to-backend prompt gateway.

> **Status:** extensible MVP foundation. Provider adapters, billing adapters, risk scoring, admin APIs, and desktop clients must be completed and reviewed before production launch.

## Stack decision

- **NestJS + TypeScript:** modular REST/WebSocket backend, guards, validation, dependency injection, testing, and a clean path to microservices.
- **MongoDB:** recommended for MERN teams and flexible onboarding/audit documents.
- **SQLite:** recommended for local desktop mode, offline-first development, and encrypted local chat metadata.
- **PostgreSQL:** supported for teams that need relational constraints, reporting, and strong transactional billing/admin data.

The API uses a **storage adapter boundary**. Set `DB_DRIVER=mongodb`, `DB_DRIVER=sqlite`, or `DB_DRIVER=postgres` per deployment. Do not run one production dataset against multiple drivers at the same time; choose one source of truth and migrate deliberately. Local desktop chat data is separate from the server account database.

## Repository layout

```text
apps/api/              NestJS security API and storage boundary
apps/api/prisma/       PostgreSQL and SQLite schema/migration sources
apps/api/src/database/ Runtime database configuration and contracts
packages/contracts/    Language-neutral API/event contracts
docs/                  Architecture, security, privacy, database and integration guides
infra/                 PostgreSQL, MongoDB and local development services
```

## Capabilities mapped to the product request

- Real Google and GitHub OAuth extension points; secrets stay in environment variables.
- Provider identities link to one canonical account; email-only auto-linking is disabled by design.
- Onboarding, subscriptions, usage counters, risk signals and audit events persist server-side.
- Admin-ready data model for users, onboarding, payments, announcements and account actions.
- Account states: `ACTIVE`, `RESTRICTED`, `TEMPORARY_BLOCK`, `PERMANENT_BLOCK`.
- Server-side plan limits and usage enforcement; clients cannot unlock paid features.
- Hosted checkout in the default browser, signed webhook confirmation, and desktop deep-link return.
- Desktop local chat storage guidance with OS keychain encryption; local clients are untrusted.
- Prompt path: Desktop app -> local brain -> authenticated WebSocket -> API -> LLM worker.
- Risk signals are hashed, expiring and privacy-controlled. Device similarity is never the only block reason.

## Quick start

```bash
cp apps/api/.env.example apps/api/.env
npm install
# Select one: mongodb, sqlite, or postgres
npm run db:generate
npm run db:migrate
npm run dev
```

The API starts on `http://localhost:3000`; health check: `GET /health`.

### Database selection

```dotenv
DB_DRIVER=mongodb   # mongodb | sqlite | postgres
```

- MongoDB: `MONGODB_URI=mongodb://localhost:27017/demosecurity`
- SQLite: `SQLITE_DATABASE_URL=file:./data/demosecurity.db`
- PostgreSQL: `DATABASE_URL=postgresql://demosecurity:demosecurity@localhost:5432/demosecurity`

Use `infra/docker-compose.yml` for MongoDB and PostgreSQL. SQLite needs no service. For a desktop build, use an application-data directory, not the repository directory, and encrypt sensitive local data with an OS keychain-managed key.

## Production checklist

1. Implement OAuth authorization-code + state/nonce/PKCE validation and exact callback allowlists.
2. Add session/JWT rotation, CSRF protection for cookies, admin RBAC, pagination, and audit logging.
3. Add Redis rate limits/queues and a risk service; never rely on browser-provided “device IP” or fingerprint as proof.
4. Verify payment webhook signatures, deduplicate events, reconcile subscriptions, and update plan limits transactionally.
5. Add privacy notice, consent, retention/deletion controls, appeals, monitoring, backups, key rotation and incident response.
6. Sign desktop installers for Windows/macOS/Linux. Never ship provider, payment, admin, or LLM secrets in the client.

See [`docs/database.md`](docs/database.md), [`docs/architecture.md`](docs/architecture.md), [`docs/security.md`](docs/security.md), and [`docs/integration.md`](docs/integration.md).

## License

MIT. See [`LICENSE`](LICENSE).
