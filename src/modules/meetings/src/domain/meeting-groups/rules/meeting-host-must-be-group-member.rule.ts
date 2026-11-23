import { IBusinessRule } from '@building-blocks/domain';

export class MeetingHostMustBeAMeetingGroupMemberRule implements IBusinessRule {
  constructor(
    private readonly creatorId: string,
    private readonly hostIds: string[],
    private readonly memberIds: string[],
  ) {}

  isBroken(): boolean {
    const hosts = new Set([this.creatorId, ...this.hostIds]);
    for (const host of hosts) {
      if (!this.memberIds.includes(host)) {
        return true;
      }
    }
    return false;
  }

  get message(): string {
    return 'Meeting host must be a meeting group member';
  }
}
