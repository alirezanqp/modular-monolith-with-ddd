# Modular Monolith with DDD — NestJS

NestJS + PostgreSQL port of [kgrzybek/modular-monolith-with-ddd](https://github.com/kgrzybek/modular-monolith-with-ddd).

## Architecture

- Thin NestJS API host
- Five bounded contexts: `user-access`, `registrations`, `administration`, `meetings`, `payments`
- CQRS with per-module mediator (no shared `@nestjs/cqrs` bus)
- Asynchronous module integration via in-memory events bus + Outbox / Inbox / Internal Commands
- Write model: domain aggregates + repositories
- Read model: raw SQL against PostgreSQL views
- Payments: event-sourced subscription payments on `payments.streams` / `payments.messages`

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres   # Postgres on localhost:5433
npm install
npm run migrate
npm run seed
npm run start:dev
```

API listens on `http://localhost:5000`. Swagger UI: `http://localhost:5000/swagger`.

Local Postgres is mapped to **5433** to avoid clashing with other databases on 5432.

### Authenticate (password grant)

```http
POST /connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=testMember@mail.com
&password=testMemberPass
&client_id=ro.client
&client_secret=secret
```

Seed users:

| Email | Password | Role |
| --- | --- | --- |
| testMember@mail.com | testMemberPass | Member |
| testAdmin@mail.com | testAdminPass | Administrator |

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run build` | Compile Nest API |
| `npm run start:dev` | Watch mode |
| `npm run migrate` | Apply PostgreSQL migrations |
| `npm run seed` | Seed users, permissions, countries, price list |
| `npm test` | Unit tests |
| `npm run arch:check` | Dependency-cruiser architecture rules |
| `docker compose up` | Postgres + migrator + API |

## Module layout

```
apps/api                  HTTP host, auth, controllers
libs/building-blocks/*    Domain / application / infrastructure primitives
libs/modules/*            Bounded contexts
database/migrations       PostgreSQL schemas, tables, views
```

## Notes

- Passwords are bcrypt hashes (ASP.NET Identity hashes from the original seed are not reused).
- Emails are stored in `app.emails` (no SMTP).
- Frontend React app from the original repository is out of scope.
