import { DomainEventBase } from '@building-blocks/domain';
import { MeetingGroupProposalId, MemberId } from '../shared/typed-ids';

export class MeetingGroupProposedDomainEvent extends DomainEventBase {
  constructor(
    public readonly meetingGroupProposalId: MeetingGroupProposalId,
    public readonly name: string,
    public readonly description: string,
    public readonly proposalUserId: MemberId,
    public readonly proposalDate: Date,
    public readonly locationCity: string,
    public readonly locationCountryCode: string,
  ) {
    super();
  }
}

export class MeetingGroupProposalAcceptedDomainEvent extends DomainEventBase {
  constructor(public readonly meetingGroupProposalId: MeetingGroupProposalId) {
    super();
  }
}
