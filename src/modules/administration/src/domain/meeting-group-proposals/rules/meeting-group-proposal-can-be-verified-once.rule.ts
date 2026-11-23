import { IBusinessRule } from '@building-blocks/domain';
import { MeetingGroupProposalStatus } from '../meeting-group-proposal-status';

export class MeetingGroupProposalCanBeVerifiedOnceRule implements IBusinessRule {
  constructor(private readonly status: string) {}
  isBroken(): boolean {
    return this.status !== MeetingGroupProposalStatus.InVerification;
  }
  get message(): string {
    return 'Meeting group proposal can be verified only once';
  }
}
