# User Access

Identity, authentication, roles, and permissions for the MyMeetings modular monolith.

Owns the `users` schema. Creates a **User** after Registrations confirms a signup (via `NewUserRegisteredIntegrationEvent` → `CreateUser` internal command). Exposes authenticate/query APIs through its module facade; the API host issues JWT from `Authenticate`.

## Language

**User**:
Authenticated account created from a confirmed registration (or seeded admin).
_Avoid_: Account, principal, client

**Login**:
Unique credential identifier used with password to authenticate.
_Avoid_: Username (prefer login in this context)

**Permission**:
Named authorization code checked on HTTP controllers (`HasPermission`).
_Avoid_: Role as the gate for API actions

**Role**:
Grouping of permissions assigned to a user (e.g. Member, Administrator). Used for assignment, not for controller checks.
_Avoid_: Claim set

**Authenticate**:
Password-grant style verification that returns identity claims for token issuance (`POST /connect/token`).
_Avoid_: Login endpoint, sign-in service

**Authenticated user**:
Current caller resolved from JWT for profile and permission queries.
_Avoid_: Session user, principal
