import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { GetMeetingGroupProposalQuery } from './get-meeting-group-proposal.query';
import {
  GetMeetingGroupProposalsQuery,
  MeetingGroupProposalDto,
} from './get-meeting-group-proposals.query';

function mapRow(row: Record<string, unknown>): MeetingGroupProposalDto {
  return {
    id: String(row.id ?? row.Id),
    name: String(row.name ?? row.Name),
    description: String(row.description ?? row.Description),
    locationCity: String(row.location_city ?? row.locationCity),
    locationCountryCode: String(row.location_country_code ?? row.locationCountryCode),
    proposalUserId: String(row.proposal_user_id ?? row.proposalUserId),
    proposalDate: new Date(String(row.proposal_date ?? row.proposalDate)),
    statusCode: String(row.status_code ?? row.statusCode),
  };
}

export class GetMeetingGroupProposalsQueryHandler
  implements IQueryHandler<GetMeetingGroupProposalsQuery, MeetingGroupProposalDto[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async handle(): Promise<MeetingGroupProposalDto[]> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        `SELECT id, name, description, location_city, location_country_code,
                proposal_user_id, proposal_date, status_code
         FROM administration.meeting_group_proposals
         ORDER BY proposal_date DESC`,
      );
      return result.rows.map((row) => mapRow(row as Record<string, unknown>));
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}

export class GetMeetingGroupProposalQueryHandler
  implements IQueryHandler<GetMeetingGroupProposalQuery, MeetingGroupProposalDto | null>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}

  async handle(query: GetMeetingGroupProposalQuery): Promise<MeetingGroupProposalDto | null> {
    const client = await this.sql.getOpenConnection();
    try {
      const result = await client.query(
        `SELECT id, name, description, location_city, location_country_code,
                proposal_user_id, proposal_date, status_code
         FROM administration.meeting_group_proposals
         WHERE id = $1`,
        [query.meetingGroupProposalId],
      );
      const row = result.rows[0] as Record<string, unknown> | undefined;
      return row ? mapRow(row) : null;
    } finally {
      releaseIfNotInTransaction(client);
    }
  }
}
