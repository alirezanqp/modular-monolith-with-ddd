import { Controller, Get, Inject, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AcceptMeetingGroupProposalCommand,
  GetMeetingGroupProposalQuery,
  GetMeetingGroupProposalsQuery,
  IAdministrationModule,
} from '@modules/administration';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtPayload } from '../../auth/jwt.strategy';
import { HasPermission } from '../../auth/permissions.decorator';
import { AdministrationPermissions } from '../../auth/permissions';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ADMINISTRATION_MODULE } from '../tokens';

@ApiTags('Administration')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('api/administration/meetingGroupProposals')
export class AdministrationMeetingGroupProposalsController {
  constructor(
    @Inject(ADMINISTRATION_MODULE) private readonly administration: IAdministrationModule,
  ) {}

  @Get()
  @HasPermission(AdministrationPermissions.GetMeetingGroupProposals)
  getAll() {
    return this.administration.executeQuery(new GetMeetingGroupProposalsQuery());
  }

  @Get(':meetingGroupProposalId')
  @HasPermission(AdministrationPermissions.GetMeetingGroupProposal)
  getOne(@Param('meetingGroupProposalId') meetingGroupProposalId: string) {
    return this.administration.executeQuery(
      new GetMeetingGroupProposalQuery(meetingGroupProposalId),
    );
  }

  @Put(':meetingGroupProposalId/accept')
  @HasPermission(AdministrationPermissions.AcceptMeetingGroupProposal)
  async accept(
    @Param('meetingGroupProposalId') meetingGroupProposalId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.administration.executeCommand(
      new AcceptMeetingGroupProposalCommand(meetingGroupProposalId, user.sub),
    );
    return { status: 'accepted' };
  }
}
