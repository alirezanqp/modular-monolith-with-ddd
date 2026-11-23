import { DomainEventBase } from '@building-blocks/domain';
import { MeetingGroupProposalId } from '../meeting-group-proposal-id';

export class MeetingGroupProposalVerificationRequestedDomainEvent extends DomainEventBase {
  constructor(public readonly meetingGroupProposalId: MeetingGroupProposalId) {
    super();
  }
}
