import { CommandBase } from '@building-blocks/application';

export class AcceptMeetingGroupProposalCommand extends CommandBase {
  constructor(
    public readonly meetingGroupProposalId: string,
    public readonly decisionUserId: string,
  ) {
    super();
  }
}
