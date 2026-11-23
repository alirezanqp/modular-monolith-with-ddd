import { CommandBase } from '@building-blocks/application';
export class EditMeetingGroupGeneralAttributesCommand extends CommandBase {
  constructor(readonly meetingGroupId: string, readonly name: string, readonly description: string, readonly locationCity: string, readonly locationCountryCode: string) { super(); }
}