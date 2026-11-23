import { ICommandHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { AcceptMeetingGroupProposalCommand } from './accept-meeting-group-proposal.command';
export class AcceptMeetingGroupProposalCommandHandler implements ICommandHandler<AcceptMeetingGroupProposalCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly unitOfWork: UnitOfWork) {}
  async handle(command: AcceptMeetingGroupProposalCommand): Promise<void> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(`SELECT * FROM administration.meeting_group_proposals WHERE id = $1`, [command.meetingGroupProposalId]);
      const row = result.rows[0];
      if (!row) throw new Error('Proposal not found');
      const proposal = MeetingGroupProposal.restore({
        id: row.id, name: row.name, description: row.description, locationCity: row.location_city,
        locationCountryCode: row.location_country_code, proposalUserId: row.proposal_user_id,
        proposalDate: row.proposal_date, statusCode: row.status_code, decisionDate: row.decision_date,
        decisionUserId: row.decision_user_id, decisionCode: row.decision_code, decisionRejectReason: row.decision_reject_reason,
      });
      proposal.accept(command.decisionUserId);
      await client.query(
        `UPDATE administration.meeting_group_proposals
         SET status_code=$2, decision_date=$3, decision_user_id=$4, decision_code=$5 WHERE id=$1`,
        [proposal.id.value, proposal.getStatusCode(), proposal.getDecisionDate(), proposal.getDecisionUserId(), proposal.getDecisionCode()],
      );
      this.unitOfWork.trackAggregate(proposal);
    } finally { releaseIfNotInTransaction(client); }
  }
}
