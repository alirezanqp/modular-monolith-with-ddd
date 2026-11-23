import { CommandBase } from '@building-blocks/application';
export class CancelMeetingCommand extends CommandBase {
  constructor(readonly meetingId: string) { super(); }
}