# Registrations

Public signup lifecycle: register, confirm email, then hand off to other contexts.

Owns the `registrations` schema. Does **not** create login users itself — on confirmation it publishes `NewUserRegisteredIntegrationEvent` so User Access, Meetings, Administration, and Payments create their local identities.

Confirmation emails are persisted to `app.emails` (no SMTP).

## Language

**User registration**:
Pending or confirmed signup aggregate for a prospective member.
_Avoid_: User (that term belongs to User Access after confirmation)

**Register**:
Create a registration in waiting-for-confirmation state and enqueue a confirmation email.
_Avoid_: Sign up user, create account

**Confirm**:
Mark a registration confirmed once; raises the event other modules consume.
_Avoid_: Verify email (prefer confirm), activate user

**Waiting for confirmation**:
Status after register, before confirm.
_Avoid_: Pending verification (prefer WaitingForConfirmation)

**Confirmed**:
Terminal successful status; integration event already or about to be published.
_Avoid_: Active registration

## Status

**WaitingForConfirmation**, **Confirmed**
