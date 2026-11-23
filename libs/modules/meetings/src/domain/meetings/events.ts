import { DomainEventBase } from '@building-blocks/domain';
import { MeetingId, MemberId } from '../shared/typed-ids';

export class MeetingCreatedDomainEvent extends DomainEventBase {
  constructor(public readonly meetingId: MeetingId) {
    super();
  }
}

export class MeetingMainAttributesChangedDomainEvent extends DomainEventBase {
  constructor(public readonly meetingId: MeetingId) {
    super();
  }
}

export class MeetingCanceledDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly cancelMemberId: MemberId,
    public readonly cancelDate: Date,
  ) {
    super();
  }
}

export class MeetingAttendeeAddedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly attendeeId: MemberId,
    public readonly decisionDate: Date,
    public readonly roleCode: string,
    public readonly guestsNumber: number,
    public readonly feeValue: number | null,
    public readonly feeCurrency: string | null,
  ) {
    super();
  }
}

export class MeetingAttendeeRemovedDomainEvent extends DomainEventBase {
  constructor(
    public readonly attendeeId: MemberId,
    public readonly meetingId: MeetingId,
    public readonly reason: string,
  ) {
    super();
  }
}

export class MeetingNotAttendeeAddedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly memberId: MemberId,
  ) {
    super();
  }
}

export class MeetingWaitlistMemberAddedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly memberId: MemberId,
  ) {
    super();
  }
}

export class MemberSignedOffFromMeetingWaitlistDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly memberId: MemberId,
  ) {
    super();
  }
}

export class NewMeetingHostSetDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly hostId: MemberId,
  ) {
    super();
  }
}

export class MemberSetAsAttendeeDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingId: MeetingId,
    public readonly memberId: MemberId,
  ) {
    super();
  }
}
