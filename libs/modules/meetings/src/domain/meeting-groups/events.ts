import { DomainEventBase } from '@building-blocks/domain';
import { MeetingGroupId, MemberId } from '../shared/typed-ids';
import { MeetingGroupLocation } from '../shared/value-objects';

export class MeetingGroupCreatedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingGroupId: MeetingGroupId,
    public readonly creatorId: MemberId,
  ) {
    super();
  }
}

export class MeetingGroupGeneralAttributesEditedDomainEvent extends DomainEventBase {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly location: MeetingGroupLocation,
  ) {
    super();
  }
}

export class NewMeetingGroupMemberJoinedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingGroupId: MeetingGroupId,
    public readonly memberId: MemberId,
    public readonly roleCode: string,
  ) {
    super();
  }
}

export class MeetingGroupMemberLeftGroupDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingGroupId: MeetingGroupId,
    public readonly memberId: MemberId,
  ) {
    super();
  }
}

export class MeetingGroupPaymentInfoUpdatedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingGroupId: MeetingGroupId,
    public readonly paymentDateTo: Date,
  ) {
    super();
  }
}

export class MeetingAttendeeChangedDecisionDomainEvent extends DomainEventBase {
  constructor(
    public readonly memberId: MemberId,
    public readonly meetingId: string,
  ) {
    super();
  }
}
