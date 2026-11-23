# Administration

Administrative verification of meeting-group proposals and local **Member** replicas for admins' workflows.

Owns the `administration` schema. Consumes `MeetingGroupProposedIntegrationEvent` to request verification, and `NewUserRegisteredIntegrationEvent` to create members. On accept, publishes `MeetingGroupProposalAcceptedIntegrationEvent` so Meetings can create the group.

## Language

**Meeting group proposal**:
A proposed group awaiting administrative decision (to verify / accept / reject).
_Avoid_: Group request, application

**Request verification**:
Internal command that materializes a proposal in Administration after Meetings proposes it.
_Avoid_: Import proposal, sync proposal

**Accept**:
Approve a proposal once; publishes acceptance integration event with proposal details.
_Avoid_: Approve group, create group (group creation is Meetings)

**Reject**:
Deny a proposal once; requires a rejection reason.
_Avoid_: Decline without reason

**Member**:
Local person record in Administration (from new-user registration), not the Meetings membership of a group.
_Avoid_: User, attendee

**Decision**:
Accept or reject outcome recorded on the proposal.
_Avoid_: Status flip without decision language

## Proposal status

**ToVerify**, **Accepted**, **Rejected**
