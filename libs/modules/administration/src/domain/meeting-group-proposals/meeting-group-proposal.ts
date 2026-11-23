import { AggregateRoot } from '@building-blocks/domain';
import { MeetingGroupProposalAcceptedDomainEvent } from './events/meeting-group-proposal-accepted.domain-event';
import { MeetingGroupProposalId } from './meeting-group-proposal-id';
import { MeetingGroupProposalStatus } from './meeting-group-proposal-status';
import { MeetingGroupProposalCanBeVerifiedOnceRule } from './rules/meeting-group-proposal-can-be-verified-once.rule';

export class MeetingGroupProposal extends AggregateRoot {
  private constructor(
    readonly id: MeetingGroupProposalId,
    private readonly name: string,
    private readonly description: string,
    private readonly locationCity: string,
    private readonly locationCountryCode: string,
    private readonly proposalUserId: string,
    private readonly proposalDate: Date,
    private statusCode: string,
    private decisionDate: Date | null,
    private decisionUserId: string | null,
    private decisionCode: string | null,
    private decisionRejectReason: string | null,
  ) {
    super();
  }

  static createToVerify(
    id: MeetingGroupProposalId,
    name: string,
    description: string,
    locationCity: string,
    locationCountryCode: string,
    proposalUserId: string,
  ): MeetingGroupProposal {
    return new MeetingGroupProposal(
      id,
      name,
      description,
      locationCity,
      locationCountryCode,
      proposalUserId,
      new Date(),
      MeetingGroupProposalStatus.InVerification,
      null,
      null,
      null,
      null,
    );
  }

  static restore(p: {
    id: string;
    name: string;
    description: string;
    locationCity: string;
    locationCountryCode: string;
    proposalUserId: string;
    proposalDate: Date;
    statusCode: string;
    decisionDate: Date | null;
    decisionUserId: string | null;
    decisionCode: string | null;
    decisionRejectReason: string | null;
  }): MeetingGroupProposal {
    return new MeetingGroupProposal(
      new MeetingGroupProposalId(p.id),
      p.name,
      p.description,
      p.locationCity,
      p.locationCountryCode,
      p.proposalUserId,
      p.proposalDate,
      p.statusCode,
      p.decisionDate,
      p.decisionUserId,
      p.decisionCode,
      p.decisionRejectReason,
    );
  }

  accept(decisionUserId: string): void {
    this.checkRule(new MeetingGroupProposalCanBeVerifiedOnceRule(this.statusCode));
    this.statusCode = MeetingGroupProposalStatus.Accepted;
    this.decisionDate = new Date();
    this.decisionUserId = decisionUserId;
    this.decisionCode = 'Accept';
    this.addDomainEvent(
      new MeetingGroupProposalAcceptedDomainEvent(
        this.id.value,
        this.name,
        this.description,
        this.locationCity,
        this.locationCountryCode,
        this.proposalUserId,
      ),
    );
  }

  reject(decisionUserId: string, reason: string): void {
    this.checkRule(new MeetingGroupProposalCanBeVerifiedOnceRule(this.statusCode));
    this.statusCode = MeetingGroupProposalStatus.Rejected;
    this.decisionDate = new Date();
    this.decisionUserId = decisionUserId;
    this.decisionCode = 'Reject';
    this.decisionRejectReason = reason;
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
  getDecisionDate(): Date | null {
    return this.decisionDate;
  }
  getDecisionUserId(): string | null {
    return this.decisionUserId;
  }
  getDecisionCode(): string | null {
    return this.decisionCode;
  }
  getDecisionRejectReason(): string | null {
    return this.decisionRejectReason;
  }
}
