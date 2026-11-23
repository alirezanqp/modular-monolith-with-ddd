# Outbox, Inbox, and Internal Commands

## Context

Bounded contexts must not call each other's application handlers or repositories. Reliable cross-module reactions still need to happen after a successful commit, without a message broker (this Nest port keeps processing in-process, like the original Quartz jobs).

## Decision

Per module schema (`users`, `registrations`, `administration`, `meetings`, `payments`):

1. **Domain event** — in-process, same transaction / UoW commit; may enqueue an **integration event**.
2. **Integration event** — written to `{schema}.outbox` in the same commit as the write model.
3. **Outbox processor** (background job ~2s) — reads unprocessed outbox rows, publishes on the shared `InMemoryEventsBus`, marks processed.
4. **Inbox** — each subscribed module stores the event once in `{schema}.inbox` (idempotency).
5. **Inbox processor** — maps event type → **internal command** payload into `{schema}.internal_commands`.
6. **Internal commands processor** — runs the command through that module's mediator / UoW.

No Redis or RabbitMQ; the bus is process-local. Durability comes from the Outbox/Inbox tables.

## Consequences

- Consumers only see integration-event contracts exported from other modules' `integration-events` packages.
- Mapping bugs (wrong fields into an internal command) surface as failed or no-op background processing, not as compile-time facade errors.
- Scaling out to multiple API processes would require a shared bus or sticky single publisher; that is out of scope for this port.

## Code

- [`src/building-blocks/infrastructure/src/outbox/`](../../src/building-blocks/infrastructure/src/outbox/)
- [`src/building-blocks/infrastructure/src/inbox/`](../../src/building-blocks/infrastructure/src/inbox/)
- [`src/building-blocks/infrastructure/src/internal-commands/`](../../src/building-blocks/infrastructure/src/internal-commands/)
- [`src/building-blocks/infrastructure/src/events-bus/`](../../src/building-blocks/infrastructure/src/events-bus/)
- [`src/building-blocks/infrastructure/src/processing/background-processor.ts`](../../src/building-blocks/infrastructure/src/processing/background-processor.ts)

See also [CONTEXT-MAP.md](../../CONTEXT-MAP.md) for which events cross which contexts.
