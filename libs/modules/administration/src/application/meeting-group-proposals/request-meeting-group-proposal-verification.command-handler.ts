import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { MeetingGroupProposalId } from '../../domain/meeting-group-proposals/meeting-group-proposal-id';
import { RequestMeetingGroupProposalVerificationCommand } from './request-meeting-group-proposal-verification.command';
export class RequestMeetingGroupProposalVerificationCommandHandler implements ICommandHandler<RequestMeetingGroupProposalVerificationCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly unitOfWork: UnitOfWork) {}
  async handle(command: RequestMeetingGroupProposalVerificationCommand): Promise<void> {
    const proposal = MeetingGroupProposal.createToVerify(
      new MeetingGroupProposalId(command.meetingGroupProposalId),
      command.name, command.description, command.locationCity, command.locationCountryCode, command.proposalUserId,
    );
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO administration.meeting_group_proposals
         (id, name, description, location_city, location_country_code, proposal_user_id, proposal_date, status_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [proposal.id.value, proposal.getName(), proposal.getDescription(), proposal.getLocationCity(),
         proposal.getLocationCountryCode(), proposal.getProposalUserId(), proposal.getProposalDate(), proposal.getStatusCode()],
      );
    } finally { releaseIfNotInTransaction(client); }
    this.unitOfWork.trackAggregate(proposal);
  }
}
