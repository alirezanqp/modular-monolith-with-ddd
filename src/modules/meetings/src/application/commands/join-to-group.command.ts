import { CommandBase } from '@building-blocks/application';
export class JoinToGroupCommand extends CommandBase {
  constructor(readonly meetingGroupId: string, readonly memberId: string) { super(); }
}