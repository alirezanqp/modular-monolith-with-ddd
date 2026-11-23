import { CommandBase } from '@building-blocks/application';
export class LeaveMeetingGroupCommand extends CommandBase {
  constructor(readonly meetingGroupId: string, readonly memberId: string) { super(); }
}