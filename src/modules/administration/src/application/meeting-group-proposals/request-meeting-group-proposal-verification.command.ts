import { InternalCommandBase } from '@building-blocks/application';

export class RequestMeetingGroupProposalVerificationCommand extends InternalCommandBase {
  constructor(
    id: string,
    public readonly meetingGroupProposalId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly locationCity: string,
    public readonly locationCountryCode: string,
    public readonly proposalUserId: string,
    public readonly proposalDate: Date = new Date(),
  ) {
    super(id);
  }

  static fromJson(data: Record<string, unknown>): RequestMeetingGroupProposalVerificationCommand {
    return new RequestMeetingGroupProposalVerificationCommand(
      String(data.id),
      String(data.meetingGroupProposalId),
      String(data.name),
      String(data.description ?? ''),
      String(data.locationCity),
      String(data.locationCountryCode),
      String(data.proposalUserId),
      data.proposalDate ? new Date(String(data.proposalDate)) : new Date(),
    );
  }
}
