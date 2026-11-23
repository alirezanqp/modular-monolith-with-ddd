import { AggregateRoot } from '@building-blocks/domain';
import { MeetingGroupProposedDomainEvent } from './events/meeting-group-proposed.domain-event';
import { MeetingGroupProposalId } from './meeting-group-proposal-id';

export class MeetingGroupProposal extends AggregateRoot {
  readonly id: MeetingGroupProposalId;
  private name = '';
  private description = '';
  private locationCity = '';
  private locationCountryCode = '';
  private proposalUserId = '';
  private proposalDate = new Date();
  private statusCode = 'InVerification';

  private constructor(id: MeetingGroupProposalId) {
    super();
    this.id = id;
  }

  static propose(
    id: MeetingGroupProposalId,
    name: string,
    description: string,
    locationCity: string,
    locationCountryCode: string,
    proposalUserId: string,
  ): MeetingGroupProposal {
    const proposal = new MeetingGroupProposal(id);
    proposal.name = name;
    proposal.description = description;
    proposal.locationCity = locationCity;
    proposal.locationCountryCode = locationCountryCode;
    proposal.proposalUserId = proposalUserId;
    proposal.proposalDate = new Date();
    proposal.statusCode = 'InVerification';
    proposal.addDomainEvent(
      new MeetingGroupProposedDomainEvent(
        id.value,
        name,
        description,
        locationCity,
        locationCountryCode,
        proposalUserId,
      ),
    );
    return proposal;
  }

  getName(): string {
    return this.name;
  }
  getDescription(): string {
    return this.description;
  }
  getLocationCity(): string {
    return this.locationCity;
  }
  getLocationCountryCode(): string {
    return this.locationCountryCode;
  }
  getProposalUserId(): string {
    return this.proposalUserId;
  }
  getProposalDate(): Date {
    return this.proposalDate;
  }
  getStatusCode(): string {
    return this.statusCode;
  }
}
