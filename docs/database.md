# Database strategy

## Choose one server source of truth

`DB_DRIVER` selects the persistence adapter for a deployment:

| Driver | Best fit | Notes |
|---|---|---|
| `mongodb` | MERN/web SaaS and flexible onboarding | Recommended default for this project; use indexes and schema validation. |
| `sqlite` | Desktop/offline/local development | Single-process local database; use WAL, file permissions and OS-keychain encryption. |
| `postgres` | Billing, reporting and relational-heavy deployments | Strong transactions and constraints; use managed PostgreSQL in production. |

The three drivers have the same domain contract: users, provider identities, onboarding, risk signals, subscriptions, usage counters, announcements and audit events. Keep controllers and authorization rules independent of the selected driver.

## Important Prisma limitation

Prisma generates a client for one SQL provider at a time. Therefore PostgreSQL and SQLite use separate schema sources (`schema.postgres.prisma` and `schema.sqlite.prisma`) and must be generated/migrated separately. MongoDB is implemented through a Mongoose adapter because it is not interchangeable with a Prisma SQL client. Do not point a generated PostgreSQL client at SQLite.

## Data ownership

- **Server DB:** canonical identity, OAuth provider links, onboarding, subscription state, plan limits, moderation actions and audit events.
- **Desktop SQLite:** local AI/coding/agent chat history, queued prompts, UI preferences and offline metadata. Never store provider secrets or trust local status for authorization.
- **Admin:** reads server data through role-protected APIs; it must not read a desktop user's filesystem.

## Migration and operations

Create a backup before migrations. Run one driver per environment, use expand/contract migrations for production, and add an export/import tool before offering database switching. For MongoDB, create unique indexes for provider IDs and email, TTL indexes for expiring risk signals, and validate document shapes at the service boundary.
