import { DomainEventBase } from '@building-blocks/domain';
export class MeetingAttendeeAddedDomainEvent extends DomainEventBase {
  constructor(
    readonly meetingId: string,
    readonly attendeeId: string,
    readonly feeValue: number | null,
    readonly feeCurrency: string | null,
  ) { super(); }
}
