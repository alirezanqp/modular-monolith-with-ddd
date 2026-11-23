import { DomainEventBase } from '@building-blocks/domain';
export class MeetingGroupCreatedDomainEvent extends DomainEventBase {
  constructor(readonly meetingGroupId: string, readonly creatorId: string, readonly name: string) { super(); }
}
