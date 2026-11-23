import { UserId } from '../users/user-id';
import { MeetingGroupProposalStatus } from './meeting-group-proposal-status';

export class MeetingGroupProposalDecision {
  readonly decisionDate: Date | null;
  readonly userId: UserId | null;
  readonly code: string | null;
  readonly rejectReason: string | null;

  private constructor(
    decisionDate: Date | null,
    userId: UserId | null,
    code: string | null,
    rejectReason: string | null,
  ) {
    this.decisionDate = decisionDate;
    this.userId = userId;
    this.code = code;
    this.rejectReason = rejectReason;
  }

  static noDecision(): MeetingGroupProposalDecision {
    return new MeetingGroupProposalDecision(null, null, null, null);
  }

  static acceptDecision(date: Date, userId: UserId): MeetingGroupProposalDecision {
    return new MeetingGroupProposalDecision(date, userId, 'Accept', null);
  }

  static rejectDecision(
    date: Date,
    userId: UserId,
    rejectReason: string,
  ): MeetingGroupProposalDecision {
    return new MeetingGroupProposalDecision(date, userId, 'Reject', rejectReason);
  }

  static reconstitute(props: {
    decisionDate: Date | null;
    userId: string | null;
    code: string | null;
    rejectReason: string | null;
  }): MeetingGroupProposalDecision {
    return new MeetingGroupProposalDecision(
      props.decisionDate,
      props.userId ? new UserId(props.userId) : null,
      props.code,
      props.rejectReason,
    );
  }

  getStatusForDecision(): MeetingGroupProposalStatus {
    if (this.code === 'Accept') {
      return MeetingGroupProposalStatus.Accepted;
    }
    if (this.code === 'Reject') {
      return MeetingGroupProposalStatus.Rejected;
    }
    return MeetingGroupProposalStatus.ToVerify;
  }

  get isMade(): boolean {
    return this.code !== null;
  }
}
