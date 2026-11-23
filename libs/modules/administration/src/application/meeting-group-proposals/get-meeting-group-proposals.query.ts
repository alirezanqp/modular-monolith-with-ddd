import { QueryBase } from '@building-blocks/application';

export interface MeetingGroupProposalDto {
  id: string;
  name: string;
  description: string;
  locationCity: string;
  locationCountryCode: string;
  proposalUserId: string;
  proposalDate: Date;
  statusCode: string;
}

export class GetMeetingGroupProposalsQuery extends QueryBase<MeetingGroupProposalDto[]> {}
