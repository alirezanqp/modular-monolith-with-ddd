-- Meetings module tables and views

CREATE TABLE IF NOT EXISTS meetings.countries (
    code text PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings.members (
    id uuid PRIMARY KEY,
    login text NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings.meeting_group_proposals (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text NULL,
    location_city text NOT NULL,
    location_country_code text NOT NULL,
    proposal_user_id uuid NOT NULL,
    proposal_date timestamptz NOT NULL,
    status_code text NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings.meeting_groups (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text NULL,
    location_city text NOT NULL,
    location_country_code text NOT NULL,
    creator_id uuid NOT NULL,
    create_date timestamptz NOT NULL,
    payment_date_to timestamptz NULL
);

CREATE TABLE IF NOT EXISTS meetings.meeting_group_members (
    meeting_group_id uuid NOT NULL,
    member_id uuid NOT NULL,
    joined_date timestamptz NOT NULL,
    role_code text NOT NULL,
    is_active boolean NOT NULL,
    leave_date timestamptz NULL,
    CONSTRAINT pk_meeting_group_members PRIMARY KEY (meeting_group_id, member_id, joined_date)
);

CREATE TABLE IF NOT EXISTS meetings.meetings (
    id uuid PRIMARY KEY,
    meeting_group_id uuid NOT NULL,
    title text NOT NULL,
    term_start_date timestamptz NOT NULL,
    term_end_date timestamptz NOT NULL,
    description text NOT NULL,
    location_name text NOT NULL,
    location_address text NOT NULL,
    location_postal_code text NULL,
    location_city text NOT NULL,
    attendees_limit integer NULL,
    guests_limit integer NOT NULL,
    rsvp_term_start_date timestamptz NULL,
    rsvp_term_end_date timestamptz NULL,
    event_fee_value numeric(18, 2) NULL,
    event_fee_currency text NULL,
    creator_id uuid NOT NULL,
    create_date timestamptz NOT NULL,
    change_date timestamptz NULL,
    change_member_id uuid NULL,
    cancel_date timestamptz NULL,
    cancel_member_id uuid NULL,
    is_canceled boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS meetings.meeting_attendees (
    meeting_id uuid NOT NULL,
    attendee_id uuid NOT NULL,
    decision_date timestamptz NOT NULL,
    role_code text NULL,
    guests_number integer NULL,
    decision_changed boolean NOT NULL DEFAULT false,
    decision_changed_date timestamptz NULL,
    is_removed boolean NOT NULL DEFAULT false,
    removed_date timestamptz NULL,
    removing_member_id uuid NULL,
    removing_reason text NULL,
    became_not_attendee_date timestamptz NULL,
    fee_value numeric(18, 2) NULL,
    fee_currency text NULL,
    is_fee_paid boolean NOT NULL DEFAULT false,
    CONSTRAINT pk_meeting_attendees PRIMARY KEY (meeting_id, attendee_id, decision_date)
);

CREATE TABLE IF NOT EXISTS meetings.meeting_not_attendees (
    meeting_id uuid NOT NULL,
    member_id uuid NOT NULL,
    decision_date timestamptz NOT NULL,
    decision_changed boolean NOT NULL DEFAULT false,
    decision_changed_date timestamptz NULL,
    CONSTRAINT pk_meeting_not_attendees PRIMARY KEY (meeting_id, member_id, decision_date)
);

CREATE TABLE IF NOT EXISTS meetings.meeting_waitlist_members (
    meeting_id uuid NOT NULL,
    member_id uuid NOT NULL,
    sign_up_date timestamptz NOT NULL,
    is_signed_off boolean NOT NULL DEFAULT false,
    sign_off_date timestamptz NULL,
    is_moved_to_attendees boolean NOT NULL DEFAULT false,
    moved_to_attendees_date timestamptz NULL,
    CONSTRAINT pk_meeting_waitlist_members PRIMARY KEY (meeting_id, member_id, sign_up_date)
);

CREATE TABLE IF NOT EXISTS meetings.meeting_comments (
    id uuid PRIMARY KEY,
    meeting_id uuid NOT NULL,
    author_id uuid NOT NULL,
    in_reply_to_comment_id uuid NULL,
    comment text NULL,
    create_date timestamptz NOT NULL,
    edit_date timestamptz NULL,
    is_removed boolean NOT NULL DEFAULT false,
    removed_by_reason text NULL,
    removed_date timestamptz NULL,
    removed_by_member_id uuid NULL,
    likes_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS meetings.meeting_commenting_configurations (
    id uuid PRIMARY KEY,
    meeting_id uuid NOT NULL UNIQUE,
    enabled boolean NOT NULL DEFAULT true,
    CONSTRAINT fk_meeting_commenting_configurations_meetings
        FOREIGN KEY (meeting_id) REFERENCES meetings.meetings (id)
);

CREATE TABLE IF NOT EXISTS meetings.meeting_member_comment_likes (
    id uuid PRIMARY KEY,
    member_id uuid NOT NULL,
    meeting_comment_id uuid NOT NULL,
    CONSTRAINT fk_meeting_member_comment_likes_members
        FOREIGN KEY (member_id) REFERENCES meetings.members (id),
    CONSTRAINT fk_meeting_member_comment_likes_comments
        FOREIGN KEY (meeting_comment_id) REFERENCES meetings.meeting_comments (id)
);

CREATE TABLE IF NOT EXISTS meetings.member_subscriptions (
    id uuid PRIMARY KEY,
    expiration_date timestamptz NOT NULL
);

CREATE OR REPLACE VIEW meetings.v_countries AS
SELECT
    c.code,
    c.name
FROM meetings.countries AS c;

CREATE OR REPLACE VIEW meetings.v_members AS
SELECT
    m.id,
    m.name,
    m.login,
    m.email,
    m.first_name,
    m.last_name
FROM meetings.members AS m;

CREATE OR REPLACE VIEW meetings.v_meeting_groups AS
SELECT
    mg.id,
    mg.name,
    mg.description,
    mg.location_country_code,
    mg.location_city,
    mg.creator_id,
    mg.create_date,
    mg.payment_date_to
FROM meetings.meeting_groups AS mg;

CREATE OR REPLACE VIEW meetings.v_meeting_group_proposals AS
SELECT
    p.id,
    p.name,
    p.description,
    p.location_city,
    p.location_country_code,
    p.proposal_user_id,
    p.proposal_date,
    p.status_code
FROM meetings.meeting_group_proposals AS p;

CREATE OR REPLACE VIEW meetings.v_meetings AS
SELECT
    m.id,
    m.meeting_group_id,
    m.title,
    m.description,
    m.location_address,
    m.location_city,
    m.location_postal_code,
    m.term_start_date,
    m.term_end_date
FROM meetings.meetings AS m;

CREATE OR REPLACE VIEW meetings.v_meeting_details AS
SELECT
    m.id,
    m.meeting_group_id,
    m.title,
    m.term_start_date,
    m.term_end_date,
    m.description,
    m.location_name,
    m.location_address,
    m.location_postal_code,
    m.location_city,
    m.attendees_limit,
    m.guests_limit,
    m.rsvp_term_start_date,
    m.rsvp_term_end_date,
    m.event_fee_value,
    m.event_fee_currency,
    m.is_canceled
FROM meetings.meetings AS m;

CREATE OR REPLACE VIEW meetings.v_meeting_attendees AS
SELECT
    ma.meeting_id,
    ma.attendee_id,
    ma.decision_date,
    ma.role_code,
    ma.guests_number,
    ma.is_removed,
    ma.is_fee_paid,
    mem.first_name,
    mem.last_name
FROM meetings.meeting_attendees AS ma
INNER JOIN meetings.members AS mem
    ON ma.attendee_id = mem.id;

CREATE OR REPLACE VIEW meetings.v_meeting_comments AS
SELECT
    mc.id,
    mc.meeting_id,
    mc.author_id,
    mc.in_reply_to_comment_id,
    mc.comment,
    mc.create_date,
    mc.edit_date,
    mc.likes_count
FROM meetings.meeting_comments AS mc
WHERE mc.is_removed = false;

CREATE OR REPLACE VIEW meetings.v_member_meeting_groups AS
SELECT
    mg.id,
    mg.name,
    mg.description,
    mg.location_country_code,
    mg.location_city,
    mgm.member_id,
    mgm.role_code,
    mgm.is_active,
    mgm.joined_date
FROM meetings.meeting_groups AS mg
INNER JOIN meetings.meeting_group_members AS mgm
    ON mg.id = mgm.meeting_group_id;

CREATE OR REPLACE VIEW meetings.v_member_meetings AS
SELECT
    m.id,
    m.title,
    m.description,
    m.location_address,
    m.location_city,
    m.location_postal_code,
    m.term_start_date,
    m.term_end_date,
    ma.attendee_id,
    ma.is_removed,
    ma.role_code
FROM meetings.meetings AS m
INNER JOIN meetings.meeting_attendees AS ma
    ON m.id = ma.meeting_id;

CREATE OR REPLACE VIEW meetings.v_meeting_group_members AS
SELECT
    mgm.meeting_group_id,
    mgm.member_id,
    mgm.role_code,
    mgm.is_active,
    mgm.joined_date,
    mgm.leave_date
FROM meetings.meeting_group_members AS mgm;
