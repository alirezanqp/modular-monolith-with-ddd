# Payments

Payers, price lists, meeting fees, and subscription payments (including event-sourced subscription aggregates).

Owns the `payments` schema. Creates a **Payer** from `NewUserRegisteredIntegrationEvent`. Creates meeting fees from `MeetingAttendeeAddedIntegrationEvent`. Publishes `SubscriptionPaymentPaidIntegrationEvent` so Meetings can extend group payment validity. Projections such as subscription details are eventual-consistent read models.

## Slices

| Slice | Persistence | Owns |
|-------|-------------|------|
| **Payers / price list / meeting fees** | Tabular repositories | Identity of who pays, catalog prices, per-meeting fees |
| **Subscription payments** | Event store (`payments.streams` / `payments.messages`) | Buy, mark paid, expire subscription payments |
| **Projections** | Tables / views | `SubscriptionDetails` and fee read APIs |

## Language

**Payer**:
Payments-side identity for a registered person (not User Access **User**).
_Avoid_: Customer, client

**Price list item**:
Catalog entry for a subscription period and country (value + currency).
_Avoid_: Plan, SKU

**Subscription payment**:
Event-sourced aggregate for buying a subscription period; waiting → paid or expired.
_Avoid_: Invoice, order

**Period**:
Subscription duration code (`Month`, `HalfYear`, `Year`).
_Avoid_: Interval, plan length

**Mark as paid**:
Transition waiting subscription payment to paid and compute expiration.
_Avoid_: Capture, settle (no external PSP in this port)

**Meeting fee**:
Charge associated with adding a meeting attendee when a fee applies.
_Avoid_: Ticket, booking fee

**Subscription details**:
Read-model projection of active/paid subscription state for APIs.
_Avoid_: Live aggregate query as the public read contract

## Subscription payment status

**WaitingForPayment**, **Paid**, **Expired**
