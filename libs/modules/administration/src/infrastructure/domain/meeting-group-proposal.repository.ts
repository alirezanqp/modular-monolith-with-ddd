import { SqlConnectionFactory, transactionStorage } from '@building-blocks/infrastructure';
import { PoolClient } from 'pg';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { MeetingGroupProposalId } from '../../domain/meeting-group-proposals/meeting-group-proposal-id';
import { IMeetingGroupProposalRepository } from '../../domain/meeting-group-proposals/meeting-group-proposal.repository';

export class MeetingGroupProposalRepository implements IMeetingGroupProposalRepository {
  constructor(private readonly sqlConnectionFactory: SqlConnectionFactory) {}

  private async client(): Promise<{ client: PoolClient; release: boolean }> {
    const tx = transactionStorage.getStore();
    if (tx) {
      return { client: tx.client, release: false };
    }
    return { client: await this.sqlConnectionFactory.getOpenConnection(), release: true };
  }

  async add(proposal: MeetingGroupProposal): Promise<void> {
    const { client, release } = await this.client();
    try {
      await client.query(
        `INSERT INTO administration.meeting_group_proposals (
           id, name, description, location_city, location_country_code,
           proposal_user_id, proposal_date, status_code,
           decision_date, decision_user_id, decision_code, decision_reject_reason
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          proposal.id.value,
          proposal.name,
          proposal.description,
          proposal.location.city,
          proposal.location.countryCode,
          proposal.proposalUserId.value,
          proposal.proposalDate,
          proposal.status.value,
          proposal.decision.decisionDate,
          proposal.decision.userId?.value ?? null,
          proposal.decision.code,
          proposal.decision.rejectReason,
        ],
      );
    } finally {
      if (release) client.release();
    }
  }

  async update(proposal: MeetingGroupProposal): Promise<void> {
    const { client, release } = await this.client();
    try {
      await client.query(
        `UPDATE administration.meeting_group_proposals SET
           status_code = $2,
           decision_date = $3,
           decision_user_id = $4,
           decision_code = $5,
           decision_reject_reason = $6
         WHERE id = $1`,
        [
          proposal.id.value,
          proposal.status.value,
          proposal.decision.decisionDate,
          proposal.decision.userId?.value ?? null,
          proposal.decision.code,
          proposal.decision.rejectReason,
        ],
      );
    } finally {
      if (release) client.release();
    }
  }

  async getById(id: MeetingGroupProposalId): Promise<MeetingGroupProposal | null> {
    const { client, release } = await this.client();
    try {
      const result = await client.query(
        `SELECT id, name, description, location_city, location_country_code,
                proposal_user_id, proposal_date, status_code,
                decision_date, decision_user_id, decision_code, decision_reject_reason
         FROM administration.meeting_group_proposals WHERE id = $1`,
        [id.value],
      );
      const row = result.rows[0];
      if (!row) return null;
      return MeetingGroupProposal.reconstitute({
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        locationCity: row.location_city,
        locationCountryCode: row.location_country_code,
        proposalUserId: row.proposal_user_id,
        proposalDate: row.proposal_date,
        statusCode: row.status_code,
        decisionDate: row.decision_date,
        decisionUserId: row.decision_user_id,
        decisionCode: row.decision_code,
        decisionRejectReason: row.decision_reject_reason,
      });
    } finally {
      if (release) client.release();
    }
  }
}
