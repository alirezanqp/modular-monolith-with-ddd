import { InternalCommandBase } from '@building-blocks/application';
export class SetMeetingGroupExpirationDateCommand extends InternalCommandBase {
  constructor(id: string, readonly meetingGroupId: string, readonly dateTo: string) { super(id); }
  static fromJson(d: Record<string, unknown>) {
    return new SetMeetingGroupExpirationDateCommand(String(d.id), String(d.meetingGroupId), String(d.dateTo));
  }
}