import { IQueryHandler, ISqlConnectionFactory } from '@building-blocks/application';
import { releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import * as Q from './meetings.queries';

async function query(sql: ISqlConnectionFactory, text: string, params: unknown[] = []) {
  const client = await sql.getOpenConnection();
  try {
    return (await client.query(text, params)).rows;
  } finally {
    releaseIfNotInTransaction(client);
  }
}

export class GetAllMeetingGroupsQueryHandler
  implements IQueryHandler<Q.GetAllMeetingGroupsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle() {
    return query(this.sql, 'SELECT * FROM meetings.v_meeting_groups');
  }
}

export class GetMeetingGroupDetailsQueryHandler
  implements IQueryHandler<Q.GetMeetingGroupDetailsQuery, unknown | null>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(q: Q.GetMeetingGroupDetailsQuery) {
    const rows = await query(
      this.sql,
      'SELECT * FROM meetings.v_meeting_groups WHERE id = $1',
      [q.meetingGroupId],
    );
    return rows[0] ?? null;
  }
}

export class GetAuthenticationMemberMeetingGroupsQueryHandler
  implements IQueryHandler<Q.GetAuthenticationMemberMeetingGroupsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle(q: Q.GetAuthenticationMemberMeetingGroupsQuery) {
    return query(
      this.sql,
      'SELECT * FROM meetings.v_member_meeting_groups WHERE member_id = $1 AND is_active = true',
      [q.memberId],
    );
  }
}

export class GetAllMeetingGroupProposalsQueryHandler
  implements IQueryHandler<Q.GetAllMeetingGroupProposalsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle() {
    return query(this.sql, 'SELECT * FROM meetings.v_meeting_group_proposals');
  }
}

export class GetMemberMeetingGroupProposalsQueryHandler
  implements IQueryHandler<Q.GetMemberMeetingGroupProposalsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle(q: Q.GetMemberMeetingGroupProposalsQuery) {
    return query(
      this.sql,
      'SELECT * FROM meetings.v_meeting_group_proposals WHERE proposal_user_id = $1',
      [q.memberId],
    );
  }
}

export class GetMeetingDetailsQueryHandler
  implements IQueryHandler<Q.GetMeetingDetailsQuery, unknown | null>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(q: Q.GetMeetingDetailsQuery) {
    const rows = await query(
      this.sql,
      'SELECT * FROM meetings.v_meeting_details WHERE id = $1',
      [q.meetingId],
    );
    return rows[0] ?? null;
  }
}

export class GetMeetingAttendeesQueryHandler
  implements IQueryHandler<Q.GetMeetingAttendeesQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle(q: Q.GetMeetingAttendeesQuery) {
    return query(
      this.sql,
      'SELECT * FROM meetings.v_meeting_attendees WHERE meeting_id = $1 AND is_removed = false',
      [q.meetingId],
    );
  }
}

export class GetAuthenticatedMemberMeetingsQueryHandler
  implements IQueryHandler<Q.GetAuthenticatedMemberMeetingsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle(q: Q.GetAuthenticatedMemberMeetingsQuery) {
    return query(
      this.sql,
      'SELECT * FROM meetings.v_member_meetings WHERE attendee_id = $1 AND is_removed = false',
      [q.memberId],
    );
  }
}

export class GetMeetingCommentsQueryHandler
  implements IQueryHandler<Q.GetMeetingCommentsQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle(q: Q.GetMeetingCommentsQuery) {
    return query(
      this.sql,
      'SELECT * FROM meetings.v_meeting_comments WHERE meeting_id = $1',
      [q.meetingId],
    );
  }
}

export class GetAllCountriesQueryHandler
  implements IQueryHandler<Q.GetAllCountriesQuery, unknown[]>
{
  constructor(private readonly sql: ISqlConnectionFactory) {}
  handle() {
    return query(this.sql, 'SELECT * FROM meetings.v_countries');
  }
}
