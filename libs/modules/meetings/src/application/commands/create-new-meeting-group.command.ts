import { InternalCommandBase } from '@building-blocks/application';
export class CreateNewMeetingGroupCommand extends InternalCommandBase {
  constructor(id: string, readonly meetingGroupProposalId: string, readonly name: string, readonly description: string, readonly locationCity: string, readonly locationCountryCode: string, readonly proposalUserId: string) { super(id); }
  static fromJson(d: Record<string, unknown>) {
    return new CreateNewMeetingGroupCommand(String(d.id), String(d.meetingGroupProposalId), String(d.name), String(d.description), String(d.locationCity), String(d.locationCountryCode), String(d.proposalUserId));
  }
}