import { DomainEventBase } from '@building-blocks/domain';

export class MeetingGroupProposalAcceptedDomainEvent extends DomainEventBase {
  constructor(
    readonly meetingGroupProposalId: string,
    readonly name: string,
    readonly description: string,
    readonly locationCity: string,
    readonly locationCountryCode: string,
    readonly proposalUserId: string,
  ) {
    super();
  }
}
