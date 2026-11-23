import { QueryBase } from '@building-blocks/application';
export class GetAllMeetingGroupsQuery extends QueryBase<any[]> {}
export class GetMeetingGroupDetailsQuery extends QueryBase<any | null> {
  constructor(readonly meetingGroupId: string) { super(); }
}
export class GetAuthenticationMemberMeetingGroupsQuery extends QueryBase<any[]> {
  constructor(readonly memberId: string) { super(); }
}
export class GetAllMeetingGroupProposalsQuery extends QueryBase<any[]> {}
export class GetMemberMeetingGroupProposalsQuery extends QueryBase<any[]> {
  constructor(readonly memberId: string) { super(); }
}
export class GetMeetingDetailsQuery extends QueryBase<any | null> {
  constructor(readonly meetingId: string) { super(); }
}
export class GetMeetingAttendeesQuery extends QueryBase<any[]> {
  constructor(readonly meetingId: string) { super(); }
}
export class GetAuthenticatedMemberMeetingsQuery extends QueryBase<any[]> {
  constructor(readonly memberId: string) { super(); }
}
export class GetMeetingCommentsQuery extends QueryBase<any[]> {
  constructor(readonly meetingId: string) { super(); }
}
export class GetAllCountriesQuery extends QueryBase<any[]> {}
