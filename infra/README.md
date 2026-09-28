# DemoSecurity — full Docker guide

This repo runs **one production dataset at a time**. Pick a single `DB_DRIVER` per
environment: `mongodb` | `sqlite` | `postgres`. Do not point two drivers at the
same dataset.

## Services in `docker-compose.yml`

| Service  | Profile    | Port  | Volume              | When to use it |
|----------|------------|-------|---------------------|----------------|
| postgres | `postgres` | 5432  | `demosecurity_pg`   | Relational / billing / reporting deployments |
| mongodb  | `mongodb`  | 27017 | `demosecurity_mongo`| Default MERN SaaS deployments, flexible onboarding docs |
| redis    | `redis`    | 6379  | `demosecurity_redis`| Rate limits, queues, prompt-gateway throttling (optional but recommended) |
| api      | `api`      | 3000  | —                   | Run the NestJS API itself in Docker |

SQLite needs **no service** — it is a local file (`SQLITE_DATABASE_URL`).

## Common commands (run from repo root)

```powershell
# MongoDB only (default MERN path)
docker compose -f infra/docker-compose.yml --profile mongodb up -d

# PostgreSQL only
docker compose -f infra/docker-compose.yml --profile postgres up -d

# Mongo + Redis
docker compose -f infra/docker-compose.yml --profile mongodb --profile redis up -d

# Everything (dev machine)
docker compose -f infra/docker-compose.yml --profile mongodb --profile postgres --profile redis up -d

# API inside Docker (needs image build)
docker compose -f infra/docker-compose.yml --profile api up -d --build

# Stop everything
docker compose -f infra/docker-compose.yml down

# Stop + delete data volumes (destructive)
docker compose -f infra/docker-compose.yml down -v
```

## Environment wiring

1. `cp apps/api/.env.example apps/api/.env`
2. Set **exactly one** driver:
   - `DB_DRIVER=mongodb` + `MONGODB_URI=mongodb://localhost:27017/demosecurity`
   - `DB_DRIVER=postgres` + `DATABASE_URL=postgresql://demosecurity:demosecurity@localhost:5432/demosecurity`
   - `DB_DRIVER=sqlite` + `SQLITE_DATABASE_URL=file:./data/demosecurity.db`
3. Set `SESSION_SECRET` and `RISK_SIGNAL_PEPPER` to two **different** 32+ char random strings.
4. OAuth keys stay in env only — never commit them.
5. Payment webhooks: set `PAYMENT_WEBHOOK_SECRET`; the API trusts **only signed webhooks**, never `?paid=true`.

## Data safety

- Backup before `prisma migrate`.
- Prisma note: PostgreSQL and SQLite use **separate schema files**
  (`schema.postgres.prisma` / `schema.sqlite.prisma`). Generate/migrate each separately.
- MongoDB uses the Mongoose adapter; create unique index on `(provider, providerUserId)`,
  unique index on `email`, TTL index on `riskSignals.expiresAt`.
- Local desktop chat DB is separate from the server account DB. Encrypt it with an
  OS-keychain key, store it under the OS app-data dir, never in the repo.

## Health check

- Host: `GET http://localhost:3000/health`
- Docker api service has a built-in `healthcheck` on the same endpoint.
