# Meetings

Meeting groups, meetings, membership, attendance, waitlist, and commenting.

Owns the `meetings` schema. Proposes groups (async to Administration), creates groups after acceptance, and organizes meetings only for **paid** groups. Publishes attendee-added events when a fee applies so Payments can charge. Consumes subscription-paid events to extend group payment validity.

## Slices

| Slice | Owns |
|-------|------|
| **Proposals** | Propose a meeting group; await admin acceptance |
| **Groups** | Create group from accepted proposal; join / leave; payment expiry |
| **Meetings** | Create / cancel meeting; hosts; attendees; waitlist; RSVP |
| **Comments** | Commenting configuration; comments; replies; likes |
| **Members** | Local member + subscription projection used by group rules |

## Language

**Meeting group proposal**:
Member-initiated request to form a group (before Administration accepts).
_Avoid_: Group draft, application

**Meeting group**:
Accepted community with location, organizer, members, and optional payment validity (`paymentDateTo`).
_Avoid_: Club, team (prefer meeting group)

**Organizer**:
Group member role of the creator; distinct from meeting **Host**.
_Avoid_: Owner, admin of group

**Meeting**:
Scheduled gathering inside a paid meeting group.
_Avoid_: Event, appointment

**Host**:
Meeting attendee role allowed to host; must be an active group member.
_Avoid_: Organizer (group role)

**Attendee**:
Member participating in a meeting (possibly after leaving the waitlist).
_Avoid_: Guest, participant

**Waitlist member**:
Member waiting for capacity; can be promoted when a seat frees.
_Avoid_: Queue entry

**Not attendee**:
Explicit RSVP decline / non-attendance record.
_Avoid_: No-show (different concept if introduced later)

**Commenting configuration**:
Per-meeting (or group) switch that enables or disables comments.
_Avoid_: Comment settings

**Meeting comment**:
Comment or reply on a meeting; likes are separate.
_Avoid_: Post, message

**Member subscription**:
Meetings-side view of payment validity used to allow organizing meetings.
_Avoid_: Invoice, payment (Payments owns those)

## Shared rules (this context)

- A meeting can be organized only while the group is paid (`paymentDateTo` in the future).
- A host must be an active meeting-group member.
- Capacity, waitlist promotion, and RSVP rules live on the Meeting aggregate.
