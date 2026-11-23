# Unit of Work (AsyncLocalStorage)

## Context

Each bounded context persists aggregates and side effects in one PostgreSQL transaction without leaking `pg` clients through the domain. Nest request scope alone is not enough: command handlers, domain-event handlers, and background jobs all need the same transactional client when a command is in flight.

## Decision

Use `SqlConnectionFactory` with Node `AsyncLocalStorage` to hold the active `PoolClient`, and a per-module `UnitOfWork` that:

1. Tracks loaded/changed aggregates.
2. On `commit`, collects domain events, clears them on aggregates, and dispatches in-process domain-event handlers (same transaction store).
3. Persists enqueued **integration events** to the module schema's Outbox via `OutboxAccessor`.
4. Marks an **internal command** processed when the commit was triggered by one.

The mediator's Unit-of-Work decorator opens `withTransaction` around the handler so repositories that resolve the client from ALS participate automatically.

## Consequences

- Repositories must obtain the client from the factory / ALS, not open a separate connection for writes inside a command.
- Nested work reuses the same store when already inside a transaction.
- Integration publishing is **not** done in `commit`; only Outbox rows are written. See [outbox-inbox-internal-commands.md](./outbox-inbox-internal-commands.md).

## Code

- [`src/building-blocks/infrastructure/src/data/sql-connection.factory.ts`](../../src/building-blocks/infrastructure/src/data/sql-connection.factory.ts)
- [`src/building-blocks/infrastructure/src/data/unit-of-work.ts`](../../src/building-blocks/infrastructure/src/data/unit-of-work.ts)
- [`src/building-blocks/application/src/decorators/unit-of-work-command-handler.decorator.ts`](../../src/building-blocks/application/src/decorators/unit-of-work-command-handler.decorator.ts)
