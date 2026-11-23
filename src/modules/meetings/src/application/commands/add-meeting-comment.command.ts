import { CommandBaseWithResult } from '@building-blocks/application';
export class AddMeetingCommentCommand extends CommandBaseWithResult<string> {
  constructor(readonly meetingId: string, readonly authorId: string, readonly comment: string) { super(); }
}