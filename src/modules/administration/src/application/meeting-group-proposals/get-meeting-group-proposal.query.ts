import { QueryBase } from '@building-blocks/application';
import { MeetingGroupProposalDto } from './get-meeting-group-proposals.query';

export class GetMeetingGroupProposalQuery extends QueryBase<MeetingGroupProposalDto | null> {
  constructor(readonly meetingGroupProposalId: string) {
    super();
  }
}
