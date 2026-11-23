export const MeetingsPermissions = {
  GetMeetingGroupProposals: 'GetMeetingGroupProposals',
  ProposeMeetingGroup: 'ProposeMeetingGroup',
  CreateNewMeeting: 'CreateNewMeeting',
  EditMeeting: 'EditMeeting',
  AddMeetingAttendee: 'AddMeetingAttendee',
  RemoveMeetingAttendee: 'RemoveMeetingAttendee',
  AddNotAttendee: 'AddNotAttendee',
  ChangeNotAttendeeDecision: 'ChangeNotAttendeeDecision',
  SignUpMemberToWaitlist: 'SignUpMemberToWaitlist',
  SignOffMemberFromWaitlist: 'SignOffMemberFromWaitlist',
  SetMeetingHostRole: 'SetMeetingHostRole',
  SetMeetingAttendeeRole: 'SetMeetingAttendeeRole',
  CancelMeeting: 'CancelMeeting',
  GetAllMeetingGroups: 'GetAllMeetingGroups',
  EditMeetingGroupGeneralAttributes: 'EditMeetingGroupGeneralAttributes',
  JoinToGroup: 'JoinToGroup',
  LeaveMeetingGroup: 'LeaveMeetingGroup',
  AddMeetingComment: 'AddMeetingComment',
  EditMeetingComment: 'EditMeetingComment',
  RemoveMeetingComment: 'RemoveMeetingComment',
  AddMeetingCommentReply: 'AddMeetingCommentReply',
  LikeMeetingComment: 'LikeMeetingComment',
  UnlikeMeetingComment: 'UnlikeMeetingComment',
  EnableMeetingCommenting: 'EnableMeetingCommenting',
  DisableMeetingCommenting: 'DisableMeetingCommenting',
  GetAuthenticatedMemberMeetingGroups: 'GetAuthenticatedMemberMeetingGroups',
  GetAuthenticationMemberMeetingGroups: 'GetAuthenticatedMemberMeetingGroups',
  GetMeetingGroupDetails: 'GetMeetingGroupDetails',
  GetMeetingDetails: 'GetMeetingDetails',
  GetAuthenticatedMemberMeetings: 'GetAuthenticatedMemberMeetings',
  GetMeetingAttendees: 'GetMeetingAttendees',
  GetMeetingComments: 'GetMeetingComments',
  GetCountries: 'GetCountries',
} as const;

export const AdministrationPermissions = {
  AcceptMeetingGroupProposal: 'AcceptMeetingGroupProposal',
  GetMeetingGroupProposal: 'GetMeetingGroupProposal',
  GetMeetingGroupProposals: 'GetMeetingGroupProposals',
} as const;

export const PaymentsPermissions = {
  RegisterPayment: 'RegisterPayment',
  BuySubscription: 'BuySubscription',
  RenewSubscription: 'RenewSubscription',
  CreatePriceListItem: 'CreatePriceListItem',
  ActivatePriceListItem: 'ActivatePriceListItem',
  DeactivatePriceListItem: 'DeactivatePriceListItem',
  ChangePriceListItemAttributes: 'ChangePriceListItemAttributes',
  GetAuthenticatedPayerSubscription: 'GetAuthenticatedPayerSubscription',
  GetPriceListItem: 'GetPriceListItem',
  GetPriceListItems: 'GetPriceListItems',
  GetMeetingFees: 'GetMeetingFees',
} as const;

export const UserAccessPermissions = {
  GetAuthenticatedUser: 'GetAuthenticatedUser',
  EmailsView: 'EmailsView',
} as const;

export type PermissionCode = string;
