import { CommandBase } from '@building-blocks/application';
export class AddMeetingAttendeeCommand extends CommandBase {
  constructor(readonly meetingId: string, readonly memberId: string, readonly guestsNumber: number) { super(); }
}