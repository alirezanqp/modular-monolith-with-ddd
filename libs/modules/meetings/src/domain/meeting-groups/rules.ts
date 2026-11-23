import { IBusinessRule } from '@building-blocks/domain';
import { MemberId } from '../shared/typed-ids';
import { MeetingGroupMember } from './meeting-group-member';

export class MeetingCanBeOrganizedOnlyByPayedGroupRule implements IBusinessRule {
  constructor(private readonly paymentDateTo: Date | null) {}

  /** Allow when paymentDateTo is null OR in the future (simplified vs original). */
  isBroken(): boolean {
    if (this.paymentDateTo === null) {
      return false;
    }
    return this.paymentDateTo < new Date();
  }

  get message(): string {
    return 'Meeting can be organized only by payed group';
  }
}

export class MeetingHostMustBeAMeetingGroupMemberRule implements IBusinessRule {
  constructor(
    private readonly creatorId: MemberId,
    private readonly hostsMembersIds: MemberId[],
    private readonly members: MeetingGroupMember[],
  ) {}

  isBroken(): boolean {
    const allHostIds = this.hostsMembersIds.length
      ? this.hostsMembersIds
      : [this.creatorId];
    return allHostIds.some(
      (hostId) => !this.members.some((member) => member.isMember(hostId)),
    );
  }

  get message(): string {
    return 'Meeting host must be a meeting group member';
  }
}

export class MeetingGroupMemberCannotBeAddedTwiceRule implements IBusinessRule {
  constructor(
    private readonly members: MeetingGroupMember[],
    private readonly memberId: MemberId,
  ) {}

  isBroken(): boolean {
    return this.members.some((m) => m.isMember(this.memberId));
  }

  get message(): string {
    return 'Meeting group member cannot be added twice';
  }
}

export class NotActualGroupMemberCannotLeaveGroupRule implements IBusinessRule {
  constructor(
    private readonly members: MeetingGroupMember[],
    private readonly memberId: MemberId,
  ) {}

  isBroken(): boolean {
    return !this.members.some((m) => m.isMember(this.memberId));
  }

  get message(): string {
    return 'Not actual group member cannot leave group';
  }
}
