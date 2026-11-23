import { ICommandHandler, ICommandHandlerWithResult, ISqlConnectionFactory } from '@building-blocks/application';
import { UnitOfWork, releaseIfNotInTransaction } from '@building-blocks/infrastructure';
import { MeetingGroupProposal } from '../../domain/meeting-group-proposals/meeting-group-proposal';
import { MeetingGroupProposalId } from '../../domain/meeting-group-proposals/meeting-group-proposal-id';
import { MeetingGroup } from '../../domain/meeting-groups/meeting-group';
import { MeetingGroupId } from '../../domain/meeting-groups/meeting-group-id';
import { MeetingGroupLocation } from '../../domain/shared/meeting-group-location';
import { MoneyValue } from '../../domain/shared/money-value';
import { Meeting } from '../../domain/meetings/meeting';
import { MeetingId } from '../../domain/meetings/meeting-id';
import { MeetingComment } from '../../domain/meeting-comments/meeting-comment';
import { ProposeMeetingGroupCommand } from '../commands/propose-meeting-group.command';
import { CreateNewMeetingGroupCommand } from '../commands/create-new-meeting-group.command';
import { JoinToGroupCommand } from '../commands/join-to-group.command';
import { LeaveMeetingGroupCommand } from '../commands/leave-meeting-group.command';
import { EditMeetingGroupGeneralAttributesCommand } from '../commands/edit-meeting-group-general-attributes.command';
import { SetMeetingGroupExpirationDateCommand } from '../commands/set-meeting-group-expiration-date.command';
import { CreateMeetingCommand } from '../commands/create-meeting.command';
import { AddMeetingAttendeeCommand } from '../commands/add-meeting-attendee.command';
import { CancelMeetingCommand } from '../commands/cancel-meeting.command';
import { CreateMemberCommand } from '../commands/create-member.command';
import { AddMeetingCommentCommand } from '../commands/add-meeting-comment.command';

async function loadGroup(sql: ISqlConnectionFactory, id: string): Promise<MeetingGroup> {
  const client = await sql.getOpenConnection();
  try {
    const g = (await client.query('SELECT * FROM meetings.meeting_groups WHERE id=$1', [id])).rows[0];
    if (!g) throw new Error('Meeting group not found');
    const members = (await client.query('SELECT * FROM meetings.meeting_group_members WHERE meeting_group_id=$1', [id])).rows.map((m: any) => ({
      memberId: m.member_id, joinedDate: m.joined_date, roleCode: m.role_code, isActive: m.is_active, leaveDate: m.leave_date,
    }));
    return MeetingGroup.restore({
      id: g.id, name: g.name, description: g.description, locationCity: g.location_city,
      locationCountryCode: g.location_country_code, creatorId: g.creator_id, createDate: g.create_date,
      paymentDateTo: g.payment_date_to, members,
    });
  } finally { releaseIfNotInTransaction(client); }
}

async function saveGroup(sql: ISqlConnectionFactory, group: MeetingGroup) {
  const client = await sql.getOpenConnection();
  try {
    await client.query(
      `INSERT INTO meetings.meeting_groups (id, name, description, location_city, location_country_code, creator_id, create_date, payment_date_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET name=$2, description=$3, location_city=$4, location_country_code=$5, payment_date_to=$8`,
      [group.id.value, group.getName(), group.getDescription(), group.getLocation().city, group.getLocation().countryCode, group.getCreatorId(), group.getCreateDate(), group.getPaymentDateTo()],
    );
    await client.query('DELETE FROM meetings.meeting_group_members WHERE meeting_group_id=$1', [group.id.value]);
    for (const m of group.getMembers()) {
      await client.query(
        `INSERT INTO meetings.meeting_group_members (meeting_group_id, member_id, joined_date, role_code, is_active, leave_date)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [group.id.value, m.memberId, m.joinedDate, m.roleCode, m.isActive, m.leaveDate],
      );
    }
  } finally { releaseIfNotInTransaction(client); }
}

async function loadMeeting(sql: ISqlConnectionFactory, id: string): Promise<Meeting> {
  const client = await sql.getOpenConnection();
  try {
    const m = (await client.query('SELECT * FROM meetings.meetings WHERE id=$1', [id])).rows[0];
    if (!m) throw new Error('Meeting not found');
    const attendees = (await client.query('SELECT * FROM meetings.meeting_attendees WHERE meeting_id=$1', [id])).rows.map((a: any) => ({
      attendeeId: a.attendee_id, decisionDate: a.decision_date, roleCode: a.role_code, guestsNumber: a.guests_number,
      isRemoved: a.is_removed, removedDate: a.removed_date, isFeePaid: a.is_fee_paid,
    }));
    const waitlist = (await client.query('SELECT * FROM meetings.meeting_waitlist_members WHERE meeting_id=$1', [id])).rows.map((w: any) => ({
      memberId: w.member_id, signUpDate: w.sign_up_date, isSignedOff: w.is_signed_off,
    }));
    const notAttendees = (await client.query('SELECT * FROM meetings.meeting_not_attendees WHERE meeting_id=$1', [id])).rows.map((n: any) => ({
      memberId: n.member_id, decisionDate: n.decision_date,
    }));
    return Meeting.restore({
      id: m.id, meetingGroupId: m.meeting_group_id, title: m.title, termStartDate: m.term_start_date, termEndDate: m.term_end_date,
      description: m.description, locationName: m.location_name, locationAddress: m.location_address,
      locationPostalCode: m.location_postal_code, locationCity: m.location_city, attendeesLimit: m.attendees_limit,
      guestsLimit: m.guests_limit, rsvpTermStartDate: m.rsvp_term_start_date, rsvpTermEndDate: m.rsvp_term_end_date,
      eventFeeValue: m.event_fee_value != null ? Number(m.event_fee_value) : null, eventFeeCurrency: m.event_fee_currency,
      creatorId: m.creator_id, createDate: m.create_date, attendees, waitlist, notAttendees,
      isCanceled: m.is_canceled, cancelDate: m.cancel_date,
    });
  } finally { releaseIfNotInTransaction(client); }
}

async function saveMeeting(sql: ISqlConnectionFactory, meeting: Meeting) {
  const client = await sql.getOpenConnection();
  try {
    await client.query(
      `INSERT INTO meetings.meetings
       (id, meeting_group_id, title, term_start_date, term_end_date, description, location_name, location_address,
        location_postal_code, location_city, attendees_limit, guests_limit, rsvp_term_start_date, rsvp_term_end_date,
        event_fee_value, event_fee_currency, creator_id, create_date, cancel_date, is_canceled)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       ON CONFLICT (id) DO UPDATE SET title=$3, description=$6, term_start_date=$4, term_end_date=$5, cancel_date=$19, is_canceled=$20`,
      [meeting.id.value, meeting.getMeetingGroupId(), meeting.getTitle(), meeting.getTermStartDate(), meeting.getTermEndDate(),
       meeting.getDescription(), meeting.getLocationName(), meeting.getLocationAddress(), meeting.getLocationPostalCode(),
       meeting.getLocationCity(), meeting.getAttendeesLimit(), meeting.getGuestsLimit(), meeting.getRsvpTermStartDate(),
       meeting.getRsvpTermEndDate(), meeting.getEventFeeValue(), meeting.getEventFeeCurrency(), meeting.getCreatorId(),
       meeting.getCreateDate(), meeting.getCancelDate(), meeting.getIsCanceled()],
    );
    await client.query(
      `INSERT INTO meetings.meeting_commenting_configurations (id, meeting_id, enabled)
       VALUES ($1, $2, true)
       ON CONFLICT (meeting_id) DO NOTHING`,
      [meeting.id.value, meeting.id.value],
    );
    await client.query('DELETE FROM meetings.meeting_attendees WHERE meeting_id=$1', [meeting.id.value]);
    for (const a of meeting.getAttendees()) {
      await client.query(
        `INSERT INTO meetings.meeting_attendees
         (meeting_id, attendee_id, decision_date, role_code, guests_number, is_removed, removed_date, is_fee_paid)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [meeting.id.value, a.attendeeId, a.decisionDate, a.roleCode, a.guestsNumber, a.isRemoved, a.removedDate, a.isFeePaid],
      );
    }
  } finally { releaseIfNotInTransaction(client); }
}

export class ProposeMeetingGroupCommandHandler implements ICommandHandlerWithResult<ProposeMeetingGroupCommand, string> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: ProposeMeetingGroupCommand) {
    const id = new MeetingGroupProposalId();
    const proposal = MeetingGroupProposal.propose(id, command.name, command.description, command.locationCity, command.locationCountryCode, command.proposalUserId);
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO meetings.meeting_group_proposals (id, name, description, location_city, location_country_code, proposal_user_id, proposal_date, status_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [proposal.id.value, proposal.getName(), proposal.getDescription(), proposal.getLocationCity(), proposal.getLocationCountryCode(), proposal.getProposalUserId(), proposal.getProposalDate(), proposal.getStatusCode()],
      );
    } finally { releaseIfNotInTransaction(client); }
    this.uow.trackAggregate(proposal);
    return proposal.id.value;
  }
}

export class CreateNewMeetingGroupCommandHandler implements ICommandHandler<CreateNewMeetingGroupCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: CreateNewMeetingGroupCommand) {
    const group = MeetingGroup.createBasedOnProposal(
      command.meetingGroupProposalId, command.name, command.description,
      MeetingGroupLocation.create(command.locationCity, command.locationCountryCode), command.proposalUserId,
    );
    await saveGroup(this.sql, group);
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(`UPDATE meetings.meeting_group_proposals SET status_code='Accepted' WHERE id=$1`, [command.meetingGroupProposalId]);
    } finally { releaseIfNotInTransaction(client); }
    this.uow.trackAggregate(group);
  }
}

export class JoinToGroupCommandHandler implements ICommandHandler<JoinToGroupCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: JoinToGroupCommand) {
    const group = await loadGroup(this.sql, command.meetingGroupId);
    group.joinToGroup(command.memberId);
    await saveGroup(this.sql, group);
    this.uow.trackAggregate(group);
  }
}

export class LeaveMeetingGroupCommandHandler implements ICommandHandler<LeaveMeetingGroupCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: LeaveMeetingGroupCommand) {
    const group = await loadGroup(this.sql, command.meetingGroupId);
    group.leaveGroup(command.memberId);
    await saveGroup(this.sql, group);
    this.uow.trackAggregate(group);
  }
}

export class EditMeetingGroupGeneralAttributesCommandHandler implements ICommandHandler<EditMeetingGroupGeneralAttributesCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: EditMeetingGroupGeneralAttributesCommand) {
    const group = await loadGroup(this.sql, command.meetingGroupId);
    group.editGeneralAttributes(command.name, command.description, MeetingGroupLocation.create(command.locationCity, command.locationCountryCode));
    await saveGroup(this.sql, group);
    this.uow.trackAggregate(group);
  }
}

export class SetMeetingGroupExpirationDateCommandHandler implements ICommandHandler<SetMeetingGroupExpirationDateCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: SetMeetingGroupExpirationDateCommand) {
    const group = await loadGroup(this.sql, command.meetingGroupId);
    group.setExpirationDate(new Date(command.dateTo));
    await saveGroup(this.sql, group);
    this.uow.trackAggregate(group);
  }
}

export class CreateMeetingCommandHandler implements ICommandHandlerWithResult<CreateMeetingCommand, string> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: CreateMeetingCommand) {
    const group = await loadGroup(this.sql, command.meetingGroupId);
    const fee = command.eventFeeValue != null ? MoneyValue.of(command.eventFeeValue, command.eventFeeCurrency ?? 'USD') : null;
    const meeting = group.createMeeting({
      title: command.title, termStart: command.termStartDate, termEnd: command.termEndDate, description: command.description,
      locationName: command.locationName, locationAddress: command.locationAddress, locationPostalCode: command.locationPostalCode,
      locationCity: command.locationCity, attendeesLimit: command.attendeesLimit, guestsLimit: command.guestsLimit,
      rsvpStart: command.rsvpTermStartDate, rsvpEnd: command.rsvpTermEndDate, eventFee: fee,
      hostMemberIds: command.hostMemberIds, creatorId: command.creatorId,
    });
    await saveMeeting(this.sql, meeting);
    this.uow.trackAggregate(meeting);
    return meeting.id.value;
  }
}

export class AddMeetingAttendeeCommandHandler implements ICommandHandler<AddMeetingAttendeeCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: AddMeetingAttendeeCommand) {
    const meeting = await loadMeeting(this.sql, command.meetingId);
    meeting.addAttendee(command.memberId, command.guestsNumber);
    await saveMeeting(this.sql, meeting);
    this.uow.trackAggregate(meeting);
  }
}

export class CancelMeetingCommandHandler implements ICommandHandler<CancelMeetingCommand> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: CancelMeetingCommand) {
    const meeting = await loadMeeting(this.sql, command.meetingId);
    meeting.cancel();
    await saveMeeting(this.sql, meeting);
    this.uow.trackAggregate(meeting);
  }
}

export class CreateMemberCommandHandler implements ICommandHandler<CreateMemberCommand> {
  constructor(private readonly sql: ISqlConnectionFactory) {}
  async handle(command: CreateMemberCommand) {
    const client = await this.sql.getOpenConnection();
    try {
      await client.query(
        `INSERT INTO meetings.members (id, login, email, first_name, last_name, name) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [command.memberId, command.login, command.email, command.firstName, command.lastName, `${command.firstName} ${command.lastName}`],
      );
    } finally { releaseIfNotInTransaction(client); }
  }
}

export class AddMeetingCommentCommandHandler implements ICommandHandlerWithResult<AddMeetingCommentCommand, string> {
  constructor(private readonly sql: ISqlConnectionFactory, private readonly uow: UnitOfWork) {}
  async handle(command: AddMeetingCommentCommand) {
    const client = await this.sql.getOpenConnection();
    try {
      const cfg = (
        await client.query(
          'SELECT enabled FROM meetings.meeting_commenting_configurations WHERE meeting_id=$1',
          [command.meetingId],
        )
      ).rows[0];
      const enabled = cfg?.enabled ?? true;
      const comment = MeetingComment.create(command.meetingId, command.authorId, command.comment, enabled);
      await client.query(
        `INSERT INTO meetings.meeting_comments (id, meeting_id, author_id, in_reply_to_comment_id, comment, create_date, is_removed, likes_count)
         VALUES ($1,$2,$3,$4,$5,$6,false,0)`,
        [comment.id.value, comment.getMeetingId(), comment.getAuthorId(), comment.getInReplyToCommentId(), comment.getComment(), comment.getCreateDate()],
      );
      this.uow.trackAggregate(comment);
      return comment.id.value;
    } finally { releaseIfNotInTransaction(client); }
  }
}
