import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AddMeetingAttendeeCommand,
  AddMeetingCommentCommand,
  CancelMeetingCommand,
  CreateMeetingCommand,
  EditMeetingGroupGeneralAttributesCommand,
  GetAllCountriesQuery,
  GetAllMeetingGroupProposalsQuery,
  GetAllMeetingGroupsQuery,
  GetAuthenticatedMemberMeetingsQuery,
  GetAuthenticationMemberMeetingGroupsQuery,
  GetMeetingAttendeesQuery,
  GetMeetingCommentsQuery,
  GetMeetingDetailsQuery,
  GetMeetingGroupDetailsQuery,
  GetMemberMeetingGroupProposalsQuery,
  IMeetingsModule,
  JoinToGroupCommand,
  LeaveMeetingGroupCommand,
  ProposeMeetingGroupCommand,
} from '@modules/meetings';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtPayload } from '../../auth/jwt.strategy';
import { HasPermission } from '../../auth/permissions.decorator';
import { MeetingsPermissions } from '../../auth/permissions';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { MEETINGS_MODULE } from '../tokens';

@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller()
export class MeetingsControllers {
  constructor(@Inject(MEETINGS_MODULE) private readonly meetings: IMeetingsModule) {}

  @Post('api/meetings/meetingGroupProposals')
  @HasPermission(MeetingsPermissions.ProposeMeetingGroup)
  async propose(@Body() body: Record<string, string>, @CurrentUser() user: JwtPayload) {
    const id = await this.meetings.executeCommand(
      new ProposeMeetingGroupCommand(
        body.name,
        body.description,
        body.locationCity,
        body.locationCountryCode,
        user.sub,
      ),
    );
    return { id };
  }

  @Get('api/meetings/meetingGroupProposals')
  @HasPermission(MeetingsPermissions.GetMeetingGroupProposals)
  getProposals() {
    return this.meetings.executeQuery(new GetAllMeetingGroupProposalsQuery());
  }

  @Get('api/meetings/meetingGroupProposals/my')
  @HasPermission(MeetingsPermissions.GetMeetingGroupProposals)
  getMyProposals(@CurrentUser() user: JwtPayload) {
    return this.meetings.executeQuery(new GetMemberMeetingGroupProposalsQuery(user.sub));
  }

  @Get('api/meetings/meetingGroups')
  @HasPermission(MeetingsPermissions.GetAllMeetingGroups)
  getGroups() {
    return this.meetings.executeQuery(new GetAllMeetingGroupsQuery());
  }

  @Get('api/meetings/meetingGroups/my')
  @HasPermission(MeetingsPermissions.GetAuthenticationMemberMeetingGroups)
  getMyGroups(@CurrentUser() user: JwtPayload) {
    return this.meetings.executeQuery(new GetAuthenticationMemberMeetingGroupsQuery(user.sub));
  }

  @Get('api/meetings/meetingGroups/:meetingGroupId')
  @HasPermission(MeetingsPermissions.GetAllMeetingGroups)
  getGroup(@Param('meetingGroupId') meetingGroupId: string) {
    return this.meetings.executeQuery(new GetMeetingGroupDetailsQuery(meetingGroupId));
  }

  @Put('api/meetings/meetingGroups/:meetingGroupId')
  @HasPermission(MeetingsPermissions.EditMeetingGroupGeneralAttributes)
  async editGroup(
    @Param('meetingGroupId') meetingGroupId: string,
    @Body() body: Record<string, string>,
  ) {
    await this.meetings.executeCommand(
      new EditMeetingGroupGeneralAttributesCommand(
        meetingGroupId,
        body.name,
        body.description,
        body.locationCity,
        body.locationCountryCode,
      ),
    );
    return { status: 'ok' };
  }

  @Post('api/meetings/meetingGroups/:meetingGroupId/members')
  @HasPermission(MeetingsPermissions.JoinToGroup)
  async join(@Param('meetingGroupId') meetingGroupId: string, @CurrentUser() user: JwtPayload) {
    await this.meetings.executeCommand(new JoinToGroupCommand(meetingGroupId, user.sub));
    return { status: 'ok' };
  }

  @Post('api/meetings/meetingGroups/:meetingGroupId/leave')
  @HasPermission(MeetingsPermissions.LeaveMeetingGroup)
  async leave(@Param('meetingGroupId') meetingGroupId: string, @CurrentUser() user: JwtPayload) {
    await this.meetings.executeCommand(new LeaveMeetingGroupCommand(meetingGroupId, user.sub));
    return { status: 'ok' };
  }

  @Post('api/meetings/meetingGroups/:meetingGroupId/meetings')
  @HasPermission(MeetingsPermissions.CreateNewMeeting)
  async createMeeting(
    @Param('meetingGroupId') meetingGroupId: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    const id = await this.meetings.executeCommand(
      new CreateMeetingCommand(
        meetingGroupId,
        String(body.title),
        new Date(String(body.termStartDate)),
        new Date(String(body.termEndDate)),
        String(body.description),
        String(body.locationName),
        String(body.locationAddress),
        String(body.locationPostalCode),
        String(body.locationCity),
        (body.attendeesLimit as number | null | undefined) ?? null,
        Number(body.guestsLimit ?? 0),
        body.rsvpTermStartDate ? new Date(String(body.rsvpTermStartDate)) : null,
        body.rsvpTermEndDate ? new Date(String(body.rsvpTermEndDate)) : null,
        (body.eventFeeValue as number | null | undefined) ?? null,
        (body.eventFeeCurrency as string | null | undefined) ?? null,
        (body.hostMemberIds as string[] | undefined) ?? [],
        user.sub,
      ),
    );
    return { id };
  }

  @Get('api/meetings/meetings/my')
  @HasPermission(MeetingsPermissions.GetAuthenticatedMemberMeetings)
  myMeetings(@CurrentUser() user: JwtPayload) {
    return this.meetings.executeQuery(new GetAuthenticatedMemberMeetingsQuery(user.sub));
  }

  @Get('api/meetings/meetings/:meetingId')
  @HasPermission(MeetingsPermissions.GetMeetingDetails)
  getMeeting(@Param('meetingId') meetingId: string) {
    return this.meetings.executeQuery(new GetMeetingDetailsQuery(meetingId));
  }

  @Get('api/meetings/meetings/:meetingId/attendees')
  @HasPermission(MeetingsPermissions.GetMeetingAttendees)
  getAttendees(@Param('meetingId') meetingId: string) {
    return this.meetings.executeQuery(new GetMeetingAttendeesQuery(meetingId));
  }

  @Post('api/meetings/meetings/:meetingId/attendees')
  @HasPermission(MeetingsPermissions.AddMeetingAttendee)
  async addAttendee(
    @Param('meetingId') meetingId: string,
    @Body() body: { guestsNumber?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    await this.meetings.executeCommand(
      new AddMeetingAttendeeCommand(meetingId, user.sub, body.guestsNumber ?? 0),
    );
    return { status: 'ok' };
  }

  @Put('api/meetings/meetings/:meetingId/cancel')
  @HasPermission(MeetingsPermissions.CancelMeeting)
  async cancel(@Param('meetingId') meetingId: string) {
    await this.meetings.executeCommand(new CancelMeetingCommand(meetingId));
    return { status: 'ok' };
  }

  @Get('api/meetings/meetings/:meetingId/comments')
  @HasPermission(MeetingsPermissions.GetMeetingComments)
  comments(@Param('meetingId') meetingId: string) {
    return this.meetings.executeQuery(new GetMeetingCommentsQuery(meetingId));
  }

  @Post('api/meetings/meetings/:meetingId/comments')
  @HasPermission(MeetingsPermissions.AddMeetingComment)
  async addComment(
    @Param('meetingId') meetingId: string,
    @Body() body: { comment: string },
    @CurrentUser() user: JwtPayload,
  ) {
    const id = await this.meetings.executeCommand(
      new AddMeetingCommentCommand(meetingId, user.sub, body.comment),
    );
    return { id };
  }

  @Get('api/meetings/countries')
  @HasPermission(MeetingsPermissions.GetCountries)
  countries() {
    return this.meetings.executeQuery(new GetAllCountriesQuery());
  }
}
