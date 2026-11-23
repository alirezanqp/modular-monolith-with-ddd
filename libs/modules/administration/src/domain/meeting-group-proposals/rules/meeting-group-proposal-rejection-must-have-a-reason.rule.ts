import { IBusinessRule } from '@building-blocks/domain';

export class MeetingGroupProposalRejectionMustHaveAReasonRule implements IBusinessRule {
  constructor(private readonly rejectReason: string) {}

  isBroken(): boolean {
    return !this.rejectReason || this.rejectReason.trim().length === 0;
  }

  get message(): string {
    return 'Meeting group proposal rejection must have a reason';
  }
}
